import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { Button } from './ui/button';
import { Toggle } from './ui/toggle';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Eye, 
  Edit3, 
  Save, 
  Search, 
  Filter,
  Grid,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { usePageStore } from '../stores/usePageStoreNew';
import { PageRenderer } from '../page-engine/PageRenderer';
import { ComponentCatalogItem, DragData, DropZone, Block } from '../page-engine/types';
import { ComponentNotFound } from '../page-engine/ComponentNotFound';
import { useDebounce } from '../hooks/useDebounce';
import { ThemeProvider } from '../contexts/ThemeContext';
import { QuickMod2Test } from './QuickMod2Test';

// Компонент палитры компонентов
const ComponentPalette: React.FC = () => {
  const { componentCatalog, catalogLoading, loadComponentCatalog } = usePageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (componentCatalog.length === 0 && !catalogLoading) {
      loadComponentCatalog();
    }
  }, [componentCatalog, catalogLoading, loadComponentCatalog]);

  const categories = ['all', ...new Set(componentCatalog.map(c => c.category))];
  
  const filteredComponents = componentCatalog.filter(component => {
    const matchesSearch = component.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (catalogLoading) {
    return (
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="ml-2 text-gray-300">Загрузка каталога...</span>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Grid className="w-5 h-5 text-cyan-400" />
          Палитра компонентов
        </h2>
      </div>

      {/* Поиск и фильтры */}
      <div className="p-4 space-y-3 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск компонентов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {categories.map(category => (
              <SelectItem key={category} value={category} className="text-white">
                {category === 'all' ? 'Все категории' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Список компонентов */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredComponents.map(component => (
          <DraggableComponent key={component.id} component={component} />
        ))}
        
        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Компоненты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Перетаскиваемый компонент из палитры
const DraggableComponent: React.FC<{ component: ComponentCatalogItem }> = ({ component }) => {
  return (
    <Card 
      className="p-3 bg-gray-800 border-gray-600 hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors"
      draggable
      onDragStart={(e) => {
        const dragData: DragData = {
          type: 'component',
          componentName: component.name,
          sourceData: component
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      }}
    >
      <div className="flex items-start gap-3">
        {component.preview_image && (
          <img 
            src={component.preview_image} 
            alt={component.displayName}
            className="w-10 h-10 rounded bg-gray-700 object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">
            {component.displayName}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2">
            {component.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {component.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Холст с 12-колоночной сеткой
const GridCanvas: React.FC = () => {
  const { pageModel, editorMode, selectedBlockId, selectBlock, moveBlock, addBlock } = usePageStore();
  
  if (!pageModel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center text-gray-400">
          <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Макет не загружен</p>
        </div>
      </div>
    );
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const dragData: DragData = JSON.parse(data);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Вычислить позицию в сетке (упрощенная логика)
      const colWidth = rect.width / 12;
      const colStart = Math.max(1, Math.min(12, Math.floor(x / colWidth) + 1));
      const row = Math.floor(y / 60) + 1; // Примерная высота строки
      
      const dropZone: DropZone = {
        colStart,
        colSpan: 4, // По умолчанию 4 колонки
        row
      };

      if (dragData.type === 'component' && dragData.componentName) {
        addBlock(dragData.componentName, dropZone);
      }
    } catch (error) {
      console.error('Ошибка обработки drop:', error);
    }
  };

  return (
    <div 
      className="flex-1 bg-gray-950 overflow-auto"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="p-6">
        <div className="grid grid-cols-12 gap-4 min-h-screen">
          {/* Визуализация сетки в режиме редактирования */}
          {editorMode === 'edit' && (
            <div className="col-span-12 grid grid-cols-12 gap-4 absolute inset-0 pointer-events-none opacity-10">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-cyan-400 min-h-full" />
              ))}
            </div>
          )}
          
          {/* Рендер блоков */}
          {pageModel.blocks.map(block => (
            <GridBlock 
              key={block.id} 
              block={block} 
              isSelected={selectedBlockId === block.id}
              onSelect={() => selectBlock(block.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Блок в сетке
const GridBlock: React.FC<{
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ block, isSelected, onSelect }) => {
  const { editorMode } = usePageStore();

  const gridClasses = `
    col-start-${block.layout.colStart} 
    col-span-${block.layout.colSpan}
    row-start-${block.layout.row}
  `;

  return (
    <div 
      className={`
        ${gridClasses}
        ${editorMode === 'edit' ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-cyan-400' : ''}
        relative group
      `}
      onClick={editorMode === 'edit' ? onSelect : undefined}
    >
      {/* Бейдж для блоков с defaults */}
      {block.metadata?.usingDefaults && (
        <Badge className="absolute top-2 right-2 z-10 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          defaults
        </Badge>
      )}
      
      {/* Рендер компонента */}
      <PageRenderer blocks={[block]} />
      
      {/* Overlay для режима редактирования */}
      {editorMode === 'edit' && (
        <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );
};


// Основной компонент единой страницы сессии
const UnifiedSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { 
    editorMode, 
    setEditorMode, 
    loadLayout, 
    saveLayout, 
    isLoading, 
    isSaving, 
    isDirty, 
    error,
    setSessionId 
  } = usePageStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (sessionId) {
      setSessionId(sessionId);
      loadLayout(sessionId);
    }
  }, [sessionId, setSessionId, loadLayout]);

  // Автосохранение с debounce
  useDebounce(() => {
    if (isDirty) {
      saveLayout();
    }
  }, 500, [isDirty]);

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="ml-3 text-gray-300">Загрузка сессии...</span>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Ошибка загрузки</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        {/* Шапка с переключателем режимов */}
        <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">
              Сессия {sessionId}
            </h1>
            {isDirty && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                Несохранено
              </Badge>
            )}
            {isSaving && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Сохранение...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Toggle
              pressed={editorMode === 'edit'}
              onPressedChange={(pressed) => setEditorMode(pressed ? 'edit' : 'view')}
              className="data-[state=on]:bg-cyan-500/20 data-[state=on]:text-cyan-400"
            >
              {editorMode === 'edit' ? (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Редактор
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Просмотр
                </>
              )}
            </Toggle>
            
            <Button
              onClick={() => window.location.href = `/generate/${sessionId}`}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Начать генерацию
            </Button>
            
            <Button
              onClick={saveLayout}
              disabled={!isDirty || isSaving}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </header>

        {/* Быстрый тест Mod2 */}
        <div className="px-6 py-4 border-b border-gray-800">
          <QuickMod2Test sessionId={sessionId} />
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex">
          <DndContext sensors={sensors}>
            {/* Палитра компонентов (только в режиме редактирования) */}
            {editorMode === 'edit' && <ComponentPalette />}
            
            {/* Холст */}
            <GridCanvas />
            
            <DragOverlay>
              {/* Здесь можно добавить превью перетаскиваемого элемента */}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default UnifiedSessionPage;
