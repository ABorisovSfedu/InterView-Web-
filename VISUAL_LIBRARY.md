# Библиотека визуальных элементов

## Обзор

Библиотека визуальных элементов - это система для автоматического построения веб-страниц на основе данных от Mod3. Она преобразует результаты сопоставления NLP с визуальными элементами в готовые HTML-страницы.

## Архитектура

```
Mod3 Data → VisualLibrary → PageBuilder → Rendered Page
```

### Компоненты системы:

1. **VisualLibrary** - Библиотека визуальных компонентов
2. **PageBuilder** - Конструктор страниц с предварительным просмотром
3. **Интеграция с SessionPage** - Модальное окно для построения страниц

## VisualLibrary.tsx

### Основные функции:

- **Визуальные компоненты**: 50+ готовых UI компонентов
- **Рендеринг**: Автоматическое преобразование данных в React компоненты
- **Конвертация**: Преобразование данных Mod3 в PageLayout
- **Типизация**: Полная поддержка TypeScript

### Категории компонентов:

#### UI Components
- `ui.button` - Кнопки с различными вариантами
- `ui.input` - Поля ввода
- `ui.textarea` - Многострочные поля
- `ui.badge` - Бейджи и метки
- `ui.card` - Карточки контента

#### Layout Components
- `ui.container` - Контейнеры
- `ui.section` - Секции страницы
- `ui.grid` - Сетки
- `ui.flex` - Flexbox контейнеры

#### Content Components
- `ui.heading` - Заголовки (h1-h6)
- `ui.paragraph` - Параграфы
- `ui.list` - Списки (упорядоченные и неупорядоченные)

#### Form Components
- `ui.form` - Формы
- `ui.label` - Метки полей
- `ui.select` - Выпадающие списки
- `ui.checkbox` - Чекбоксы
- `ui.radio` - Радиокнопки

#### Navigation Components
- `ui.nav` - Навигация
- `ui.navbar` - Навигационная панель
- `ui.breadcrumb` - Хлебные крошки

#### Media Components
- `ui.image` - Изображения
- `ui.video` - Видео

#### Icon Components
- `ui.icon` - Иконки (25+ типов)

#### Special Components
- `ui.hero` - Hero секции
- `ui.footer` - Подвалы
- `ui.testimonial` - Отзывы
- `ui.pricing` - Тарифные планы

### API функций:

```typescript
// Рендеринг компонента
renderVisualComponent(component: VisualComponent): React.ReactElement

// Рендеринг секции
renderSection(sectionName: string, components: VisualComponent[]): React.ReactElement

// Рендеринг страницы
renderPage(layout: PageLayout): React.ReactElement

// Конвертация данных Mod3
convertMod3ToPageLayout(mod3Data: MapResponse): PageLayout
```

## PageBuilder.tsx

### Возможности:

- **Предварительный просмотр**: Режимы desktop/tablet/mobile
- **Редактирование**: Изменение компонентов и свойств
- **История изменений**: Отмена/повтор действий
- **Экспорт/Импорт**: Сохранение и загрузка страниц
- **Генерация кода**: HTML и CSS код

### Интерфейс:

#### Панель инструментов:
- Режимы предварительного просмотра (desktop/tablet/mobile)
- Полноэкранный режим
- Кнопки действий (отменить/повторить/сохранить/экспорт/импорт)

#### Боковая панель:
- **Превью**: Обзор секций и компонентов
- **Код**: Генерация HTML и CSS
- **Настройки**: Метаданные страницы

#### Область предварительного просмотра:
- Адаптивный просмотр
- Реальное отображение компонентов
- Интерактивные элементы

### API:

```typescript
interface PageBuilderProps {
  mod3Data?: MapResponse;
  onPageChange?: (pageLayout: PageLayout) => void;
  onSave?: (pageLayout: PageLayout) => void;
  className?: string;
}
```

## Интеграция с SessionPage

### Добавленные возможности:

- **Кнопка "Конструктор страниц"**: Открывает модальное окно
- **Модальное окно**: Полноэкранный PageBuilder
- **Автоматическая загрузка**: Данные от Mod3 передаются автоматически

