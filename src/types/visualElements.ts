// Система типов для визуальных элементов
export interface VisualElement {
  id: string;
  type: string;
  category: ElementCategory;
  name: string;
  description: string;
  icon: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  props: Record<string, any>;
  styles: Record<string, any>;
  children?: VisualElement[];
}

export type ElementCategory = 
  | 'basic'        // Базовые элементы
  | 'forms'        // Формы и поля ввода
  | 'navigation'   // Навигация
  | 'media'        // Медиа контент
  | 'content'      // Контентные блоки
  | 'layout'       // Компоненты макета
  | 'data'         // Таблицы и списки
  | 'feedback'     // Уведомления и обратная связь
  | 'templates';   // Готовые шаблоны

export interface ElementTemplate {
  id: string;
  name: string;
  description: string;
  category: ElementCategory;
  thumbnail: string;
  elements: VisualElement[];
  tags: string[];
}

export interface ElementLibrary {
  categories: {
    [key in ElementCategory]: {
      name: string;
      description: string;
      icon: string;
      elements: VisualElement[];
    };
  };
  templates: ElementTemplate[];
}

// Базовые стили для элементов
export const defaultStyles = {
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0',
    padding: '8px'
  },
  text: {
    fontSize: '16px',
    color: '#374151',
    margin: '0',
    padding: '8px',
    lineHeight: '1.5'
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  input: {
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    width: '100%'
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }
};
