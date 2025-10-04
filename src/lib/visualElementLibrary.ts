// Полноценная библиотека визуальных элементов
import { VisualElement, ElementCategory, ElementTemplate, ElementLibrary, defaultStyles } from '../types/visualElements';

// Базовые элементы
const basicElements: VisualElement[] = [
  {
    id: 'header-h1',
    type: 'header',
    category: 'basic',
    name: 'Заголовок H1',
    description: 'Основной заголовок страницы',
    icon: '📝',
    content: 'Заголовок H1',
    x: 0,
    y: 0,
    width: 300,
    height: 50,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { level: 1 },
    styles: { ...defaultStyles.header, fontSize: '32px' }
  },
  {
    id: 'header-h2',
    type: 'header',
    category: 'basic',
    name: 'Заголовок H2',
    description: 'Вторичный заголовок',
    icon: '📝',
    content: 'Заголовок H2',
    x: 0,
    y: 0,
    width: 300,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { level: 2 },
    styles: { ...defaultStyles.header, fontSize: '24px' }
  },
  {
    id: 'text-paragraph',
    type: 'text',
    category: 'basic',
    name: 'Параграф',
    description: 'Обычный текстовый блок',
    icon: '📄',
    content: 'Это пример текстового параграфа. Здесь можно разместить любой текст.',
    x: 0,
    y: 0,
    width: 400,
    height: 100,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: {},
    styles: defaultStyles.text
  },
  {
    id: 'button-primary',
    type: 'button',
    category: 'basic',
    name: 'Кнопка (Основная)',
    description: 'Основная кнопка действия',
    icon: '🔘',
    content: 'Кнопка',
    x: 0,
    y: 0,
    width: 120,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { variant: 'primary' },
    styles: { ...defaultStyles.button, backgroundColor: '#3b82f6' }
  },
  {
    id: 'button-secondary',
    type: 'button',
    category: 'basic',
    name: 'Кнопка (Вторичная)',
    description: 'Вторичная кнопка',
    icon: '🔘',
    content: 'Кнопка',
    x: 0,
    y: 0,
    width: 120,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { variant: 'secondary' },
    styles: { ...defaultStyles.button, backgroundColor: '#6b7280', color: 'white' }
  },
  {
    id: 'divider',
    type: 'divider',
    category: 'basic',
    name: 'Разделитель',
    description: 'Горизонтальная линия-разделитель',
    icon: '➖',
    content: '',
    x: 0,
    y: 0,
    width: 300,
    height: 2,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: {},
    styles: { backgroundColor: '#e5e7eb', border: 'none' }
  }
];

// Элементы форм
const formElements: VisualElement[] = [
  {
    id: 'input-text',
    type: 'input',
    category: 'forms',
    name: 'Поле ввода (Текст)',
    description: 'Поле для ввода текста',
    icon: '📝',
    content: '',
    x: 0,
    y: 0,
    width: 250,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'text', placeholder: 'Введите текст' },
    styles: defaultStyles.input
  },
  {
    id: 'input-email',
    type: 'input',
    category: 'forms',
    name: 'Поле ввода (Email)',
    description: 'Поле для ввода email',
    icon: '📧',
    content: '',
    x: 0,
    y: 0,
    width: 250,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'email', placeholder: 'example@email.com' },
    styles: defaultStyles.input
  },
  {
    id: 'input-password',
    type: 'input',
    category: 'forms',
    name: 'Поле ввода (Пароль)',
    description: 'Поле для ввода пароля',
    icon: '🔒',
    content: '',
    x: 0,
    y: 0,
    width: 250,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'password', placeholder: 'Введите пароль' },
    styles: defaultStyles.input
  },
  {
    id: 'textarea',
    type: 'textarea',
    category: 'forms',
    name: 'Многострочное поле',
    description: 'Поле для ввода длинного текста',
    icon: '📄',
    content: '',
    x: 0,
    y: 0,
    width: 300,
    height: 100,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { placeholder: 'Введите текст...', rows: 4 },
    styles: { ...defaultStyles.input, resize: 'vertical' }
  },
  {
    id: 'select',
    type: 'select',
    category: 'forms',
    name: 'Выпадающий список',
    description: 'Список для выбора опций',
    icon: '📋',
    content: 'Выберите опцию',
    x: 0,
    y: 0,
    width: 200,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { options: ['Опция 1', 'Опция 2', 'Опция 3'] },
    styles: defaultStyles.input
  },
  {
    id: 'checkbox',
    type: 'checkbox',
    category: 'forms',
    name: 'Чекбокс',
    description: 'Флажок для выбора',
    icon: '☑️',
    content: 'Согласен с условиями',
    x: 0,
    y: 0,
    width: 200,
    height: 24,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { checked: false },
    styles: { display: 'flex', alignItems: 'center', gap: '8px' }
  },
  {
    id: 'radio',
    type: 'radio',
    category: 'forms',
    name: 'Радиокнопка',
    description: 'Кнопка для выбора одной опции',
    icon: '🔘',
    content: 'Опция 1',
    x: 0,
    y: 0,
    width: 150,
    height: 24,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { name: 'radio-group', value: 'option1' },
    styles: { display: 'flex', alignItems: 'center', gap: '8px' }
  }
];

