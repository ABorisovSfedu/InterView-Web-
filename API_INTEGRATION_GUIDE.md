# Руководство по интеграции API модулей

Это руководство содержит примеры интеграции веб-приложения с Mod1, Mod2 и Mod3 через единый слой API-клиентов.

## 🏗️ Архитектура

```
┌─────────────────┐    API Calls    ┌─────────────────┐
│   Web Frontend   │ ──────────────► │   API Layer     │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
                                              │
                                              ▼
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Mod1_v2   │   Mod2-v1   │   Mod3-v1   │   Web       │
│   (ASR)     │   (NLP)     │(Visual Map) │ (Backend)   │
│   :8080     │   :8001     │   :9001     │   :5001     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## 📁 Структура API клиентов

```
src/api/
├── config.ts          # Базовые настройки и fetchJson
├── mod1.ts           # Клиент транскрипции аудио
├── mod2.ts           # Клиент NLP обработки
├── mod3.ts           # Клиент визуального маппинга
└── web.ts            # Клиент бэкенда оркестратора

src/flows/
└── voiceToLayout.ts   # End-to-end поток генерации

src/components/
└── ApiIntegrationButtons.tsx  # UI компоненты
```

## 🔧 Конфигурация

### Переменные среды (.env.local)

```bash
# Базовые URL модулей
VITE_MOD1_BASE_URL=http://localhost:8080
VITE_MOD2_BASE_URL=http://localhost:8001  
VITE_MOD3_BASE_URL=http://localhost:9001
VITE_API_BASE_URL=http://localhost:5001

# Настройки безопасности
VITE_MOD1_API_KEY=
VITE_MOD2_API_KEY=
VITE_MOD3_API_KEY=

# Настройки обработки
VITE_DEFAULT_LANGUAGE=ru-RU
VITE_AUDIO_CHUNK_SIZE=1000
VITE_MAX_COMPONENTS_PER_SECTION=5
VITE_FUZZY_THRESHOLD=0.8
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install uuid
```

### 2. Использование в компоненте

```tsx
import { usePageStore } from '../stores/usePageStore';
import { ApiIntegrationButtons } from '../components/ApiIntegrationButtons';

function SessionPage({ sessionId }: { sessionId: string }) {
  const {
    generateFromVoice,
    generateFromText,
    isGenerating,
    generationProgress,
    generationStep
  } = usePageStore();

  return (
    <div>
      {/* Ваш существующий UI */}
      <PageRenderer />
      
      {/* Новые кнопки API */}
      <ApiIntegrationButtons 
        sessionId={sessionId}
        onLayoutGenerated={(count) => console.log(`Создано ${count} компонентов`)}
      />
      
      {/* Индикатор прогресса */}
      {isGenerating && (
        <div className="progress-bar">
          {generationStep}: {generationProgress}%
        </div>
      )}
    </div>
  );
}
```

## 📋 Примеры curl запросов

### Проверка статуса модулей

```bash
# Mod1_v2 (ASR)
curl -X GET "http://localhost:8080/healthz"

# Mod2-v1 (NLP)
curl -X GET "http://localhost:8001/healthz"

# Mod3-v1 (Visual Mapping)  
curl -X GET "http://localhost:9001/healthz"

# Web Backend (Or-chestrator)
curl -X GET "http://localhost:5001/health"
```

### Полный поток генерации layout

#### 1️⃣ Транскрипция аудио (Mod1)

```bash
# Создать dummy аудио файл для тестирования
ffmpeg -f lavfi -i "sine=frequency=440:duration=1" -acodec libopus test_audio.wav

# Отправить аудио для транскрипции
curl -X POST "http://localhost:8080/v1/transcribe?session_id=test_$(date +%s)&lang=ru-RU&timestamp=$(date +%s%3N)" \
  -F "file=@test_audio.wav" \
  -H "X-Client: interview-web" \
  -H "X-Request-Id: req_$(date +%s)"
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "session_id": "test_1642123456789",
  "chunk_id or text": "Сделай сайт с кнопкой и изображением...",
  "confidence": 0.95,
  "language": "ru"
}
```

#### 2️⃣ NLP обработка текста (Mod2)

```bash
# Отправка полного текста для анализа
curl -X POST "http://localhost:8001/v2/ingest/full" \
  -H "Content-Type: application/json" \
  -H "X-Client: interview-web" \
  -H "X-Session-Id: test_1642123456789" \
  -d '{
    "session_id": "test_1642123456789",
    "lang": "ru-RU",
    "text_full": "Сделай сайт с кнопкой и изображением в шапке, текстом в основной части"
  }'

