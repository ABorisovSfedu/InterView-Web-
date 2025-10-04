// Адаптеры для движка страницы
// Преобразование между форматами Mod3 и PageModel

import { PageModel, Block, Mod3Response, Mod3Layout } from './types';

// Преобразование из Mod3 в PageModel
export const fromMod3 = (mod3Response: Mod3Response): PageModel => {
  // Проверяем наличие данных
  if (!mod3Response || !mod3Response.layout) {
    return {
      template: 'hero-main-footer',
      sections: { hero: [], main: [], footer: [] },
      metadata: { title: 'Пустая страница', description: 'Нет данных для отображения' }
    };
  }

  const { layout } = mod3Response;
  
  // Проверяем наличие секций
  if (!layout.sections || typeof layout.sections !== 'object') {
    return {
      template: layout.template || 'hero-main-footer',
      sections: { hero: [], main: [], footer: [] },
      metadata: { title: 'Пустая страница', description: 'Нет секций для отображения' }
    };
  }
  
  // Преобразуем секции из Mod3 в формат PageModel
  const sections: Record<string, Block[]> = {};
  
  Object.entries(layout.sections).forEach(([sectionName, components]) => {
    sections[sectionName] = (components || []).map((comp, index) => ({
      id: `block_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      component: comp.type || 'ui.paragraph',
      props: comp.props || {},
      metadata: {
        confidence: comp.confidence || 1.0,
        matchType: 'ai-generated' as const,
        source: 'mod3'
      }
    }));
  });

  // Создаем PageModel
  const pageModel: PageModel = {
    template: layout.template || 'hero-main-footer',
    sections: {
      hero: sections.hero || [],
      main: sections.main || [],
      footer: sections.footer || [],
      ...sections // Добавляем дополнительные секции
    },
    metadata: {
      title: layout.metadata?.title || 'Страница от Mod3',
      description: layout.metadata?.description || 'Страница, созданная на основе AI анализа',
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    },
    settings: {
      theme: 'default',
      layout: 'fluid',
      responsive: true
    }
  };

  return pageModel;
};

// Преобразование из PageModel в Mod3
export const toMod3 = (pageModel: PageModel): Mod3Response => {
  // Преобразуем секции из PageModel в формат Mod3
  const sections: Record<string, Array<{ type: string; props?: Record<string, any>; confidence?: number }>> = {};
  
  Object.entries(pageModel.sections).forEach(([sectionName, blocks]) => {
    sections[sectionName] = blocks.map(block => ({
      type: block.component,
      props: block.props,
      confidence: block.metadata?.confidence || 1.0
    }));
  });

  // Создаем Mod3Response
  const mod3Response: Mod3Response = {
    layout: {
      template: pageModel.template,
      sections,
      metadata: {
        title: pageModel.metadata.title,
        description: pageModel.metadata.description
      }
    },
    matches: Object.entries(pageModel.sections).flatMap(([sectionName, blocks]) =>
      blocks.map(block => ({
        component: block.component,
        confidence: block.metadata?.confidence || 1.0,
        section: sectionName
      }))
    )
  };

  return mod3Response;
};

// Вспомогательные функции для работы с блоками

// Создание нового блока
export const createBlock = (
  component: string,
  props: Record<string, any> = {},
  metadata: Block['metadata'] = {}
): Block => {
  return {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    component,
    props,
    metadata: {
      matchType: 'manual',
      ...metadata
    }
  };
};

// Клонирование блока
export const cloneBlock = (block: Block): Block => {
  return {
    ...block,
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      ...block.metadata,
      matchType: 'manual' as const
    }
  };
};

// Обновление блока
export const updateBlock = (
  pageModel: PageModel,
  blockId: string,
  updates: Partial<Block>
): PageModel => {
  const newPageModel = { ...pageModel };
  
  Object.entries(newPageModel.sections).forEach(([sectionName, blocks]) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex !== -1) {
      newPageModel.sections[sectionName] = [
        ...blocks.slice(0, blockIndex),
        { ...blocks[blockIndex], ...updates },
        ...blocks.slice(blockIndex + 1)
      ];
    }
  });

  return newPageModel;
};

// Удаление блока
export const removeBlock = (
  pageModel: PageModel,
  blockId: string
): PageModel => {
  const newPageModel = { ...pageModel };
  
  Object.entries(newPageModel.sections).forEach(([sectionName, blocks]) => {
    newPageModel.sections[sectionName] = blocks.filter(block => block.id !== blockId);
  });

  return newPageModel;
};

// Перемещение блока между секциями
export const moveBlock = (
  pageModel: PageModel,
  blockId: string,
  fromSection: string,
  toSection: string,
  newIndex?: number
): PageModel => {
  const newPageModel = { ...pageModel };
  
  // Находим блок в исходной секции
  const fromBlocks = newPageModel.sections[fromSection] || [];
  const blockIndex = fromBlocks.findIndex(block => block.id === blockId);
  
  if (blockIndex === -1) {
    return newPageModel; // Блок не найден
  }

  const block = fromBlocks[blockIndex];
  
  // Удаляем блок из исходной секции
  newPageModel.sections[fromSection] = [
    ...fromBlocks.slice(0, blockIndex),
    ...fromBlocks.slice(blockIndex + 1)
  ];
  
  // Добавляем блок в целевую секцию
  const toBlocks = newPageModel.sections[toSection] || [];
  const insertIndex = newIndex !== undefined ? newIndex : toBlocks.length;
  
  newPageModel.sections[toSection] = [
    ...toBlocks.slice(0, insertIndex),
    block,
    ...toBlocks.slice(insertIndex)
  ];

  return newPageModel;
};

// Добавление блока в секцию
export const addBlockToSection = (
  pageModel: PageModel,
  sectionName: string,
  block: Block,
  index?: number
): PageModel => {
  const newPageModel = { ...pageModel };
  const blocks = newPageModel.sections[sectionName] || [];
  const insertIndex = index !== undefined ? index : blocks.length;
  
  newPageModel.sections[sectionName] = [
    ...blocks.slice(0, insertIndex),
    block,
    ...blocks.slice(insertIndex)
  ];

  return newPageModel;
};

// Создание пустой страницы
export const createEmptyPage = (template: string = 'hero-main-footer'): PageModel => {
  return {
    template,
    sections: {
      hero: [],
      main: [],
      footer: []
    },
    metadata: {
      title: 'Новая страница',
      description: 'Страница, созданная в конструкторе',
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    },
    settings: {
      theme: 'default',
      layout: 'fluid',
      responsive: true
    }
  };
};

// Валидация PageModel
export const validatePageModel = (pageModel: PageModel): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!pageModel.template) {
    errors.push('Отсутствует шаблон страницы');
  }

  if (!pageModel.sections) {
    errors.push('Отсутствуют секции страницы');
  } else {
    Object.entries(pageModel.sections).forEach(([sectionName, blocks]) => {
      blocks.forEach((block, index) => {
        if (!block.id) {
          errors.push(`Блок ${index} в секции ${sectionName} не имеет ID`);
        }
        if (!block.component) {
          errors.push(`Блок ${index} в секции ${sectionName} не имеет компонента`);
        }
      });
    });
  }

  if (!pageModel.metadata) {
    errors.push('Отсутствуют метаданные страницы');
  } else {
    if (!pageModel.metadata.title) {
      errors.push('Отсутствует заголовок страницы');
    }
    if (!pageModel.metadata.description) {
      errors.push('Отсутствует описание страницы');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