// Элементы навигации
const navigationElements: VisualElement[] = [
  {
    id: 'navbar',
    type: 'navbar',
    category: 'navigation',
    name: 'Навигационная панель',
    description: 'Горизонтальная навигация',
    icon: '🧭',
    content: 'Главная | О нас | Услуги | Контакты',
    x: 0,
    y: 0,
    width: 600,
    height: 60,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { links: ['Главная', 'О нас', 'Услуги', 'Контакты'] },
    styles: { 
      backgroundColor: '#1f2937', 
      color: 'white', 
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px'
    }
  },
  {
    id: 'breadcrumb',
    type: 'breadcrumb',
    category: 'navigation',
    name: 'Хлебные крошки',
    description: 'Навигационная цепочка',
    icon: '🍞',
    content: 'Главная > Раздел > Подраздел',
    x: 0,
    y: 0,
    width: 300,
    height: 30,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { items: ['Главная', 'Раздел', 'Подраздел'] },
    styles: { 
      color: '#6b7280', 
      fontSize: '14px',
      padding: '8px 0'
    }
  },
  {
    id: 'sidebar',
    type: 'sidebar',
    category: 'navigation',
    name: 'Боковая панель',
    description: 'Вертикальная навигация',
    icon: '📋',
    content: 'Меню 1\nМеню 2\nМеню 3',
    x: 0,
    y: 0,
    width: 200,
    height: 300,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { items: ['Меню 1', 'Меню 2', 'Меню 3'] },
    styles: { 
      backgroundColor: '#f9fafb', 
      border: '1px solid #e5e7eb',
      padding: '16px'
    }
  },
  {
    id: 'pagination',
    type: 'pagination',
    category: 'navigation',
    name: 'Пагинация',
    description: 'Навигация по страницам',
    icon: '📄',
    content: '1 2 3 ... 10',
    x: 0,
    y: 0,
    width: 200,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { currentPage: 1, totalPages: 10 },
    styles: { 
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
];

// Медиа элементы
const mediaElements: VisualElement[] = [
  {
    id: 'image',
    type: 'image',
    category: 'media',
    name: 'Изображение',
    description: 'Картинка или фото',
    icon: '🖼️',
    content: '',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { src: '', alt: 'Изображение' },
    styles: { 
      backgroundColor: '#f3f4f6',
      border: '2px dashed #d1d5db',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280'
    }
  },
  {
    id: 'video',
    type: 'video',
    category: 'media',
    name: 'Видео',
    description: 'Видео контент',
    icon: '🎥',
    content: '',
    x: 0,
    y: 0,
    width: 400,
    height: 225,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { src: '', controls: true },
    styles: { 
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }
  },
  {
    id: 'audio',
    type: 'audio',
    category: 'media',
    name: 'Аудио',
    description: 'Аудио плеер',
    icon: '🎵',
    content: '',
    x: 0,
    y: 0,
    width: 300,
    height: 60,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { src: '', controls: true },
    styles: { 
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '8px'
    }
  },
  {
    id: 'gallery',
    type: 'gallery',
    category: 'media',
    name: 'Галерея',
    description: 'Сетка изображений',
    icon: '🖼️',
    content: '',
    x: 0,
    y: 0,
    width: 400,
    height: 300,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { images: [], columns: 3 },
    styles: { 
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px'
    }
  }
];

// Контентные блоки
const contentElements: VisualElement[] = [
  {
    id: 'card',
    type: 'card',
    category: 'content',
    name: 'Карточка',
    description: 'Контейнер для контента',
    icon: '🃏',
    content: 'Заголовок карточки\n\nОписание карточки с текстом',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: {},
    styles: defaultStyles.card
  },
  {
    id: 'quote',
    type: 'quote',
    category: 'content',
    name: 'Цитата',
    description: 'Блок с цитатой',
    icon: '💬',
    content: 'Это важная цитата, которая выделяется на странице.',
    x: 0,
    y: 0,
    width: 400,
    height: 100,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { author: 'Автор' },
    styles: { 
      borderLeft: '4px solid #3b82f6',
      padding: '16px',
      backgroundColor: '#f8fafc',
      fontStyle: 'italic',
      fontSize: '18px'
    }
  },
  {
    id: 'list-ul',
    type: 'list',
    category: 'content',
    name: 'Список (Маркированный)',
    description: 'Маркированный список',
    icon: '📋',
    content: '• Элемент 1\n• Элемент 2\n• Элемент 3',
    x: 0,
    y: 0,
    width: 250,
    height: 100,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'ul', items: ['Элемент 1', 'Элемент 2', 'Элемент 3'] },
    styles: { 
      padding: '16px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px'
    }
  },
  {
    id: 'list-ol',
    type: 'list',
    category: 'content',
    name: 'Список (Нумерованный)',
    description: 'Нумерованный список',
    icon: '🔢',
    content: '1. Первый пункт\n2. Второй пункт\n3. Третий пункт',
    x: 0,
    y: 0,
    width: 250,
    height: 100,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'ol', items: ['Первый пункт', 'Второй пункт', 'Третий пункт'] },
    styles: { 
      padding: '16px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px'
    }
  },
  {
    id: 'accordion',
    type: 'accordion',
    category: 'content',
    name: 'Аккордеон',
    description: 'Складывающиеся секции',
    icon: '📁',
    content: 'Секция 1\nСекция 2\nСекция 3',
    x: 0,
    y: 0,
    width: 300,
    height: 150,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { sections: ['Секция 1', 'Секция 2', 'Секция 3'] },
    styles: { 
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    }
  }
];

