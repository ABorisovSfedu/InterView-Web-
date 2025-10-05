# Интеграция с Mod1_v2 - Система обработки аудио и NLP

## Обзор

Этот проект интегрирован с модулем Mod1_v2 для обработки аудио, транскрипции и извлечения структурированной информации с помощью NLP.

## Архитектура интеграции

```
┌─────────────────┐    WebSocket/REST    ┌─────────────────┐
│   Frontend      │ ──────────────────► │   Mod1_v2       │
│   SessionPage   │                      │   (ASR + Chunk) │
│   Port: 3000    │                      │   Port: 8080    │
└─────────────────┘                      └─────────────────┘
```

## Функциональность

### 🎤 Запись голоса
- **Real-time стриминг** аудио через WebSocket
- **Пакетная обработка** через REST API (fallback)
- **Автоматическая транскрипция** с помощью Whisper
- **Чанкинг текста** по предложениям

### 📡 WebSocket интеграция
- Подключение к `/v1/stream` endpoint
- Отправка аудио данных в реальном времени
- Получение чанков и финальных результатов
- Автоматическое переподключение при ошибках

### 🔄 REST API интеграция
- Пакетная транскрипция через `/v1/transcribe`
- Получение результатов через `/v1/session/{id}/text`
- Получение чанков через `/v1/session/{id}/chunks`

## Настройка

### 1. Переменные окружения

Скопируйте `mod1.env.example` в `.env` и настройте:

```bash
cp mod1.env.example .env
```

Основные настройки:
- `VITE_MOD1_BASE_URL` - URL Mod1 сервиса (по умолчанию: http://localhost:8080)
- `VITE_MOD1_API_KEY` - API ключ для аутентификации (опционально)

### 2. Запуск Mod1_v2

Убедитесь, что Mod1_v2 запущен и доступен:

```bash
# Проверка здоровья Mod1
curl http://localhost:8080/healthz
```

### 3. Запуск фронтенда

```bash
npm run dev
```

## Использование

### Запись голоса

1. **Проверьте статус Mod1** - индикатор в правом верхнем углу
2. **Нажмите "Начать запись"** - кнопка активна только при подключении к Mod1
3. **Говорите в микрофон** - аудио отправляется в реальном времени
4. **Нажмите "Остановить"** - завершение записи и обработка

### Результаты

После записи вы увидите:

- **Транскрипт** - полный текст записи
- **Чанки** - разбивка по предложениям с номерами
- **Метаданные** - длительность, язык, количество чанков

## API клиент

### Mod1Client

```typescript
import mod1Client from './api/mod1Client';

// Проверка здоровья
const isHealthy = await mod1Client.healthCheck();

// Пакетная транскрипция
const result = await mod1Client.transcribeFile({
  session_id: 'session_123',
  lang: 'ru-RU',
  audio_file: audioFile
});

// WebSocket подключение
mod1Client.connectWebSocket(
  sessionId,
  (message) => console.log('Received:', message),
  (error) => console.error('Error:', error),
  () => console.log('Disconnected')
);
```

## Структура данных

### ChunkData
```typescript
interface ChunkData {
  session_id: string;
  chunk_id: string;
  seq: number;
  text: string;
  overlap_prefix: string | null;
  lang: string;
}
```

### TranscribeResponse
```typescript
interface TranscribeResponse {
  session_id: string;
  text_full: string;
  lang: string;
  duration_sec: number;
  total_chunks: number;
}
```

## Обработка ошибок

### WebSocket ошибки
- Автоматическое переподключение (до 5 попыток)
- Fallback на REST API при недоступности WebSocket
- Отображение статуса подключения в UI

### Аудио ошибки
- Проверка разрешений микрофона
- Валидация формата аудио
- Обработка ошибок транскрипции

## Отладка

### Логи в консоли
```javascript
// Включить подробные логи
localStorage.setItem('debug', 'mod1:*');
```

### Проверка подключения
```bash
# Проверка Mod1
curl http://localhost:8080/healthz

# Проверка WebSocket
wscat -c ws://localhost:8080/v1/stream?session_id=test
```

## Производительность

### Оптимизации
- **Chunked отправка** - аудио отправляется частями по 1 секунде
- **WebSocket pooling** - переиспользование соединений
- **Lazy loading** - загрузка результатов по требованию

### Рекомендации
- Используйте WebSocket для real-time обработки
- Fallback на REST API для надежности
- Мониторьте статус подключения

## Безопасность

### Аутентификация
- API ключи через переменные окружения
- HMAC подписи для webhook'ов (если настроено)

### Приватность
- Аудио данные не сохраняются локально
- Сессии имеют уникальные ID
- Автоматическая очистка временных данных

## Расширение

### Добавление новых языков
```typescript
// В mod1Client.ts
const supportedLanguages = ['ru-RU', 'en-US', 'de-DE'];
```

### Кастомные обработчики
```typescript
// В SessionPage.tsx
const handleMod1Message = (message: WebSocketMessage) => {
  // Ваша логика обработки
};
```

## Поддержка

При возникновении проблем:

1. Проверьте статус Mod1 сервиса
2. Убедитесь в правильности переменных окружения
3. Проверьте логи в консоли браузера
4. Убедитесь в доступности портов 3000 и 8080








