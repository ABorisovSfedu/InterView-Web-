// Современный визуальный редактор страниц с полноценной библиотекой элементов
// Интерфейс соответствует показанному дизайну

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageRenderer } from '../page-engine/PageRenderer';
import { usePageStore } from '../stores/usePageStore';
import { PageModel, Block } from '../page-engine/types';
import { VisualElement, ElementCategory, ElementTemplate } from '../types/visualElements';
import { elementLibrary, getElementsByCategory, searchElements, getTemplates } from '../lib/visualElementLibrary';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Move,
  GripVertical,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Code,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  FileText,
  Image,
  Square,
  List,
  Type,
  MousePointer,
  Layers,
  ChevronDown,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Tag,
  Bookmark
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SharedHeader from './SharedHeader';
import apiClient from '../api/client';

// Используем VisualElement из библиотеки
type PageElement = VisualElement;

// Компонент для перетаскиваемого элемента
interface DraggableElementProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (elementId: string) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  onDelete: (elementId: string) => void;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const { isDark } = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : element.opacity,
    position: 'absolute' as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    border: isSelected 
      ? (isDark ? '2px solid #60a5fa' : '2px solid #3b82f6')
      : (isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'),
    borderRadius: '4px',
    backgroundColor: isDark ? '#374151' : 'white',
    cursor: 'pointer'
  };

  const renderElementContent = () => {
    switch (element.type) {
      case 'header':
        return (
          <div className="p-2">
            <input 
              type="text" 
              value={element.content} 
              onChange={(e) => onUpdate(element.id, { content: e.target.value })}
              className={`w-full text-lg font-bold border-none outline-none bg-transparent ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
              placeholder="Заголовок"
            />
          </div>
        );
      case 'text':
        return (
          <div className="p-2">
            <textarea 
              value={element.content} 
              onChange={(e) => onUpdate(element.id, { content: e.target.value })}
              className={`w-full border-none outline-none bg-transparent resize-none ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
              placeholder="Текст"
              rows={3}
            />
          </div>
        );
      case 'button':
        return (
          <div className="p-2 flex items-center justify-center">
            <button className={`px-4 py-2 text-white rounded hover:opacity-90 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
              {element.content || 'Кнопка'}
            </button>
          </div>
        );
      case 'image':
        return (
          <div className={`p-2 flex items-center justify-center border-2 border-dashed ${isDark ? 'border-gray-500' : 'border-gray-300'}`}>
            <div className="text-center">
              <Image className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Изображение</span>
            </div>
          </div>
        );
      default:
        return (
          <div className={`p-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            {element.type}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(element.id)}
      className="group"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-1 left-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 shadow-sm ${isDark ? 'bg-gray-600' : 'bg-white'}`}
      >
        <GripVertical className={`w-3 h-3 ${isDark ? 'text-gray-300' : 'text-gray-400'}`} />
      </div>

      {/* Element Content */}
      {renderElementContent()}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-500 rounded pointer-events-none" />
      )}
    </div>
  );
};

// Панель слоев
interface LayersPanelProps {
  elements: PageElement[];
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  onToggleVisibility: (elementId: string) => void;
  onToggleLock: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onToggleVisibility,
  onToggleLock,
  onDeleteElement
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className={`font-medium text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>Слои</h3>
        <Button size="sm" variant="ghost" className={`h-5 w-5 p-0 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="space-y-0.5">
        {elements.map((element) => (
          <div
            key={element.id}
            className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors ${
              selectedElementId === element.id 
                ? (isDark ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200')
                : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
            }`}
            onClick={() => onSelectElement(element.id)}
          >
            <Button
              size="sm"
              variant="ghost"
              className={`h-4 w-4 p-0 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(element.id);
              }}
            >
              {element.visible ? (
                <Eye className={`w-3 h-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              ) : (
                <EyeOff className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className={`h-4 w-4 p-0 ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(element.id);
              }}
            >
              {element.locked ? (
                <Lock className={`w-3 h-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              ) : (
                <Unlock className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              )}
            </Button>
            
            <span className={`flex-1 text-xs font-medium capitalize truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {element.type}
            </span>
            
            <Button
              size="sm"
              variant="ghost"
              className={`h-4 w-4 p-0 text-red-500 hover:text-red-700 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(element.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Панель инспектора свойств
interface InspectorPanelProps {
  selectedElement: PageElement | null;
  onUpdateElement: (elementId: string, updates: Partial<PageElement>) => void;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedElement,
  onUpdateElement
}) => {
  const { isDark } = useTheme();
  
  if (!selectedElement) {
    return (
      <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <Settings className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
        <p className="text-xs">Выберите элемент для редактирования</p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    onUpdateElement(selectedElement.id, { [property]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className={`font-medium text-xs mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Инспектор</h3>
      </div>

      {/* Position and Size */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>X</Label>
            <Input
              type="number"
              value={selectedElement.x}
              onChange={(e) => handlePropertyChange('x', parseInt(e.target.value) || 0)}
              className={`h-6 text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Y</Label>
            <Input
              type="number"
              value={selectedElement.y}
              onChange={(e) => handlePropertyChange('y', parseInt(e.target.value) || 0)}
              className={`h-6 text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>W</Label>
            <Input
              type="number"
              value={selectedElement.width}
              onChange={(e) => handlePropertyChange('width', parseInt(e.target.value) || 0)}
              className={`h-6 text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>H</Label>
            <Input
              type="number"
              value={selectedElement.height}
              onChange={(e) => handlePropertyChange('height', parseInt(e.target.value) || 0)}
              className={`h-6 text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Z</Label>
            <Input
              type="number"
              value={selectedElement.zIndex}
              onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value) || 0)}
              className={`h-6 text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>OPACITY</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={selectedElement.opacity}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value) || 1)}
              className={`h-6 text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
      </div>

      <Separator className={isDark ? 'bg-gray-600' : 'bg-gray-200'} />

      {/* Content */}
      <div>
        <Label className={`text-xs mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>text</Label>
        <Textarea
          value={selectedElement.content}
          onChange={(e) => handlePropertyChange('content', e.target.value)}
          className={`min-h-[80px] text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          placeholder="Содержимое элемента"
        />
      </div>
    </div>
  );
};

// Компонент палитры элементов
interface ElementPaletteProps {
  onAddElement: (element: VisualElement) => void;
  onAddTemplate: (template: ElementTemplate) => void;
}

const ElementPalette: React.FC<ElementPaletteProps> = ({ onAddElement, onAddTemplate }) => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<ElementCategory>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const categories = Object.entries(elementLibrary.categories).filter(([key]) => key !== 'templates');
  const templates = getTemplates();
  
  const filteredElements = searchQuery 
    ? searchElements(searchQuery)
    : getElementsByCategory(activeCategory);

  const handleElementClick = (element: VisualElement) => {
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: 0,
      y: 0
    };
    onAddElement(newElement);
  };

  const handleTemplateClick = (template: ElementTemplate) => {
    onAddTemplate(template);
  };

  return (
    <div className="space-y-3">
      {/* Поиск */}
      <div className="relative">
        <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <Input
          placeholder="Поиск элементов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pl-7 h-7 text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        />
      </div>

      {/* Переключатель шаблоны/элементы */}
      <div className={`flex rounded border p-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <Button
          size="sm"
          variant={!showTemplates ? 'default' : 'ghost'}
          onClick={() => setShowTemplates(false)}
          className={`flex-1 h-6 text-xs ${isDark ? 'bg-gray-600 hover:bg-gray-500' : ''}`}
        >
          Элементы
        </Button>
        <Button
          size="sm"
          variant={showTemplates ? 'default' : 'ghost'}
          onClick={() => setShowTemplates(true)}
          className={`flex-1 h-6 text-xs ${isDark ? 'bg-gray-600 hover:bg-gray-500' : ''}`}
        >
          Шаблоны
        </Button>
      </div>

      {!showTemplates ? (
        <>
          {/* Категории */}
          <div className="space-y-0.5">
            {categories.map(([key, category]) => (
              <Button
                key={key}
                size="sm"
                variant={activeCategory === key ? 'default' : 'ghost'}
                onClick={() => setActiveCategory(key as ElementCategory)}
                className={`w-full justify-start h-6 text-xs ${isDark ? 'hover:bg-gray-700' : ''}`}
              >
                <span className="mr-1 text-xs">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>

          {/* Элементы */}
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {filteredElements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => handleElementClick(element)}
                  className={`p-1.5 border rounded cursor-pointer transition-colors ${
                    isDark 
                      ? 'border-gray-600 hover:border-blue-400 hover:bg-gray-700' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{element.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-xs truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {element.name}
                      </div>
                      <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {element.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      ) : (
        /* Шаблоны */
        <ScrollArea className="h-48">
          <div className="space-y-1">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  isDark 
                    ? 'border-gray-600 hover:border-blue-400 hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-lg">{template.thumbnail}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {template.description}
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {template.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className={`text-xs px-1 py-0 ${isDark ? 'border-gray-500 text-gray-300' : ''}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

// Основной компонент редактора
const BuilderPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [elements, setElements] = useState<PageElement[]>([
    {
      id: 'header-1',
      type: 'header',
      category: 'basic',
      name: 'Заголовок',
      description: 'Основной заголовок',
      icon: '📝',
      content: 'Заголовок',
      x: 0,
      y: 0,
      width: 200,
      height: 40,
      zIndex: 1,
      opacity: 1,
      locked: false,
      visible: true,
      props: {},
      styles: {}
    },
    {
      id: 'text-1',
      type: 'text',
      category: 'basic',
      name: 'Текст',
      description: 'Текстовый блок',
      icon: '📄',
      content: 'Текст',
      x: 0,
      y: 50,
      width: 200,
      height: 80,
      zIndex: 1,
      opacity: 1,
      locked: false,
      visible: true,
      props: {},
      styles: {}
    }
  ]);
  
  const [selectedElementId, setSelectedElementId] = useState<string | null>('text-1');
  const [draggedElement, setDraggedElement] = useState<PageElement | null>(null);
  const [zoom, setZoom] = useState(100);

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  // Обработка drag & drop
  const handleDragStart = (event: DragStartEvent) => {
    const element = elements.find(el => el.id === event.active.id);
    setDraggedElement(element || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setDraggedElement(null);
      return;
    }

    // Здесь можно добавить логику перемещения элементов
    setDraggedElement(null);
  };

  // Обработчики событий
  const handleElementSelect = (elementId: string) => {
    setSelectedElementId(elementId);
  };

  const handleElementUpdate = (elementId: string, updates: Partial<PageElement>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const handleElementDelete = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  const handleToggleVisibility = (elementId: string) => {
    handleElementUpdate(elementId, { visible: !elements.find(el => el.id === elementId)?.visible });
  };

  const handleToggleLock = (elementId: string) => {
    handleElementUpdate(elementId, { locked: !elements.find(el => el.id === elementId)?.locked });
  };

  const handleAddElement = (element: VisualElement) => {
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: 0,
      y: elements.length * 100
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleAddTemplate = (template: ElementTemplate) => {
    const newElements = template.elements.map((element, index) => ({
      ...element,
      id: `${element.type}-${Date.now()}-${index}`,
      x: 0,
      y: elements.length * 100 + index * 50
    }));
    setElements(prev => [...prev, ...newElements]);
    if (newElements.length > 0) {
      setSelectedElementId(newElements[0].id);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Общая шапка проекта */}
      <SharedHeader
        account={{ name: user?.name || 'Пользователь', email: user?.email || 'user@example.com' }}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        showBackButton={true}
        backButtonText="Назад к сессии"
        backButtonHref={`/sessions/${sessionId}`}
      />

      {/* Панель инструментов редактора */}
      <div className={`border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Информация о проекте */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Конструктор страниц
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Сессия: {sessionId}
                </p>
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                className={`${isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                <Save className="w-4 h-4 mr-1" />
                Сохранить
              </Button>
              
              <Button size="sm" variant="outline" className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                <Download className="w-4 h-4 mr-1" />
                Экспорт PNG
              </Button>
              
              <Button size="sm" variant="outline" className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                <Download className="w-4 h-4 mr-1" />
                Экспорт PDF
              </Button>
              
              <Button size="sm" variant="outline" className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                <Download className="w-4 h-4 mr-1" />
                Экспорт JSON
              </Button>
            </div>

            {/* Zoom */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Zoom</span>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                max={200}
                min={25}
                step={25}
                className="w-20"
              />
              <span className={`text-sm w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{zoom}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Левая панель - компактная */}
        <div className={`w-64 border-r ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-3">
            <Tabs defaultValue="elements" className="w-full">
              <TabsList className={`grid w-full grid-cols-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <TabsTrigger value="elements" className="text-xs">Элементы</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">Слои</TabsTrigger>
              </TabsList>
              
              <TabsContent value="elements" className="mt-3">
                <ElementPalette
                  onAddElement={handleAddElement}
                  onAddTemplate={handleAddTemplate}
                />
              </TabsContent>
              
              <TabsContent value="layers" className="mt-3">
                <LayersPanel
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelectElement={handleElementSelect}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleLock={handleToggleLock}
                  onDeleteElement={handleElementDelete}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Центральная область канваса */}
        <div className={`flex-1 relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div 
            className={`w-full h-full relative ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          >
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div>
                {elements.map((element) => (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    isSelected={selectedElementId === element.id}
                    onSelect={handleElementSelect}
                    onUpdate={handleElementUpdate}
                    onDelete={handleElementDelete}
                  />
                ))}
              </div>
              
              <DragOverlay>
                {draggedElement ? (
                  <div className="opacity-50">
                    <DraggableElement
                      element={draggedElement}
                      isSelected={false}
                      onSelect={() => {}}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Правая панель инспектора */}
        <div className={`w-80 border-l ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4">
            <InspectorPanel
              selectedElement={selectedElement}
              onUpdateElement={handleElementUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;