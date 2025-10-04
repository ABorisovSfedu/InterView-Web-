// Типы для движка страницы
// Унифицированная модель страницы для всех режимов работы

export interface Block {
  id: string;
  component: string;
  props?: Record<string, any>;
  layout: {
    colStart: number;
    colSpan: number;
    row: number;
  };
  metadata?: {
    confidence?: number;
    matchType?: 'ai-generated' | 'manual' | 'template';
    source?: string;
    usingDefaults?: boolean; // Помечает блоки с example_props
  };
}

export interface PageModel {
  id?: string;
  blocks: Block[];
  metadata: {
    title: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
    version?: string;
  };
  settings?: {
    theme?: string;
    responsive?: boolean;
  };
}

// Типы для компонентов реестра
export interface ComponentRegistry {
  [componentName: string]: React.ComponentType<any>;
}

// Типы для каталога компонентов
export interface ComponentCatalogItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  example_props: Record<string, any>;
  preview_image?: string;
  documentation?: string;
}

export interface ComponentCatalog {
  components: ComponentCatalogItem[];
  categories: string[];
}

// Типы для режимов редактирования
export type EditorMode = 'view' | 'edit';

// Типы для DnD
export interface DragData {
  type: 'component' | 'block';
  componentName?: string;
  blockId?: string;
  sourceData?: any;
}

export interface DropZone {
  colStart: number;
  colSpan: number;
  row: number;
}

// Типы для адаптеров
export interface Mod3Layout {
  template: string;
  sections: {
    [sectionName: string]: Array<{
      type: string;
      props?: Record<string, any>;
      confidence?: number;
    }>;
  };
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface Mod3Response {
  layout: Mod3Layout;
  matches?: Array<{
    component: string;
    confidence: number;
    section: string;
  }>;
}

// Типы для рендеринга
export interface RenderOptions {
  showDebugOverlay?: boolean;
  enableDragDrop?: boolean;
  onBlockEdit?: (block: Block) => void;
  onBlockDelete?: (blockId: string) => void;
  onBlockMove?: (blockId: string, newPosition: { x: number; y: number }) => void;
}

// Типы для ошибок
export interface RenderError {
  blockId: string;
  component: string;
  error: Error;
  fallback?: React.ReactNode;
}

// Типы для отладки
export interface DebugInfo {
  blockId: string;
  component: string;
  props: Record<string, any>;
  renderTime: number;
  errors: RenderError[];
}
