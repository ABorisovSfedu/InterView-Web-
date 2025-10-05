// Система шаблонов Mod3 для автоматического позиционирования элементов
import { VisualElement } from '../types/visualElements';

// Интерфейс для шаблона Mod3
export interface Mod3Template {
  id: string;
  name: string;
  priority: number;
  triggers: string[];
  sections: {
    hero: string[];
    main: string[];
    footer: string[];
  };
}

// Интерфейс для компонента Mod3
export interface Mod3Component {
  component: string;
  props: Record<string, any>;
  confidence: number;
  match_type: string;
  term: string;
}

// Интерфейс для ответа Mod3
export interface Mod3LayoutResponse {
  status: string;
  session_id: string;
  layout: {
    template: string;
    sections: {
      hero: Mod3Component[];
      main: Mod3Component[];
      footer: Mod3Component[];
    };
    count: number;
  };
  matches: Mod3Component[];
  explanations: Array<{
    term: string;
    matched_component: string;
    match_type: string;
    score: number;
  }>;
}

// Доступные шаблоны Mod3
export const MOD3_TEMPLATES: Mod3Template[] = [
  {
    id: 'ecommerce-landing',
    name: 'E-commerce Landing',
    priority: 1,
    triggers: ['интернет-магазин', 'каталог', 'товары', 'корзина', 'товар', 'продажа', 'магазин', 'ecommerce'],
    sections: {
      hero: ['ui.hero', 'ui.search'],
      main: ['ui.productGrid', 'ui.filters', 'ui.cta'],
      footer: ['ui.footer']
    }
  },
  {
    id: 'hero-main-footer',
    name: 'Hero Main Footer',
    priority: 2,
    triggers: ['меню', 'навигация', 'navbar', 'шапка', 'сайт', 'страница'],
    sections: {
      hero: ['ui.hero', 'ui.navbar'],
      main: ['ui.text', 'ui.button', 'ui.form'],
      footer: ['ui.footer']
    }
  },
  {
    id: 'cards-landing',
    name: 'Cards Landing',
    priority: 3,
    triggers: ['портфолио', 'кейсы', 'наши работы', 'галерея', 'проекты', 'работы'],
    sections: {
      hero: ['ui.hero'],
      main: ['ui.cards', 'ui.text'],
      footer: ['ui.footer']
    }
  },
  {
    id: 'one-column',
    name: 'One Column',
    priority: 4,
    triggers: ['лендинг', 'промо', 'одностраничный', 'страница секциями', 'landing'],
    sections: {
      hero: ['ui.hero'],
      main: ['ui.section', 'ui.text', 'ui.button'],
      footer: ['ui.footer']
    }
  }
];

