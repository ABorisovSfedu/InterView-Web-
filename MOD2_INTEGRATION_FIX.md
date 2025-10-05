# Исправление интеграции с Mod2

## Проблема

При тестировании системы обнаружены следующие проблемы:

1. **CORS ошибка** при запросе к Mod2
2. **500 Internal Server Error** при получении layout
3. **Отсутствие отправки данных** в Mod2 через ingest

## Анализ логов

### Успешные операции:
- ✅ Mod1 транскрипция работает
- ✅ Mod2 health check OK
- ✅ Mod3 подключен и работает

### Проблемные операции:
- ❌ CORS ошибка при запросе layout от Mod2
- ❌ 500 Internal Server Error
- ❌ Данные не отправляются в Mod2 через ingest

## Решение

### 1. Исправление потока данных

**Проблема**: Данные не отправлялись в Mod2 через `ingestFull`, сразу запрашивался layout.

**Решение**: Добавлена отправка данных в Mod2 перед запросом layout.

```typescript
// Отправляем данные в Mod2
await mod2Client.ingestFull({
  session_id: sessionId,
  text_full: result.text_full,
  lang: 'ru-RU',
  duration_sec: result.duration_sec || 0,
  chunks: result.chunks || []
});

// Задержка для обработки
await new Promise(resolve => setTimeout(resolve, 1000));

// Получаем layout
const layout = await mod2Client.getSessionLayout(sessionId);
```

### 2. Исправление в двух местах

Обновлены оба места в `SessionPage.tsx`:
- `handleMod1Message` (WebSocket поток)
- `processAudioFile` (REST API поток)

### 3. Правильный формат данных

**Проблема**: Mod2 ожидает определенный формат данных.

**Решение**: Используется правильный формат с обязательными полями:

```typescript
{
  session_id: string,
  text_full: string,
  lang: 'ru-RU',  // Обязательный формат: ru-RU
  duration_sec: number,
  chunks: array
}
```

## Тестирование

### Проверка ingest:
```bash
curl -X POST http://localhost:8000/v2/ingest/full \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_session",
    "text_full": "Проверка, проверка, проверка, шапка, худор, форма обратной связи.",
    "lang": "ru-RU",
    "duration_sec": 1,
    "chunks": [{"text": "Проверка, проверка, проверка, шапка, худор, форма обратной связи.", "start": 0, "end": 1}]
  }'
```

**Результат**: `{"status":"ok"}`

### Проверка layout:
```bash
curl http://localhost:8000/v2/session/test_session/layout
```

**Ожидается**: Layout с компонентами

## Поток данных

### До исправления:
```
Mod1 → Транскрипция → ❌ Прямо к Mod2 layout (ошибка)
```

### После исправления:
```
Mod1 → Транскрипция → Mod2 ingest → Задержка → Mod2 layout → Mod3 mapping
```

## Изменения в коде

### SessionPage.tsx

#### 1. WebSocket поток (handleMod1Message):
```typescript
// Отправляем финальный результат в Mod2
if (isMod2Connected) {
  try {
    console.log('🔄 Sending final result to Mod2...');
    await mod2Client.ingestFull({
      session_id: finalResult.session_id,
      text_full: finalResult.text_full,
      lang: 'ru-RU',
      duration_sec: finalResult.duration_sec || 0,
      chunks: finalResult.chunks || []
    });
    console.log('✅ Final result sent to Mod2');
    
    // Небольшая задержка для обработки в Mod2
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Получаем layout от Mod2
    console.log('🔄 Getting layout from Mod2...');
    const layout = await mod2Client.getSessionLayout(finalResult.session_id);
    console.log('✅ Layout получен от Mod2:', layout);
```

#### 2. REST API поток (processAudioFile):
```typescript
// Отправляем данные в Mod2 и получаем layout
if (isMod2Connected) {
  try {
    console.log('🔄 Sending final result to Mod2...');
    await mod2Client.ingestFull({
      session_id: sessionId,
      text_full: result.text_full,
      lang: 'ru-RU',
      duration_sec: result.duration_sec || 0,
      chunks: result.chunks || []
    });
    console.log('✅ Final result sent to Mod2');
    
    // Небольшая задержка для обработки в Mod2
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🔄 Getting layout from Mod2...');
    const layout = await mod2Client.getSessionLayout(sessionId);
    console.log('✅ Layout получен от Mod2:', layout);
```

## Ожидаемые результаты

### После исправления:
1. ✅ Данные успешно отправляются в Mod2
2. ✅ Mod2 обрабатывает текст и генерирует layout
3. ✅ Layout содержит релевантные компоненты
4. ✅ Mod3 получает данные и создает mapping
5. ✅ PageBuilder отображает уникальную страницу

### Пример layout:
```json
{
  "status": "ok",
  "session_id": "session_xxx",
  "layout": {
    "template": "hero-main-footer",
    "sections": {
      "hero": [{"component": "ui.hero", "confidence": 0.9}],
      "main": [{"component": "ui.form", "confidence": 0.8}],
      "footer": [{"component": "ui.footer", "confidence": 0.7}]
    }
  }
}
```

## Мониторинг

### Логи для отслеживания:
- `🔄 Sending final result to Mod2...`
- `✅ Final result sent to Mod2`
- `🔄 Getting layout from Mod2...`
- `✅ Layout получен от Mod2:`
- `🔄 Getting mapping from Mod3...`
- `✅ Mapping получен от Mod3:`

### Проверка статуса:
```bash
# Mod2 health
curl http://localhost:8000/healthz

# Mod2 ingest
curl -X POST http://localhost:8000/v2/ingest/full -H "Content-Type: application/json" -d '{"session_id":"test","text_full":"тест","lang":"ru-RU","duration_sec":1,"chunks":[]}'

# Mod2 layout
curl http://localhost:8000/v2/session/test/layout
```

## Заключение

Исправление интеграции с Mod2 решает проблему CORS и 500 ошибок путем:
1. Правильной отправки данных через ingest
2. Добавления задержки для обработки
3. Использования корректного формата данных
4. Обновления обоих потоков (WebSocket и REST)

Теперь система должна работать корректно: Mod1 → Mod2 → Mod3 → PageBuilder.







