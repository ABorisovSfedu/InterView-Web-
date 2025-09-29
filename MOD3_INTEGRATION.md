# Интеграция с Mod3-v1 - Visual Elements Mapping

## Обзор

Mod3-v1 интегрирован в систему для сопоставления NLP результатов с визуальными элементами интерфейса. Модуль завершает цепочку обработки: Mod1 (ASR) → Mod2 (NLP) → Mod3 (Visual Mapping).

## Архитектура интеграции

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Mod1_v2       │ ──────────────────► │   Mod2-v1       │ ──────────────► │   Mod3-v1       │
│   (ASR + Chunk) │                      │   (NLP + Layout)│                 │   (Visual Map)  │
│   Port: 8080    │                      │   Port: 8000    │                 │   Port: 9000    │
└─────────────────┘                      └─────────────────┘                 └─────────────────┘
```

## Реализованные компоненты

### 1. API Клиент (mod3Client.ts)

**Файл**: `src/api/mod3Client.ts`

**Основные функции**:
- `mapEntities()` - Сопоставление сущностей с layout'ом
- `getLayout()` - Получение сохраненного layout'а
- `getVocab()` - Получение словаря терминов
- `syncVocab()` - Синхронизация словаря
- `healthCheck()` - Проверка здоровья сервиса
- `getMappingStats()` - Статистика сопоставлений
- `getTemplates()` - Доступные шаблоны
- `createCustomMapping()` - Создание кастомных сопоставлений
- `getMappingHistory()` - История сопоставлений

**Типы данных**:
```typescript
interface MapRequest {
  session_id: string;
  entities: string[];
  keyphrases: string[];
  template?: string;
}

interface MapResponse {
  status: string;
  session_id: string;
  layout: {
    template: string;
    sections: LayoutSection;
    count: number;
  };
  matches: ComponentMatch[];
}

interface ComponentMatch {
  term: string;
  component: string;
  component_type: string;
  confidence: number;
  match_type: 'exact' | 'fuzzy' | 'synonym' | 'default';
}
```

### 2. Интеграция в SessionPage

**Файл**: `src/components/SessionPage.tsx`

**Добавленные состояния**:
```typescript
// Mod3 интеграция состояния
const [isMod3Connected, setIsMod3Connected] = useState<boolean>(false);
const [mod3Status, setMod3Status] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
const [mod3VocabData, setMod3VocabData] = useState<any>(null);
const [showMod3Vocab, setShowMod3Vocab] = useState<boolean>(false);
```

**Обновленный тип VoiceMessage**:
```typescript
type VoiceMessage = {
  // ... существующие поля
  mod3Mapping?: MapResponse;
};
```

**Поток обработки**:
1. Mod1 обрабатывает аудио и возвращает транскрипцию
2. Mod2 анализирует текст и генерирует layout
3. Mod3 сопоставляет компоненты с визуальными элементами
4. UI отображает результаты всех трех модулей

### 3. UI Компоненты

**Статус индикаторы**:
- Индикатор подключения Mod3 (оранжевый цвет)
- Кнопка загрузки словаря Mod3
- Ссылка на API документацию Mod3

**Отображение результатов**:
- Секция "Результаты Visual Mapping Mod3"
- Детали сопоставлений с уверенностью
- Типы сопоставлений (exact, fuzzy, synonym, default)
- Визуальные индикаторы для разных типов

**Словарь терминов**:
- Отдельная секция для Mod3 словаря
- Отображение терминов, категорий и синонимов
- Оранжевая цветовая схема для отличия от Mod2

### 4. Конфигурация

**Файл**: `modules.env`

**Добавленные переменные**:
```env
# Базовый URL для Mod3 сервиса (Visual Elements Mapping)
VITE_MOD3_BASE_URL=http://localhost:9000

# API ключи для аутентификации (опционально)
VITE_MOD3_API_KEY=