// Маппинг компонентов Mod3 на визуальные элементы
export const COMPONENT_MAPPING: Record<string, Partial<VisualElement>> = {
  // Hero секция
  'ui.hero': {
    type: 'hero',
    category: 'basic',
    name: 'Hero баннер',
    description: 'Главный баннер страницы',
    icon: '🎯',
    content: 'Добро пожаловать!',
    width: 600,
    height: 200,
    props: { variant: 'hero' },
    styles: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '40px 20px',
      borderRadius: '12px'
    }
  },
  'ui.navbar': {
    type: 'navbar',
    category: 'navigation',
    name: 'Навигация',
    description: 'Навигационная панель',
    icon: '🧭',
    content: 'Главная | О нас | Услуги | Контакты',
    width: 600,
    height: 50,
    props: { links: ['Главная', 'О нас', 'Услуги', 'Контакты'] },
    styles: {
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px'
    }
  },
  'ui.search': {
    type: 'search',
    category: 'forms',
    name: 'Поиск',
    description: 'Поле поиска товаров',
    icon: '🔍',
    content: '',
    width: 300,
    height: 40,
    props: { placeholder: 'Поиск товаров...' },
    styles: {
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '16px'
    }
  },

  // Main секция
  'ui.text': {
    type: 'text',
    category: 'basic',
    name: 'Текст',
    description: 'Текстовый блок',
    icon: '📄',
    content: 'Описание вашего продукта или услуги',
    width: 500,
    height: 80,
    props: {},
    styles: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#374151',
      padding: '16px'
    }
  },
  'ui.button': {
    type: 'button',
    category: 'basic',
    name: 'Кнопка',
    description: 'Кнопка действия',
    icon: '🔘',
    content: 'Узнать больше',
    width: 150,
    height: 50,
    props: { variant: 'primary' },
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '16px',
      cursor: 'pointer'
    }
  },
  'ui.form': {
    type: 'form',
    category: 'forms',
    name: 'Форма',
    description: 'Форма обратной связи',
    icon: '📝',
    content: '',
    width: 350,
    height: 250,
    props: { fields: ['name', 'email', 'message'] },
    styles: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px'
    }
  },
  'ui.cta': {
    type: 'cta',
    category: 'basic',
    name: 'Призыв к действию',
    description: 'Блок призыва к действию',
    icon: '📢',
    content: 'Начните прямо сейчас!',
    width: 400,
    height: 80,
    props: { variant: 'cta' },
    styles: {
      backgroundColor: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  },
  'ui.section': {
    type: 'section',
    category: 'layout',
    name: 'Секция',
    description: 'Секция контента',
    icon: '📦',
    content: '',
    width: 600,
    height: 150,
    props: {},
    styles: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '24px'
    }
  },
  'ui.container': {
    type: 'container',
    category: 'layout',
    name: 'Контейнер',
    description: 'Основной контейнер',
    icon: '📦',
    content: '',
    width: 600,
    height: 200,
    props: {},
    styles: {
      backgroundColor: '#f9fafb',
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '20px'
    }
  },

  // Карточки и контент
  'ui.card': {
    type: 'card',
    category: 'content',
    name: 'Карточка',
    description: 'Карточка контента',
    icon: '🃏',
    content: 'Заголовок карточки\n\nОписание карточки',
    width: 300,
    height: 200,
    props: {},
    styles: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  },
  'ui.cards': {
    type: 'cards',
    category: 'content',
    name: 'Сетка карточек',
    description: 'Сетка карточек',
    icon: '🃏',
    content: '',
    width: 600,
    height: 200,
    props: { columns: 3 },
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      padding: '16px'
    }
  },
  'ui.productCard': {
    type: 'productCard',
    category: 'content',
    name: 'Карточка товара',
    description: 'Карточка товара',
    icon: '🛍️',
    content: 'Название товара\n\nОписание товара\n\nЦена: 1000₽',
    width: 250,
    height: 350,
    props: { price: '1000₽' },
    styles: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }
  },
  'ui.productGrid': {
    type: 'productGrid',
    category: 'content',
    name: 'Сетка товаров',
    description: 'Сетка товаров',
    icon: '🛍️',
    content: '',
    width: 600,
    height: 300,
    props: { columns: 4 },
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      padding: '16px'
    }
  },

  // Медиа
  'ui.image': {
    type: 'image',
    category: 'media',
    name: 'Изображение',
    description: 'Изображение',
    icon: '🖼️',
    content: '',
    width: 300,
    height: 200,
    props: { src: '', alt: 'Изображение' },
    styles: {
      backgroundColor: '#f3f4f6',
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280'
    }
  },
  'ui.imageGallery': {
    type: 'gallery',
    category: 'media',
    name: 'Галерея',
    description: 'Галерея изображений',
    icon: '🖼️',
    content: '',
    width: 500,
    height: 250,
    props: { columns: 3 },
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px'
    }
  },

  // Footer секция
  'ui.footer': {
    type: 'footer',
    category: 'navigation',
    name: 'Подвал',
    description: 'Подвал сайта',
    icon: '🦶',
    content: '© 2024 Ваша компания. Все права защищены.',
    width: 600,
    height: 60,
    props: {},
    styles: {
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '16px',
      textAlign: 'center',
      fontSize: '14px'
    }
  },

  // Дополнительные компоненты
  'ui.heading': {
    type: 'header',
    category: 'basic',
    name: 'Заголовок',
    description: 'Заголовок секции',
    icon: '📝',
    content: 'Заголовок',
    width: 400,
    height: 40,
    props: { level: 2 },
    styles: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '16px'
    }
  },
  'ui.list': {
    type: 'list',
    category: 'content',
    name: 'Список',
    description: 'Список элементов',
    icon: '📋',
    content: '• Элемент 1\n• Элемент 2\n• Элемент 3',
    width: 300,
    height: 100,
    props: { type: 'ul' },
    styles: {
      padding: '16px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px'
    }
  },
  'ui.grid': {
    type: 'grid',
    category: 'layout',
    name: 'Сетка',
    description: 'CSS Grid контейнер',
    icon: '⊞',
    content: '',
    width: 500,
    height: 150,
    props: { columns: 3 },
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      backgroundColor: '#f3f4f6',
      padding: '16px',
      borderRadius: '8px'
    }
  }
};

// Система позиционирования элементов по секциям
export class TemplatePositioningSystem {
  private canvasWidth = 1200; // Увеличиваем ширину канваса
  private canvasHeight = 1500; // Увеличиваем высоту канваса
  