### Использование:

1. Запишите аудио и получите результаты от Mod3
2. Нажмите кнопку "🎨 Конструктор страниц"
3. Откроется модальное окно с PageBuilder
4. Редактируйте страницу и сохраните результат

## Примеры использования

### Базовое использование:

```typescript
import { VisualLibrary, PageBuilder } from './components/visual';

// Данные от Mod3
const mod3Data: MapResponse = {
  status: 'ok',
  session_id: 'abc123',
  layout: {
    template: 'hero-main-footer',
    sections: {
      hero: [{ component: 'ui.hero', props: { title: 'Добро пожаловать' } }],
      main: [
        { component: 'ui.button', props: { text: 'Начать' } },
        { component: 'ui.form', props: {} }
      ],
      footer: [{ component: 'ui.footer', props: { copyright: '2024' } }]
    },
    count: 3
  },
  matches: [
    {
      term: 'кнопка',
      component: 'ui.button',
      component_type: 'ui.button',
      confidence: 1.0,
      match_type: 'exact'
    }
  ]
};

// Конвертация в PageLayout
const pageLayout = convertMod3ToPageLayout(mod3Data);

// Рендеринг страницы
const renderedPage = renderPage(pageLayout);
```

### Использование PageBuilder:

```typescript
<PageBuilder
  mod3Data={mod3Data}
  onPageChange={(layout) => {
    console.log('Страница изменена:', layout);
  }}
  onSave={(layout) => {
    // Сохранение страницы
    savePage(layout);
  }}
/>
```

## Расширение библиотеки

### Добавление нового компонента:

```typescript
// В VisualComponents объект
'ui.custom': ({ text, ...props }: any) => (
  <div className="custom-component" {...props}>
    {text || 'Кастомный компонент'}
  </div>
)
```

### Добавление нового типа секции:

```typescript
// В convertMod3ToPageLayout функции
if (sectionName === 'custom') {
  // Специальная обработка
}
```

## Конфигурация

### Настройки компонентов:

```typescript
interface VisualComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: VisualComponent[];
  confidence?: number;
  matchType?: string;
}
```

### Настройки страницы:

```typescript
interface PageLayout {
  template: string;
  sections: {
    [key: string]: VisualComponent[];
  };
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

## Производительность

### Оптимизации:

- **Мемоизация**: React.memo для компонентов
- **Ленивая загрузка**: Компоненты загружаются по требованию
- **Виртуализация**: Для больших списков компонентов
- **Кэширование**: Результаты рендеринга

### Рекомендации:

- Используйте простые компоненты для лучшей производительности
- Ограничивайте количество вложенных компонентов
- Применяйте мемоизацию для часто изменяющихся компонентов

## Отладка

### Инструменты:

- **React DevTools**: Для отладки компонентов
- **Console logs**: Информация о сопоставлении
- **Визуальные индикаторы**: Показ confidence и matchType

### Логирование:

```typescript
// Включение отладочной информации
const debugMode = process.env.NODE_ENV === 'development';

if (debugMode) {
  console.log('Component rendered:', component.type, component.confidence);
}
```

## Статус разработки

✅ **Завершено**:
- Базовая библиотека визуальных компонентов
- PageBuilder с предварительным просмотром
- Интеграция с SessionPage
- Поддержка всех основных UI компонентов
- Экспорт/импорт страниц
- Генерация HTML/CSS кода

🔄 **В процессе**:
- Тестирование с реальными данными Mod3
- Оптимизация производительности

📋 **Планируется**:
- Drag & Drop редактор
- Темы и стили
- Анимации и переходы
- Мобильная оптимизация
- SEO оптимизация
- A/B тестирование компонентов

## Заключение

Библиотека визуальных элементов предоставляет мощный инструмент для автоматического создания веб-страниц на основе анализа речи. Она интегрируется с Mod3 и предоставляет интуитивный интерфейс для редактирования и настройки созданных страниц.

Система готова к использованию и может быть легко расширена новыми компонентами и функциями.