# Настройки Visual Mapping
VITE_VISUAL_MAPPING_ENABLED=true
VITE_FUZZY_THRESHOLD=0.8
VITE_MAX_COMPONENTS_PER_SECTION=5
```

## Алгоритм работы

### 1. Инициализация
```typescript
// Проверка здоровья Mod3 при загрузке страницы
const isMod3Healthy = await mod3Client.healthCheck();
if (isMod3Healthy) {
  setMod3Status('connected');
  setIsMod3Connected(true);
}
```

### 2. Обработка результатов
```typescript
// После получения layout от Mod2
if (isMod3Connected && layout && layout.layout) {
  // Извлечение entities из компонентов
  const entities: string[] = [];
  Object.values(layout.layout.sections).forEach((section: any) => {
    if (Array.isArray(section)) {
      section.forEach((comp: any) => {
        if (typeof comp === 'object' && comp.component) {
          const componentName = comp.component.replace('ui.', '').replace('ui-', '');
          entities.push(componentName);
        }
      });
    }
  });
  
  // Отправка в Mod3 для сопоставления
  mod3Mapping = await mod3Client.mapEntities({
    session_id: sessionId,
    entities,
    keyphrases: [transcript],
    template: layout.layout.template || 'hero-main-footer'
  });
}
```

### 3. Отображение результатов
- **Шаблон Layout**: Название и количество секций
- **Секции с уверенностью**: Компоненты с процентами уверенности
- **Детали сопоставлений**: Термины → компоненты с типами сопоставления

## Типы сопоставлений

1. **exact** - Точное совпадение термина
2. **fuzzy** - Нечеткое совпадение (RapidFuzz, порог 0.8)
3. **synonym** - Совпадение по синонимам
4. **default** - Значение по умолчанию

## Цветовая схема

- **Mod1**: Зеленый (ASR)
- **Mod2**: Фиолетовый (NLP)
- **Mod3**: Оранжевый (Visual Mapping)

## API Endpoints Mod3

- `POST /v1/map` - Сопоставление сущностей с layout'ом
- `GET /v1/layout/{session_id}` - Получение сохраненного layout'а
- `GET /v1/vocab` - Получение словаря терминов
- `POST /v1/vocab/sync` - Синхронизация словаря
- `GET /healthz` - Проверка здоровья
- `GET /v1/stats/{session_id}` - Статистика сопоставлений
- `GET /v1/templates` - Доступные шаблоны
- `POST /v1/mappings` - Создание кастомных сопоставлений
- `GET /v1/history/{session_id}` - История сопоставлений

## Запуск системы

### Mod3-v1:
```bash
cd Mod3-v1
docker compose up --build -d
# Доступен на http://localhost:9000
```

### Проверка работы:
```bash
# Mod3
curl http://localhost:9000/healthz
```

## Результат интеграции

Система теперь предоставляет полный цикл обработки:

1. **Транскрипция аудио** (Mod1) → текст
2. **NLP анализ** (Mod2) → сущности и layout
3. **Visual mapping** (Mod3) → сопоставление с UI компонентами
4. **Готовый результат** → layout с уверенностью сопоставления

### Пример итогового результата:
```json
{
  "session_id": "abc123",
  "transcript": "Создайте кнопку для отправки формы",
  "layout": {
    "template": "hero-main-footer",
    "sections": {
      "hero": [{"component": "Hero", "confidence": 1.0, "match_type": "default"}],
      "main": [
        {"component": "ui.button", "confidence": 1.0, "match_type": "exact"},
        {"component": "ui.form", "confidence": 1.0, "match_type": "exact"}
      ],
      "footer": []
    },
    "count": 3
  },
  "matches": [
    {
      "term": "кнопка",
      "component": "ui.button",
      "component_type": "ui.button",
      "confidence": 1.0,
      "match_type": "exact"
    },
    {
      "term": "форма",
      "component": "ui.form",
      "component_type": "ui.form",
      "confidence": 1.0,
      "match_type": "exact"
    }
  ]
}
```

## Статус интеграции

✅ **Завершено**:
- API клиент для Mod3
- Интеграция в SessionPage
- UI компоненты для отображения результатов
- Конфигурация переменных окружения
- Типизация TypeScript
- Обработка ошибок

🔄 **В процессе**:
- Тестирование полной интеграции

📋 **Планируется**:
- Оптимизация производительности
- Кэширование результатов
- Расширенная статистика
- A/B тестирование алгоритмов сопоставления