  // Размеры секций - увеличиваем для лучшего размещения
  private sectionDimensions = {
    hero: { width: this.canvasWidth, height: 500, y: 0 }, // Увеличиваем высоту hero
    main: { width: this.canvasWidth, height: 800, y: 500 }, // Увеличиваем высоту main
    footer: { width: this.canvasWidth, height: 200, y: 1300 } // Увеличиваем высоту footer
  };

  // Позиционирование элементов в секции
  private positionElementsInSection(
    components: Mod3Component[], 
    sectionName: 'hero' | 'main' | 'footer'
  ): VisualElement[] {
    const section = this.sectionDimensions[sectionName];
    const elements: VisualElement[] = [];
    
    let currentY = section.y + 20; // Отступ от верха секции
    let currentX = 20; // Отступ от левого края
    let maxHeightInRow = 0; // Максимальная высота в текущем ряду
    
    console.log(`🎯 Позиционирование ${components.length} элементов в секции ${sectionName}`);
    
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const baseElement = COMPONENT_MAPPING[component.component];
      
      if (!baseElement) {
        console.warn(`Компонент ${component.component} не найден в маппинге`);
        continue;
      }

      // Определяем, является ли элемент full-width
      const isFullWidthElement = ['header', 'navbar', 'hero', 'footer'].includes(baseElement.type);

      // Адаптируем размеры элементов под секцию
      let elementWidth = baseElement.width || 200;
      let elementHeight = baseElement.height || 100;
      
      // Для full-width элементов устанавливаем полную ширину канваса
      if (isFullWidthElement) {
        elementWidth = 1200; // Полная ширина канваса
        currentX = 0; // Позиционируем с левого края
      } else if (sectionName === 'hero') {
        // Для hero секции делаем элементы на всю ширину
        elementWidth = Math.min(elementWidth, section.width - 40);
      }
      
      // Для main секции используем сетку 3 колонки
      if (sectionName === 'main') {
        const maxColumns = 3;
        const columnWidth = (section.width - 60) / maxColumns; // 60px для отступов
        elementWidth = Math.min(elementWidth, columnWidth);
      }
      
      // Проверяем, помещается ли элемент в текущий ряд
      if (currentX + elementWidth > section.width - 20) {
        // Переходим на новую строку
        currentX = 20;
        currentY += maxHeightInRow + 20;
        maxHeightInRow = 0;
      }
      
      // Проверяем, не выходит ли элемент за границы секции
      if (currentY + elementHeight > section.y + section.height - 20) {
        console.warn(`⚠️ Элемент ${component.component} не помещается в секцию ${sectionName}`);
        // Уменьшаем высоту элемента
        elementHeight = Math.max(50, section.y + section.height - currentY - 20);
      }

      // Создаем элемент с позиционированием
      const element: VisualElement = {
        id: `${component.component}-${sectionName}-${i}-${Date.now()}`,
        type: baseElement.type || 'text',
        category: baseElement.category || 'basic',
        name: baseElement.name || component.component,
        description: baseElement.description || '',
        icon: baseElement.icon || '📄',
        content: this.generateContentFromProps(component.props, component.term),
        x: currentX,
        y: currentY,
        width: elementWidth,
        height: elementHeight,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { ...baseElement.props, ...component.props },
        styles: { ...baseElement.styles }
      };

      elements.push(element);
      
      console.log(`📍 Элемент ${component.component} размещен в позиции (${currentX}, ${currentY}) размером ${elementWidth}x${elementHeight}`);

      // Обновляем позицию для следующего элемента
      if (isFullWidthElement) {
        // Для full-width элементов просто увеличиваем Y
        currentY += elementHeight + 30;
        maxHeightInRow = elementHeight;
      } else if (sectionName === 'hero') {
        // В hero секции элементы располагаются вертикально
        currentY += elementHeight + 30; // Увеличиваем отступ
        maxHeightInRow = elementHeight;
      } else if (sectionName === 'main') {
        // В main секции элементы располагаются в сетке 3 колонки
        currentX += elementWidth + 20;
        maxHeightInRow = Math.max(maxHeightInRow, elementHeight);
        
        // Если достигли конца ряда, переходим на новую строку
        if (currentX + elementWidth > section.width - 20) {
          currentX = 20;
          currentY += maxHeightInRow + 20;
          maxHeightInRow = 0;
        }
      } else if (sectionName === 'footer') {
        // В footer секции элементы располагаются горизонтально
        currentX += elementWidth + 20;
        maxHeightInRow = Math.max(maxHeightInRow, elementHeight);
      }
    }

