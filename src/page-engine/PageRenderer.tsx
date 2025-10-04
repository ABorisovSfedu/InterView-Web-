// Page Renderer для движка страницы
// Универсальный рендерер страниц для всех режимов работы

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageModel, Block, RenderOptions, DebugInfo, RenderError } from './types';
import { getComponent, hasComponent } from './registry';
import { ErrorBoundary } from './ErrorBoundary';
import { DebugOverlay, useDebugOverlay } from './DebugOverlay';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Edit, Trash2, Copy, Move } from 'lucide-react';

interface PageRendererProps {
  pageModel?: PageModel;
  blocks?: Block[];
  options?: RenderOptions;
  className?: string;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  pageModel,
  blocks,
  options = {},
  className = ''
}) => {
  const {
    showDebugOverlay = process.env.NODE_ENV === 'development',
    enableDragDrop = false,
    onBlockEdit,
    onBlockDelete,
    onBlockMove
  } = options;

  const debugOverlay = useDebugOverlay();
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [renderTime, setRenderTime] = useState(0);
  const [errors, setErrors] = useState<RenderError[]>([]);

  // Измерение времени рендеринга
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };
  }, [pageModel]);

  // Обработка ошибок рендеринга
  const handleRenderError = useCallback((blockId: string, component: string, error: Error) => {
    const renderError: RenderError = {
      blockId,
      component,
      error,
      fallback: (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-600 text-sm">
              Ошибка рендеринга: {component}
            </div>
            <div className="text-red-500 text-xs mt-1">
              {error.message}
            </div>
          </CardContent>
        </Card>
      )
    };

    setErrors(prev => [...prev.filter(e => e.blockId !== blockId), renderError]);
  }, []);

  // Рендеринг блока
  const renderBlock = useCallback((block: Block, sectionName: string, index: number) => {
    const startTime = performance.now();
    
    // Проверяем существование компонента
    if (!hasComponent(block.component)) {
      const error = new Error(`Компонент "${block.component}" не найден в реестре`);
      handleRenderError(block.id, block.component, error);
      
      return (
        <Card key={block.id} className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-600 text-sm">
              Компонент "{block.component}" не найден
            </div>
            <div className="text-red-500 text-xs mt-1">
              ID: {block.id}
            </div>
          </CardContent>
        </Card>
      );
    }

    const Component = getComponent(block.component);
    if (!Component) {
      const error = new Error(`Не удалось получить компонент "${block.component}"`);
      handleRenderError(block.id, block.component, error);
      return null;
    }

    // Создаем пропсы для компонента
    const componentProps = {
      ...block.props,
      key: block.id,
      'data-block-id': block.id,
      'data-component': block.component,
      'data-section': sectionName,
      'data-index': index
    };

    // Оборачиваем в ErrorBoundary
    const wrappedComponent = (
      <ErrorBoundary
        key={block.id}
        blockId={block.id}
        componentName={block.component}
        onError={(error) => handleRenderError(block.id, block.component, error)}
      >
        <div className="relative group">
          {/* Инструменты редактирования */}
          {enableDragDrop && (
            <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                {onBlockEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onBlockEdit(block)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Копирование блока
                    const newBlock = { ...block, id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
                    // Здесь можно добавить логику копирования
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {onBlockDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onBlockDelete(block.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Компонент */}
          <div className="border-2 border-transparent group-hover:border-blue-300 rounded-lg p-2">
            <Component {...componentProps} />
          </div>

          {/* Индикатор типа блока */}
          {block.metadata?.matchType && (
            <div className="absolute top-2 left-2 z-10">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  block.metadata.matchType === 'ai-generated' 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                }`}
              >
                {block.metadata.matchType === 'ai-generated' ? 'AI' : 'Manual'}
              </Badge>
            </div>
          )}
        </div>
      </ErrorBoundary>
    );

    // Записываем информацию для отладки
    const endTime = performance.now();
    const blockRenderTime = endTime - startTime;
    
    setDebugInfo(prev => [
      ...prev.filter(info => info.blockId !== block.id),
      {
        blockId: block.id,
        component: block.component,
        props: block.props || {},
        renderTime: blockRenderTime,
        errors: errors.filter(e => e.blockId === block.id)
      }
    ]);

    return wrappedComponent;
  }, [enableDragDrop, onBlockEdit, onBlockDelete, onBlockMove, handleRenderError, errors]);

  // Рендеринг секции
  const renderSection = useCallback((sectionName: string, blocks: Block[]) => {
    if (blocks.length === 0) {
      return (
        <div key={sectionName} className="min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center text-gray-500">
            <p>Секция "{sectionName}" пуста</p>
            <p className="text-sm">Добавьте компоненты</p>
          </div>
        </div>
      );
    }

    return (
      <div key={sectionName} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold capitalize">{sectionName}</h3>
          <Badge variant="outline">
            {blocks.length} компонентов
          </Badge>
        </div>
        
        <div className="grid grid-cols-12 gap-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="col-span-12">
              {renderBlock(block, sectionName, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }, [renderBlock]);

  // Определяем какие блоки рендерить
  const blocksToRender = useMemo(() => {
    if (blocks) return blocks;
    if (pageModel?.blocks) return pageModel.blocks;
    if (pageModel?.sections) {
      // Для совместимости со старой моделью
      return Object.values(pageModel.sections).flat();
    }
    return [];
  }, [blocks, pageModel]);

  // Мемоизированный рендер страницы
  const renderedPage = useMemo(() => {
    if (blocks) {
      // Рендерим переданные блоки напрямую
      return (
        <div className={`page-renderer ${className}`}>
          {blocks.map((block, index) => renderBlock(block, 'direct', index))}
        </div>
      );
    }
    
    if (pageModel?.blocks) {
      // Новая модель - рендерим блоки напрямую
      return (
        <div className={`page-renderer ${className}`}>
          {pageModel.blocks.map((block, index) => renderBlock(block, 'main', index))}
        </div>
      );
    }
    
    if (pageModel?.sections) {
      // Старая модель - рендерим по секциям
      return (
        <div className={`page-renderer ${className}`}>
          {Object.entries(pageModel.sections).map(([sectionName, sectionBlocks]) =>
            renderSection(sectionName, sectionBlocks)
          )}
        </div>
      );
    }

    return <div className={`page-renderer ${className}`} />;
  }, [blocks, pageModel, renderSection, renderBlock, className]);

  return (
    <>
      {renderedPage}
      
      {/* Debug Overlay */}
      {showDebugOverlay && (
        <DebugOverlay
          pageModel={pageModel}
          debugInfo={debugInfo}
          renderTime={renderTime}
          isVisible={debugOverlay.isVisible}
          onToggle={debugOverlay.toggle}
          onBlockSelect={debugOverlay.selectBlock}
          selectedBlockId={debugOverlay.selectedBlockId}
        />
      )}
    </>
  );
};

// HOC для обертки компонентов в PageRenderer
export const withPageRenderer = <P extends object>(
  Component: React.ComponentType<P>,
  defaultOptions?: RenderOptions
) => {
  const WrappedComponent = (props: P & { pageModel: PageModel; options?: RenderOptions }) => {
    const { pageModel, options, ...restProps } = props;
    
    return (
      <PageRenderer
        pageModel={pageModel}
        options={{ ...defaultOptions, ...options }}
      />
    );
  };

  WrappedComponent.displayName = `withPageRenderer(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Хук для работы с PageRenderer
export const usePageRenderer = (pageModel: PageModel, options?: RenderOptions) => {
  const [currentPageModel, setCurrentPageModel] = useState(pageModel);
  const [renderOptions, setRenderOptions] = useState(options || {});

  const updatePageModel = useCallback((newPageModel: PageModel) => {
    setCurrentPageModel(newPageModel);
  }, []);

  const updateRenderOptions = useCallback((newOptions: RenderOptions) => {
    setRenderOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const renderPage = useCallback(() => {
    return (
      <PageRenderer
        pageModel={currentPageModel}
        options={renderOptions}
      />
    );
  }, [currentPageModel, renderOptions]);

  return {
    pageModel: currentPageModel,
    options: renderOptions,
    updatePageModel,
    updateRenderOptions,
    renderPage
  };
};


