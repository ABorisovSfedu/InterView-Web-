// Главный экспорт для движка страницы
// Единая точка входа для всех компонентов

// Типы
export * from './types';

// Реестр компонентов
export * from './registry';

// Адаптеры
export * from './adapters';

// Рендерер
export { PageRenderer, withPageRenderer, usePageRenderer } from './PageRenderer';

// Error Boundary
export { ErrorBoundary, withErrorBoundary, useErrorHandler } from './ErrorBoundary';

// Debug Overlay
export { DebugOverlay, useDebugOverlay } from './DebugOverlay';

// Утилиты для работы с движком
export const PageEngine = {
  // Создание страницы
  createPage: (template: string = 'hero-main-footer') => {
    const { createEmptyPage } = require('./adapters');
    return createEmptyPage(template);
  },

  // Валидация страницы
  validatePage: (pageModel: any) => {
    const { validatePageModel } = require('./adapters');
    return validatePageModel(pageModel);
  },

  // Преобразование из Mod3
  fromMod3: (mod3Response: any) => {
    const { fromMod3 } = require('./adapters');
    return fromMod3(mod3Response);
  },

  // Преобразование в Mod3
  toMod3: (pageModel: any) => {
    const { toMod3 } = require('./adapters');
    return toMod3(pageModel);
  },

  // Работа с блоками
  createBlock: (component: string, props: any = {}, metadata: any = {}) => {
    const { createBlock } = require('./adapters');
    return createBlock(component, props, metadata);
  },

  cloneBlock: (block: any) => {
    const { cloneBlock } = require('./adapters');
    return cloneBlock(block);
  },

  updateBlock: (pageModel: any, blockId: string, updates: any) => {
    const { updateBlock } = require('./adapters');
    return updateBlock(pageModel, blockId, updates);
  },

  removeBlock: (pageModel: any, blockId: string) => {
    const { removeBlock } = require('./adapters');
    return removeBlock(pageModel, blockId);
  },

  moveBlock: (pageModel: any, blockId: string, fromSection: string, toSection: string, newIndex?: number) => {
    const { moveBlock } = require('./adapters');
    return moveBlock(pageModel, blockId, fromSection, toSection, newIndex);
  },

  addBlockToSection: (pageModel: any, sectionName: string, block: any, index?: number) => {
    const { addBlockToSection } = require('./adapters');
    return addBlockToSection(pageModel, sectionName, block, index);
  },

  // Работа с реестром
  getComponent: (componentName: string) => {
    const { getComponent } = require('./registry');
    return getComponent(componentName);
  },

  hasComponent: (componentName: string) => {
    const { hasComponent } = require('./registry');
    return hasComponent(componentName);
  },

  getAvailableComponents: () => {
    const { getAvailableComponents } = require('./registry');
    return getAvailableComponents();
  },

  registerComponent: (name: string, component: any) => {
    const { registerComponent } = require('./registry');
    return registerComponent(name, component);
  },

  unregisterComponent: (name: string) => {
    const { unregisterComponent } = require('./registry');
    return unregisterComponent(name);
  }
};

// Константы
export const PAGE_ENGINE_VERSION = '1.0.0';
export const SUPPORTED_TEMPLATES = ['hero-main-footer', 'custom-template'];
export const DEFAULT_THEME = 'default';
export const DEFAULT_LAYOUT = 'fluid';

// Конфигурация по умолчанию
export const DEFAULT_CONFIG = {
  showDebugOverlay: process.env.NODE_ENV === 'development',
  enableDragDrop: false,
  theme: DEFAULT_THEME,
  layout: DEFAULT_LAYOUT,
  responsive: true
};