    console.log(`✅ Размещено ${elements.length} элементов в секции ${sectionName}`);
    return elements;
  }

  // Группировка компонентов по типам
  private groupComponentsByType(components: Mod3Component[]): Record<string, Mod3Component[]> {
    const grouped: Record<string, Mod3Component[]> = {};
    
    components.forEach(component => {
      const type = component.component.split('.')[1] || component.component;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(component);
    });
    
    return grouped;
  }

  // Генерация контента из props и term
  private generateContentFromProps(props: Record<string, any>, term: string): string {
    // Если есть текст в props, используем его
    if (props.text) return props.text;
    if (props.title) return props.title;
    if (props.content) return props.content;
    
    // Иначе генерируем на основе term
    const termContent: Record<string, string> = {
      'заголовок': 'Заголовок страницы',
      'текст': 'Описание вашего продукта или услуги',
      'кнопка': 'Узнать больше',
      'форма': 'Форма обратной связи',
      'карточка': 'Карточка товара',
      'изображение': 'Изображение',
      'поиск': 'Поиск товаров',
      'навигация': 'Главная | О нас | Услуги | Контакты',
      'подвал': '© 2024 Ваша компания. Все права защищены.'
    };
    
    return termContent[term] || term;
  }

  // Основная функция для создания элементов из ответа Mod3
  public createElementsFromMod3Response(response: Mod3LayoutResponse): VisualElement[] {
    const allElements: VisualElement[] = [];
    
    // Обрабатываем каждую секцию
    const sections = response.layout.sections;
    
    // Сначала обрабатываем header/navbar элементы из всех секций
    const headerElements: Mod3Component[] = [];
    const heroElements: Mod3Component[] = [];
    const mainElements: Mod3Component[] = [];
    const footerElements: Mod3Component[] = [];
    
    // Собираем элементы по типам из всех секций
    [...(sections.hero || []), ...(sections.main || []), ...(sections.footer || [])].forEach(component => {
      const baseElement = COMPONENT_MAPPING[component.component];
      if (baseElement) {
        if (['header', 'navbar'].includes(baseElement.type)) {
          headerElements.push(component);
        } else if (['hero'].includes(baseElement.type)) {
          heroElements.push(component);
        } else if (['footer'].includes(baseElement.type)) {
          footerElements.push(component);
        } else {
          mainElements.push(component);
        }
      }
    });
    
    // Позиционируем элементы в правильном порядке
    let globalY = 0; // Глобальная позиция Y для всех элементов
    
    // 1. Header/Navbar элементы (самые первые)
    if (headerElements.length > 0) {
      const positionedHeaderElements = this.positionElementsSequentially(headerElements, globalY, 'header');
      allElements.push(...positionedHeaderElements);
      globalY = Math.max(...positionedHeaderElements.map(el => el.y + el.height)) + 20;
    }
    
    // 2. Hero элементы
    if (heroElements.length > 0) {
      const positionedHeroElements = this.positionElementsSequentially(heroElements, globalY, 'hero');
      allElements.push(...positionedHeroElements);
      globalY = Math.max(...positionedHeroElements.map(el => el.y + el.height)) + 20;
    }
    
    // 3. Main элементы (в сетке)
    if (mainElements.length > 0) {
      const positionedMainElements = this.positionElementsInGrid(mainElements, globalY);
      allElements.push(...positionedMainElements);
      globalY = Math.max(...positionedMainElements.map(el => el.y + el.height)) + 20;
    }
    
    // 4. Footer элементы (самые последние)
    if (footerElements.length > 0) {
      const positionedFooterElements = this.positionElementsSequentially(footerElements, globalY, 'footer');
      allElements.push(...positionedFooterElements);
    }
    
    console.log(`✅ Создано ${allElements.length} элементов в правильном порядке`);
    return allElements;
  }

  // Позиционирование элементов последовательно (для header, hero, footer)
  private positionElementsSequentially(
    components: Mod3Component[], 
    startY: number, 
    elementType: 'header' | 'hero' | 'footer'
  ): VisualElement[] {
    const elements: VisualElement[] = [];
    let currentY = startY;
    
    console.log(`🎯 Последовательное позиционирование ${components.length} элементов типа ${elementType} начиная с Y=${startY}`);
    
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const baseElement = COMPONENT_MAPPING[component.component];
      
      if (!baseElement) {
        console.warn(`Компонент ${component.component} не найден в маппинге`);
        continue;
      }

      // Определяем, является ли элемент full-width
      const isFullWidthElement = ['header', 'navbar', 'hero', 'footer'].includes(baseElement.type);

      // Адаптируем размеры элементов
      let elementWidth = baseElement.width || 200;
      let elementHeight = baseElement.height || 100;
      
      // Для full-width элементов устанавливаем полную ширину канваса
      if (isFullWidthElement) {
        elementWidth = 1200; // Полная ширина канваса
      }

      // Создаем элемент с позиционированием
      const element: VisualElement = {
        id: `${component.component}-${elementType}-${i}-${Date.now()}`,
        type: baseElement.type || 'text',
        category: baseElement.category || 'basic',
        name: baseElement.name || component.component,
        description: baseElement.description || '',
        icon: baseElement.icon || '📄',
        content: this.generateContentFromProps(component.props, component.term),
        x: isFullWidthElement ? 0 : 20, // Full-width элементы с левого края
        y: currentY,
        width: elementWidth,
        height: elementHeight,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { ...baseElement.props, ...component.props },
        styles: { ...baseElement.styles }
      };

      elements.push(element);
      
      console.log(`📍 Элемент ${component.component} размещен в позиции (${element.x}, ${element.y}) размером ${elementWidth}x${elementHeight}`);

      // Обновляем позицию для следующего элемента
      currentY += elementHeight + 20; // Отступ между элементами
    }
    
    console.log(`✅ Последовательно размещено ${elements.length} элементов типа ${elementType}`);
    return elements;
  }

  // Позиционирование элементов в сетке (для main элементов)
  private positionElementsInGrid(components: Mod3Component[], startY: number): VisualElement[] {
    const elements: VisualElement[] = [];
    const maxColumns = 3;
    const columnWidth = (1200 - 80) / maxColumns; // 80px для отступов (20px с каждой стороны + 20px между колонками)
    const rowHeight = 200; // Фиксированная высота ряда
    
    let currentY = startY;
    let currentX = 20; // Отступ от левого края
    let currentColumn = 0;
    
    console.log(`🎯 Позиционирование ${components.length} элементов в сетке начиная с Y=${startY}`);
    
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const baseElement = COMPONENT_MAPPING[component.component];
      
      if (!baseElement) {
        console.warn(`Компонент ${component.component} не найден в маппинге`);
        continue;
      }

      // Адаптируем размеры элементов под сетку
      let elementWidth = Math.min(baseElement.width || 200, columnWidth);
      let elementHeight = Math.min(baseElement.height || 100, rowHeight - 20); // Оставляем место для отступов

      // Позиционируем в текущей колонке
      currentX = 20 + currentColumn * (columnWidth + 20);

      // Создаем элемент с позиционированием
      const element: VisualElement = {
        id: `${component.component}-main-${i}-${Date.now()}`,
        type: baseElement.type || 'text',
        category: baseElement.category || 'basic',
        name: baseElement.name || component.component,
        description: baseElement.description || '',
        icon: baseElement.icon || '📄',
        content: this.generateContentFromProps(component.props, component.term),
        x: currentX,
        y: currentY,
        width: elementWidth,
        height: elementHeight,
        zIndex: 1,
        opacity: 1,
        locked: false,
        visible: true,
        props: { ...baseElement.props, ...component.props },
        styles: { ...baseElement.styles }
      };

      elements.push(element);
      
      console.log(`📍 Элемент ${component.component} размещен в сетке в позиции (${element.x}, ${element.y}) размером ${elementWidth}x${elementHeight}`);

      // Переходим к следующей колонке
      currentColumn++;
      
      // Если достигли конца ряда, переходим на новую строку
      if (currentColumn >= maxColumns) {
        currentColumn = 0;
        currentY += rowHeight;
      }
    }
    
    console.log(`✅ В сетке размещено ${elements.length} элементов`);
    return elements;
  }

  // Получение информации о шаблоне
  public getTemplateInfo(templateId: string): Mod3Template | undefined {
    return MOD3_TEMPLATES.find(template => template.id === templateId);
  }

  // Получение всех доступных шаблонов
  public getAllTemplates(): Mod3Template[] {
    return MOD3_TEMPLATES;
  }
}

// Экспорт экземпляра системы
export const templatePositioningSystem = new TemplatePositioningSystem();

// Функция для создания элементов из Mod3 ответа
export const createElementsFromMod3 = (response: Mod3LayoutResponse): VisualElement[] => {
  return templatePositioningSystem.createElementsFromMod3Response(response);
};

// Функция для получения информации о шаблоне
export const getTemplateInfo = (templateId: string): Mod3Template | undefined => {
  return templatePositioningSystem.getTemplateInfo(templateId);
};

export default templatePositioningSystem;