# Получение извлеченных entities
curl -X GET "http://localhost:8001/v2/session/test_1642123456789/entities" \
  -H "X-Client: interview-web" \
  -H "X-Session-Id: test_1642123456789"
```

**Ожидаемый ответ entities:**
```json
{
  "status": "ok",
  "session_id": "test_1642123456789",
  "entities": ["сайт", "кнопка", "изображение", "шапка", "текст"],
  "keyphrases": ["сайт с кнопкой", "изображение в шапке", "текст в основной части"],
  "chunks_processed": 1
}
```

#### 3️⃣ Визуальное сопоставление (Mod3)

```bash
# Сопоставление entities с UI компонентами
curl -X POST "http://localhost:9001/v1/map" \
  -H "Content-Type: application/json" \
  -H "X-Client: interview-web" \
  -H "X-Session-Id: test_1642123456789" \
  -d '{
    "session_id": "test_1642123456789",
    "entities": ["сайт", "кнопка", "изображение", "шапка", "текст"],
    "keyphrases": ["сайт с кнопкой", "изображение в шапке", "текст в основной части"],
    "template": "hero-main-footer"
  }'

# Получение кэшированного layout
curl -X GET "http://localhost:9001/v1/layout/test_1642123456789" \
  -H "X-Client: interview-web" \
  -H "X-Session-Id: test_1642123456789"
```

**Ожидаемый ответ от Mod3:**
```json
{
  "status": "ok",
  "session_id": "test_1642123456789",
  "layout": {
    "template": "hero-main-footer",
    "sections": {
      "hero": [
        {
          "component": "ui.hero",
          "props": {
            "title": "Welcome to Our Platform",
            "backgroundImage": "/images/hero-bg.jpg"
          },
          "confidence": 0.9,
          "match_type": "exact"
        }
      ],
      "main": [
        {
          "component": "ui.button",
          "props": {
            "text": "Нажми меня",
            "variant": "primary"
          },
          "confidence": 1.0,
          "match_type": "exact"
        },
        {
          "component": "ui.text",
          "props": {
            "text": "Основной текст контента"
          },
          "confidence": 1.0,
          "match_type": "exact"
        }
      ],
      "footer": []
    },
    "count": 3
  },
  "matches": [
    {
      "term": "кнопка",
      "component": "ui.button",
      "confidence": 1.0,
      "match_type": "exact"
    },
    {
      "term": "текст", 
      "component": "ui.text",
      "confidence": 1.0,
      "match_type": "exact"
    }
  ]
}
```

#### 4️⃣ Сохранение в бэкенде (Web)

```bash
# Сохранение layout в бэкенде
curl -X POST "http://localhost:5001/web/v1/session/test_1642123456789/layout" \
  -H "Content-Type: application/json" \
  -H "X-Client: interview-web" \
  -H "X-Session-Id: test_1642123456789" \
  -d '{
    "layout": {
      "template": "hero-main-footer",
      "sections": {
        "hero": [{"component": "ui.hero", "props": {...}}],
        "main": [{"component": "ui.button", "props": {...}}, {"component": "ui.text", "props": {...}}],
        "footer": []
      },
      "metadata": {
        "sessionId": "test_1642123456789",
        "source": "mod3",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    }
  }'

# Загрузка сохраненного layout
curl -X GET "http://localhost:5001/web/v1/session/test_1642123456789/layout" \
  -H "X-Client: interview-web" \
  -H "X-Session-Id: test_1642123456789"
```

## 🧩 Использование API клиентов

### Модуль Mod1 (Транскрипция)

```tsx
import { mod1Client } from '../api/mod1';

// Транскрипция аудио файла
const result = await mod1Client.transcribe({
  file: audioFile,
  sessionId: 'my_session_123',
  chunkId: 'chunk_001'
});

console.log('Транскрипция:', result.text);
```

### Модуль Mod2 (NLP)

```tsx
import { mod2Client } from '../api/mod2';

// Анализ текста
await mod2Client.ingestFullText({
  session_id: 'my_session_123',
  lang: 'ru-RU',
  text_full: 'Создай красивый сайт с кнопками'
});

// Получение entities
const entities = await mod2Client.getEntities('my_session_123');
console.log('Entities:', entities.entities);
```

### Модуль Mod3 (Визуальное сопоставление)

```tsx
import { mod3Client } from '../api/mod3';

// Сопоставление терминов с компонентами
const layout = await mod3Client.mapEntities({
  session_id: 'my_session_123',
  entities: ['кнопка', 'изображение', 'текст'],
  keyphrases: ['кнопка действие', 'изображение товара'],
  template: 'hero-main-footer'
});