// Компоненты макета
const layoutElements: VisualElement[] = [
  {
    id: 'container',
    type: 'container',
    category: 'layout',
    name: 'Контейнер',
    description: 'Основной контейнер',
    icon: '📦',
    content: '',
    x: 0,
    y: 0,
    width: 600,
    height: 300,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: {},
    styles: { 
      backgroundColor: '#f9fafb',
      border: '2px dashed #d1d5db',
      padding: '16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'row',
    type: 'row',
    category: 'layout',
    name: 'Строка',
    description: 'Горизонтальная строка',
    icon: '➡️',
    content: '',
    x: 0,
    y: 0,
    width: 500,
    height: 100,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: {},
    styles: { 
      display: 'flex',
      gap: '16px',
      backgroundColor: '#f3f4f6',
      padding: '16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'column',
    type: 'column',
    category: 'layout',
    name: 'Колонка',
    description: 'Вертикальная колонка',
    icon: '⬇️',
    content: '',
    x: 0,
    y: 0,
    width: 200,
    height: 300,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: {},
    styles: { 
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: '#f3f4f6',
      padding: '16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'grid',
    type: 'grid',
    category: 'layout',
    name: 'Сетка',
    description: 'CSS Grid контейнер',
    icon: '⊞',
    content: '',
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { columns: 3, rows: 2 },
    styles: { 
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: '16px',
      backgroundColor: '#f3f4f6',
      padding: '16px',
      borderRadius: '8px'
    }
  }
];

// Таблицы и данные
const dataElements: VisualElement[] = [
  {
    id: 'table',
    type: 'table',
    category: 'data',
    name: 'Таблица',
    description: 'Таблица данных',
    icon: '📊',
    content: 'Заголовок 1 | Заголовок 2 | Заголовок 3\nЯчейка 1 | Ячейка 2 | Ячейка 3',
    x: 0,
    y: 0,
    width: 500,
    height: 150,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { 
      headers: ['Заголовок 1', 'Заголовок 2', 'Заголовок 3'],
      rows: [['Ячейка 1', 'Ячейка 2', 'Ячейка 3']]
    },
    styles: { 
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      overflow: 'hidden'
    }
  },
  {
    id: 'chart-bar',
    type: 'chart',
    category: 'data',
    name: 'Гистограмма',
    description: 'Столбчатая диаграмма',
    icon: '📈',
    content: '',
    x: 0,
    y: 0,
    width: 400,
    height: 250,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'bar', data: [] },
    styles: { 
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    }
  },
  {
    id: 'chart-pie',
    type: 'chart',
    category: 'data',
    name: 'Круговая диаграмма',
    description: 'Круговая диаграмма',
    icon: '🥧',
    content: '',
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'pie', data: [] },
    styles: { 
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    }
  }
];

// Уведомления и обратная связь
const feedbackElements: VisualElement[] = [
  {
    id: 'alert-success',
    type: 'alert',
    category: 'feedback',
    name: 'Уведомление (Успех)',
    description: 'Успешное уведомление',
    icon: '✅',
    content: 'Операция выполнена успешно!',
    x: 0,
    y: 0,
    width: 350,
    height: 60,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'success' },
    styles: { 
      backgroundColor: '#d1fae5',
      border: '1px solid #10b981',
      color: '#065f46',
      padding: '12px 16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'alert-error',
    type: 'alert',
    category: 'feedback',
    name: 'Уведомление (Ошибка)',
    description: 'Уведомление об ошибке',
    icon: '❌',
    content: 'Произошла ошибка!',
    x: 0,
    y: 0,
    width: 350,
    height: 60,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'error' },
    styles: { 
      backgroundColor: '#fee2e2',
      border: '1px solid #ef4444',
      color: '#991b1b',
      padding: '12px 16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'alert-warning',
    type: 'alert',
    category: 'feedback',
    name: 'Уведомление (Предупреждение)',
    description: 'Предупреждение',
    icon: '⚠️',
    content: 'Внимание! Проверьте данные.',
    x: 0,
    y: 0,
    width: 350,
    height: 60,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'warning' },
    styles: { 
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      color: '#92400e',
      padding: '12px 16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'alert-info',
    type: 'alert',
    category: 'feedback',
    name: 'Уведомление (Информация)',
    description: 'Информационное уведомление',
    icon: 'ℹ️',
    content: 'Полезная информация для пользователя.',
    x: 0,
    y: 0,
    width: 350,
    height: 60,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { type: 'info' },
    styles: { 
      backgroundColor: '#dbeafe',
      border: '1px solid #3b82f6',
      color: '#1e40af',
      padding: '12px 16px',
      borderRadius: '8px'
    }
  },
  {
    id: 'progress',
    type: 'progress',
    category: 'feedback',
    name: 'Прогресс-бар',
    description: 'Индикатор прогресса',
    icon: '📊',
    content: '',
    x: 0,
    y: 0,
    width: 300,
    height: 20,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: { value: 60, max: 100 },
    styles: { 
      backgroundColor: '#e5e7eb',
      borderRadius: '10px',
      overflow: 'hidden'
    }
  },
  {
    id: 'spinner',
    type: 'spinner',
    category: 'feedback',
    name: 'Спиннер',
    description: 'Индикатор загрузки',
    icon: '⏳',
    content: '',
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    props: {},
    styles: { 
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  }
];

// Готовые шаблоны
const templates: ElementTemplate[] = [
  {
    id: 'hero-section',
    name: 'Hero секция',
    description: 'Главная секция с заголовком и кнопкой',
    category: 'templates',
    thumbnail: '🎯',
    tags: ['hero', 'landing', 'cta'],
    elements: [
      {
        id: 'hero-title',
        type: 'header',
        category: 'basic',
        name: 'Hero заголовок',
        description: '',
        icon: '📝',
        content: 'Добро пожаловать!',
        x: 0,
        y: 0,
        width: 500,
        height: 60,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { level: 1 },
        styles: { ...defaultStyles.header, fontSize: '48px', textAlign: 'center' }
      },
      {
        id: 'hero-subtitle',
        type: 'text',
        category: 'basic',
        name: 'Hero подзаголовок',
        description: '',
        icon: '📄',
        content: 'Создавайте удивительные веб-сайты с помощью нашего конструктора',
        x: 0,
        y: 80,
        width: 500,
        height: 60,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: {},
        styles: { ...defaultStyles.text, fontSize: '18px', textAlign: 'center' }
      },
      {
        id: 'hero-button',
        type: 'button',
        category: 'basic',
        name: 'Hero кнопка',
        description: '',
        icon: '🔘',
        content: 'Начать',
        x: 200,
        y: 160,
        width: 100,
        height: 50,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { variant: 'primary' },
        styles: { ...defaultStyles.button, fontSize: '16px', padding: '12px 24px' }
      }
    ]
  },
  {
    id: 'contact-form',
    name: 'Контактная форма',
    description: 'Готовая форма обратной связи',
    category: 'templates',
    thumbnail: '📧',
    tags: ['form', 'contact', 'feedback'],
    elements: [
      {
        id: 'form-title',
        type: 'header',
        category: 'basic',
        name: 'Заголовок формы',
        description: '',
        icon: '📝',
        content: 'Свяжитесь с нами',
        x: 0,
        y: 0,
        width: 300,
        height: 40,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { level: 2 },
        styles: { ...defaultStyles.header, fontSize: '24px' }
      },
      {
        id: 'form-name',
        type: 'input',
        category: 'forms',
        name: 'Поле имени',
        description: '',
        icon: '📝',
        content: '',
        x: 0,
        y: 60,
        width: 300,
        height: 40,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { type: 'text', placeholder: 'Ваше имя' },
        styles: defaultStyles.input
      },
      {
        id: 'form-email',
        type: 'input',
        category: 'forms',
        name: 'Поле email',
        description: '',
        icon: '📧',
        content: '',
        x: 0,
        y: 120,
        width: 300,
        height: 40,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { type: 'email', placeholder: 'Ваш email' },
        styles: defaultStyles.input
      },
      {
        id: 'form-message',
        type: 'textarea',
        category: 'forms',
        name: 'Поле сообщения',
        description: '',
        icon: '📄',
        content: '',
        x: 0,
        y: 180,
        width: 300,
        height: 100,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { placeholder: 'Ваше сообщение...', rows: 4 },
        styles: { ...defaultStyles.input, resize: 'vertical' }
      },
      {
        id: 'form-submit',
        type: 'button',
        category: 'basic',
        name: 'Кнопка отправки',
        description: '',
        icon: '🔘',
        content: 'Отправить',
        x: 0,
        y: 300,
        width: 100,
        height: 40,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { variant: 'primary' },
        styles: defaultStyles.button
      }
    ]
  }
];

// Полная библиотека элементов
export const elementLibrary: ElementLibrary = {
  categories: {
    basic: {
      name: 'Базовые',
      description: 'Основные элементы интерфейса',
      icon: '🔧',
      elements: basicElements
    },
    forms: {
      name: 'Формы',
      description: 'Элементы форм и ввода данных',
      icon: '📝',
      elements: formElements
    },
    navigation: {
      name: 'Навигация',
      description: 'Элементы навигации и меню',
      icon: '🧭',
      elements: navigationElements
    },
    media: {
      name: 'Медиа',
      description: 'Изображения, видео и аудио',
      icon: '🎥',
      elements: mediaElements
    },
    content: {
      name: 'Контент',
      description: 'Блоки контента и информации',
      icon: '📄',
      elements: contentElements
    },
    layout: {
      name: 'Макет',
      description: 'Компоненты для построения макета',
      icon: '📐',
      elements: layoutElements
    },
    data: {
      name: 'Данные',
      description: 'Таблицы, графики и диаграммы',
      icon: '📊',
      elements: dataElements
    },
    feedback: {
      name: 'Обратная связь',
      description: 'Уведомления и индикаторы состояния',
      icon: '💬',
      elements: feedbackElements
    },
    templates: {
      name: 'Шаблоны',
      description: 'Готовые наборы элементов',
      icon: '🎨',
      elements: []
    }
  },
  templates
};

// Функция для получения элементов по категории
export const getElementsByCategory = (category: ElementCategory): VisualElement[] => {
  return elementLibrary.categories[category]?.elements || [];
};

// Функция для поиска элементов
export const searchElements = (query: string): VisualElement[] => {
  const allElements = Object.values(elementLibrary.categories)
    .flatMap(category => category.elements);
  
  return allElements.filter(element => 
    element.name.toLowerCase().includes(query.toLowerCase()) ||
    element.description.toLowerCase().includes(query.toLowerCase()) ||
    element.type.toLowerCase().includes(query.toLowerCase())
  );
};

// Функция для получения шаблонов
export const getTemplates = (): ElementTemplate[] => {
  return elementLibrary.templates;
};

export default elementLibrary;