console.log('Сгенерированы компоненты:', layout.layout.count);
```

### Web Backend (Оркестратор)

```tsx
import { webClient } from '../api/web';

// Сохранение layout
const saved = await webClient.saveLayout('my_session_123', {
  template: 'hero-main-footer',
  sections: {
    hero: [...],
    main: [...],
    footer: [...]
  }
});

// Загрузка layout
const loaded = await webClient.loadLayout('my_session_123');
```

## 🔄 End-to-End поток

### Автоматическая генерация голосом

```tsx
import { convertVoiceToLayout } from '../flows/voiceToLayout';

const result = await convertVoiceToLayout(audioFile, {
  sessionId: 'my_session_123',
  autoSave: true,
  template: 'hero-main-footer'
});

if (result.success) {
  console.log('Layout создан:', result.finalLayout);
  console.log('Компонентов:', result.finalLayout.metadata.count);
} else {
  console.error('Ошибка:', result.error);
}
```

### Генерация из текста

```tsx
import { convertTextToLayout } from '../flows/voiceToLayout';

const result = await convertTextToLayout(
  'Создай сайт с большими кнопками и красивыми изображениями',
  'my_session_123'
);
```

## 🛠️ Обработка ошибок

### Toast уведомления

```tsx
import { useToast, toastHelpers } from '../utils/toast';

function MyComponent() {
  const { addToast } = useToast();
  
  const handleError = (error: Error) => {
    if (error.message.includes('Mod3')) {
      addToast(toastHelpers.mod3MappingFailed(() => {
        // Действие при ошибке Mod3
        mod3Client.clearCache();
        retryGeneration();
      }));
    } else if (error.message.includes('network')) {
      addToast(toastHelpers.networkError('Mod1', retry));
    } else {
      addToast({
        type: 'error',
        title: 'Ошибка генерации',
        message: error.message
      });
    }
  };
}
```

### Retry механизмы

API клиенты автоматически выполняют retry для сетевых ошибок и 5xx статусов:

```tsx
// Конфигурация retry в config.ts
const response = await fetchJson(url, {
  method: 'POST',
  retries: 3,        // Количество попыток
  timeout: 10000     // Таймаут в миллисекундах
});
```

## 🔍 Отладка и логирование

### Dev логирование

В режиме разработки (`NODE_ENV=development`) все запросы логируются:

```typescript
🔄 API Request [mod1]
URL: POST http://localhost:8080/v1/transcribe?session_id=test_123
Request ID: req_1642123456789_abc123
Session ID: test_123
Status: 200 OK
Response data: { status: "ok", text: "..." }

✅ Транскрипция успешна:
source: mod1
text: Сделай сайт...
sessionId: test_123
```

### Диагностика проблем

```bash
# Проверка связности модулей
curl -s http://localhost:8080/healthz | jq '.status'  # Mod1
curl -s http://localhost:8001/healthz | jq '.status'  # Mod2  
curl -s http://localhost:9001/healthz | jq '.status'  # Mod3
curl -s http://localhost:5001/health | jq '.status'   # Backend

# Проверка endpoint'ов
curl -s http://localhost:8001/v2/session/test_123/entities | jq '.entities'
curl -s http://localhost:9001/v1/components | jq '.components[0:3]'
```

## 📊 Мониторинг производительности

### Метрики API запросов

Система автоматически собирает метрики:

- Время выполнения запросов
- Количество retry попыток
- Размеры ответов
- Ошибки по типам

### Оптимизация производительности

1. **Кэширование компонентов** - Mod3 компоненты кэшируются на 60 секунд
2. **Debounced сохранение** - Layout автоматически сохраняется через 500ms после изменений  
3. **Компрессия** - Адаптированная передача данных между модулями
4. **Parallel запросы** - Где возможно, используется параллельная обработка

## 🔐 Безопасность

### Заголовки безопасности

Все запросы автоматически включают заголовки:

```
X-Client: interview-web
X-Request-Id: req_1642123456789_abc123def456
X-Session-Id: session_1642123456789_user123
User-Agent: InterviewWebApp/1.0.0
Content-Type: application/json
```

### Обработка сессий

- Автоматическая генерация session_id через UUID
- Persistence сессий в localStorage
- Сквозная передача session_id через все модули

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в DevTools консоли
2. Используйте curl примеры для диагностики модулей
3. Проверьте переменные среды (.env.local)
4. Убедитесь, что все модули запущены на правильных портах

**Счастливой разработки! 🚀**

