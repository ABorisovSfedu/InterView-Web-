// Современный визуальный редактор страниц с полноценной библиотекой элементов
// Интерфейс соответствует показанному дизайну

import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
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
  ArrowRight, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Move,
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
import { createElementsFromMod3, Mod3LayoutResponse } from '../lib/templateSystem';

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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем, не нажали ли на resize handle
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      return; // Обработка resize handle в отдельной функции
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
    onSelect(element.id);
    console.log('🎯 Начато перетаскивание элемента:', element.name);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height
    });
    onSelect(element.id);
    console.log(`📏 Начато изменение размера элемента ${element.name} с handle: ${handle}`);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Для full-width элементов ограничиваем перемещение только по вертикали
      if (isFullWidthElement) {
        onUpdate(element.id, { 
          y: Math.max(0, Math.min(newY, 1500 - element.height)) 
        });
      } else {
        onUpdate(element.id, { 
          x: Math.max(0, Math.min(newX, 1200 - element.width)), 
          y: Math.max(0, Math.min(newY, 1500 - element.height)) 
        });
      }
    }
    
    if (isResizing && resizeHandle) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      // Минимальные размеры
      const minWidth = 50;
      const minHeight = 30;
      
      // Максимальные размеры (не больше канваса)
      const maxWidth = 1200 - element.x;
      const maxHeight = 1500 - element.y;
      
      // Для full-width элементов разрешаем изменение только высоты
      if (isFullWidthElement) {
        switch (resizeHandle) {
          case 's': // South (нижний)
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'n': // North (верхний)
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            break;
          default:
            // Для других handles не изменяем размер
            return;
        }
        
        onUpdate(element.id, { 
          height: newHeight
        });
      } else {
        // Обычная логика изменения размера для остальных элементов
        switch (resizeHandle) {
          case 'se': // South East (правый нижний)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'sw': // South West (левый нижний)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'ne': // North East (правый верхний)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            break;
          case 'nw': // North West (левый верхний)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            break;
          case 'e': // East (правый)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            break;
          case 'w': // West (левый)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            break;
          case 's': // South (нижний)
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'n': // North (верхний)
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            break;
        }
        
        onUpdate(element.id, { 
          width: newWidth,
          height: newHeight
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      console.log(`📍 Перемещение элемента ${element.name} в позицию (${element.x}, ${element.y})`);
      setIsDragging(false);
    }
    
    if (isResizing) {
      console.log(`📏 Изменение размера элемента ${element.name} завершено: ${element.width}x${element.height}`);
      setIsResizing(false);
      setResizeHandle(null);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeHandle, resizeStart, element.x, element.y, element.width, element.height]);

  const style = {
    opacity: (isDragging || isResizing) ? 0.5 : element.opacity,
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
    cursor: isDragging ? 'grabbing' : (isResizing ? 'resizing' : 'grab')
  };

  // Определяем элементы, которые должны быть на всю ширину канваса
  const isFullWidthElement = ['header', 'navbar', 'hero', 'footer'].includes(element.type);
  
  // Стили для full-width элементов
  const fullWidthStyle = {
    ...style,
    left: 0,
    width: '1200px', // Полная ширина канваса
    border: isSelected 
      ? (isDark ? '2px solid #60a5fa' : '2px solid #3b82f6')
      : 'none', // Убираем границы для full-width элементов
    borderRadius: 0 // Убираем скругления для full-width элементов
  };

  const elementStyle = isFullWidthElement ? fullWidthStyle : style;

  const renderElementContent = () => {
    switch (element.type) {
      case 'header':
        return (
          <div className={`w-full h-full flex items-center justify-between px-6 py-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-8">
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {element.content || 'Логотип'}
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Главная</a>
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>О нас</a>
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Услуги</a>
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Контакты</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className={`px-4 py-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                Войти
              </button>
            </div>
          </div>
        );
      case 'hero':
        return (
          <div className={`w-full h-full flex items-center justify-center px-6 py-12 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'}`}>
            <div className="text-center max-w-4xl">
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {element.content || 'Добро пожаловать'}
              </h1>
              <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Создавайте удивительные веб-сайты с помощью нашего конструктора
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className={`px-8 py-3 rounded-lg font-semibold ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                  Начать сейчас
                </button>
                <button className={`px-8 py-3 rounded-lg font-semibold border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Узнать больше
                </button>
              </div>
            </div>
          </div>
        );
      case 'heading':
        return (
          <div className={`w-full h-full flex items-center px-6 py-8 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {element.content || 'Заголовок секции'}
            </h2>
          </div>
        );
      case 'text':
        return (
          <div className={`w-full h-full px-6 py-8 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-4xl">
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {element.content || 'Это пример текстового блока. Здесь может быть размещен любой контент: описание услуг, информация о компании, новости или любой другой текстовый материал.'}
              </p>
            </div>
          </div>
        );
      case 'button':
        return (
          <div className={`w-full h-full flex items-center justify-center px-6 py-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <button className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
              {element.content || 'Кнопка действия'}
            </button>
          </div>
        );
      case 'navbar':
        return (
          <div className={`w-full h-full flex items-center justify-between px-6 py-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-8">
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Логотип
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Главная</a>
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>О нас</a>
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Услуги</a>
                <a href="#" className={`hover:opacity-80 transition-opacity ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Контакты</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className={`px-4 py-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                Войти
              </button>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className={`w-full h-full flex items-center justify-center px-6 py-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="w-full max-w-md">
              <div className={`relative flex items-center border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                <Search className={`w-5 h-5 ml-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input 
                  type="text" 
                  placeholder="Поиск по сайту..." 
                  className={`flex-1 py-3 px-3 bg-transparent border-none outline-none ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                />
                <button className={`px-4 py-2 mr-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                  Найти
                </button>
              </div>
            </div>
          </div>
        );
      case 'form':
        return (
          <div className={`w-full h-full px-6 py-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="max-w-md mx-auto">
              <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Свяжитесь с нами
              </h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Ваше имя" 
                  className={`w-full p-3 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  className={`w-full p-3 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                />
                <textarea 
                  placeholder="Сообщение" 
                  rows={4}
                  className={`w-full p-3 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                />
                <button className={`w-full py-3 rounded-lg font-semibold ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                  Отправить сообщение
                </button>
              </div>
            </div>
          </div>
        );
      case 'card':
      case 'cards':
        return (
          <div className={`w-full h-full px-6 py-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-lg mb-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {element.content || 'Услуга 1'}
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Описание услуги или продукта
                </p>
              </div>
              <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-lg mb-4 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}></div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Услуга 2
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Описание услуги или продукта
                </p>
              </div>
              <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-lg mb-4 ${isDark ? 'bg-purple-600' : 'bg-purple-500'}`}></div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Услуга 3
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Описание услуги или продукта
                </p>
              </div>
            </div>
          </div>
        );
      case 'productCard':
      case 'productGrid':
        return (
          <div className={`w-full h-full px-6 py-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`h-48 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {element.content || 'Товар 1'}
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Описание товара
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ₽1,999
                    </span>
                    <button className={`px-4 py-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                      Купить
                    </button>
                  </div>
                </div>
              </div>
              <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`h-48 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Товар 2
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Описание товара
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ₽2,499
                    </span>
                    <button className={`px-4 py-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                      Купить
                    </button>
                  </div>
                </div>
              </div>
              <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`h-48 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Товар 3
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Описание товара
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ₽3,999
                    </span>
                    <button className={`px-4 py-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                      Купить
                    </button>
                  </div>
                </div>
              </div>
              <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`h-48 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Товар 4
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Описание товара
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ₽4,999
                    </span>
                    <button className={`px-4 py-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                      Купить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className={`p-4 text-center rounded ${isDark ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-900'}`}>
            <div className="font-bold text-lg mb-2">
              {element.content || 'Призыв к действию!'}
            </div>
            <button className={`px-4 py-2 rounded ${isDark ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'}`}>
              Начать
            </button>
          </div>
        );
      case 'section':
      case 'container':
        return (
          <div className={`p-4 border-2 border-dashed rounded ${isDark ? 'border-gray-500 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
            <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {element.content || 'Контейнер'}
            </div>
          </div>
        );
      case 'image':
      case 'gallery':
        return (
          <div className={`p-2 flex items-center justify-center border-2 border-dashed rounded ${isDark ? 'border-gray-500 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
            <div className="text-center">
              <Image className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {element.type === 'gallery' ? 'Галерея' : 'Изображение'}
              </span>
            </div>
          </div>
        );
      case 'footer':
        return (
          <div className={`w-full h-full px-6 py-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Компания
                </h3>
                <div className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>О нас</p>
                  <p>Команда</p>
                  <p>Карьера</p>
                  <p>Новости</p>
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Услуги
                </h3>
                <div className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>Веб-разработка</p>
                  <p>Дизайн</p>
                  <p>Маркетинг</p>
                  <p>Консалтинг</p>
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Поддержка
                </h3>
                <div className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>Помощь</p>
                  <p>Документация</p>
                  <p>API</p>
                  <p>Статус</p>
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Контакты
                </h3>
                <div className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>+7 (999) 123-45-67</p>
                  <p>info@company.com</p>
                  <p>Москва, ул. Примерная, 123</p>
                </div>
              </div>
            </div>
            <div className={`border-t mt-8 pt-8 text-center ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
              <p>© 2024 Ваша компания. Все права защищены.</p>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className={`w-full h-full px-6 py-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="max-w-2xl">
              <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Список преимуществ
              </h3>
              <ul className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full mt-1 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}></div>
                  <span>Быстрая загрузка и отзывчивый дизайн</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full mt-1 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}></div>
                  <span>Современные технологии и безопасность</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full mt-1 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}></div>
                  <span>Круглосуточная техническая поддержка</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full mt-1 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}></div>
                  <span>Гибкие тарифные планы</span>
                </li>
              </ul>
            </div>
          </div>
        );
      case 'grid':
        return (
          <div className={`w-full h-full px-6 py-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-lg mb-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Элемент 1
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Описание элемента сетки
                </p>
              </div>
              <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-lg mb-4 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}></div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Элемент 2
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Описание элемента сетки
                </p>
              </div>
              <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-lg mb-4 ${isDark ? 'bg-purple-600' : 'bg-purple-500'}`}></div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Элемент 3
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Описание элемента сетки
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`w-full h-full flex items-center justify-center px-6 py-8 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-lg mb-4 mx-auto ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {element.name || element.type}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Компонент {element.type}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect(element.id)}
      className="group"
    >

      {/* Resize Handles - показываются только для выбранного элемента */}
      {isSelected && (
        <>
          {/* Угловые handles - только для обычных элементов */}
          {!isFullWidthElement && (
            <>
              <div
                className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100"
                onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
              />
              <div
                className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100"
                onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
              />
              <div
                className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100"
                onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
              />
              <div
                className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100"
                onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
              />
            </>
          )}
          
          {/* Боковые handles */}
          {!isFullWidthElement && (
            <>
              <div
                className="resize-handle absolute top-1/2 left-0 w-1 h-6 cursor-w-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100 transform -translate-y-1/2"
                onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
              />
              <div
                className="resize-handle absolute top-1/2 right-0 w-1 h-6 cursor-e-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100 transform -translate-y-1/2"
                onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
              />
            </>
          )}
          
          {/* Вертикальные handles - для всех элементов */}
          <div
            className="resize-handle absolute top-0 left-1/2 w-6 h-1 cursor-n-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100 transform -translate-x-1/2"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="resize-handle absolute bottom-0 left-1/2 w-6 h-1 cursor-s-resize bg-blue-500 border border-white rounded-sm opacity-80 hover:opacity-100 transform -translate-x-1/2"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
        </>
      )}

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
    <div className="space-y-4">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Layers className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Слои</h3>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className={`h-8 w-8 p-0 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Добавить слой"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Список слоев */}
      <div className="space-y-2">
        {elements.map((element, index) => (
          <div
            key={element.id}
            className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              selectedElementId === element.id 
                ? (isDark 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-lg shadow-blue-500/5')
                : (isDark 
                    ? 'hover:bg-gray-700/50 border border-transparent hover:border-gray-600' 
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-200')
            }`}
            onClick={() => onSelectElement(element.id)}
          >
            {/* Иконка элемента */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {element.icon}
            </div>
            
            {/* Информация о слое */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {element.name || element.type}
              </div>
              <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Слой {index + 1}
              </div>
            </div>
            
            {/* Кнопки управления */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 w-7 p-0 rounded-lg ${isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(element.id);
                }}
                title={element.visible ? 'Скрыть элемент' : 'Показать элемент'}
              >
                {element.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 w-7 p-0 rounded-lg ${isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(element.id);
                }}
                title={element.locked ? 'Разблокировать' : 'Заблокировать'}
              >
                {element.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 w-7 p-0 rounded-lg ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteElement(element.id);
                }}
                title="Удалить элемент"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
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
  onDuplicateElement: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement
}) => {
  const { isDark } = useTheme();
  
  if (!selectedElement) {
    return (
      <div className={`p-6 text-center rounded-xl ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
        <Settings className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Выберите элемент
        </h3>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Кликните на элемент для редактирования
        </p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    onUpdateElement(selectedElement.id, { [property]: value });
  };

  return (
    <div className="space-y-4">
      {/* Название элемента и кнопки действий */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedElement.name || selectedElement.type}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Тип: {selectedElement.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDuplicateElement(selectedElement.id)}
              className={`h-7 w-7 p-0 rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
              title="Дублировать элемент"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeleteElement(selectedElement.id)}
              className={`h-7 w-7 p-0 rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600' : 'border-gray-300 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:border-red-300'}`}
              title="Удалить элемент"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <Separator className={isDark ? 'bg-gray-600' : 'bg-gray-200'} />

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
  const [showElements, setShowElements] = useState(false);

  const categories = Object.entries(elementLibrary.categories).filter(([key]) => key !== 'templates');
  
  const filteredElements = getElementsByCategory(activeCategory);

  const handleElementClick = (element: VisualElement) => {
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: 0,
      y: 0
    };
    onAddElement(newElement);
  };

  const handleBackToCategories = () => {
    setShowElements(false);
  };

  const handleCategoryClick = (categoryKey: string) => {
    setActiveCategory(categoryKey as ElementCategory);
    setShowElements(true);
  };

  return (
    <div className="space-y-4">

      {!showElements ? (
        /* Категории */
        <div className="space-y-3">
          <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Категории
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(([key, category]) => (
              <Button
                key={key}
                size="sm"
                variant="ghost"
                onClick={() => handleCategoryClick(key)}
                className={`h-auto p-3 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'hover:bg-gray-700/50 hover:border-gray-500' 
                    : 'hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className={`text-lg transition-transform duration-300 group-hover:scale-105`}>
                  {category.icon}
                </div>
                <div className={`text-xs font-medium transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {category.name}
                </div>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        /* Элементы выбранной категории */
        <div className="space-y-3">
          {/* Заголовок с кнопкой "Назад" */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleBackToCategories}
                className={`p-1 h-8 w-8 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {categories.find(([key]) => key === activeCategory)?.[1].name}
              </h3>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {filteredElements.length}
            </div>
          </div>
          
          <ScrollArea className="h-72">
            <div className="space-y-2 pr-2">
              {filteredElements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => handleElementClick(element)}
                  className={`group relative p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                    isDark 
                      ? 'border-gray-600 hover:border-blue-400 hover:bg-gradient-to-r hover:from-gray-700/80 hover:to-gray-600/80 hover:shadow-blue-500/25' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 hover:shadow-blue-400/20'
                  }`}
                >
                  {/* Иконка с градиентным фоном */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-all duration-300 group-hover:scale-110 ${
                    isDark 
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-400/30 group-hover:to-purple-400/30' 
                      : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200'
                  }`}>
                    <div className={`transition-colors duration-300 ${
                      isDark ? 'text-blue-300 group-hover:text-blue-200' : 'text-blue-600 group-hover:text-blue-700'
                    }`}>
                      {element.icon}
                    </div>
                  </div>
                  
                  {/* Контент */}
                  <div className="space-y-1">
                    <div className={`font-semibold text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-100 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'
                    }`}>
                      {element.name}
                    </div>
                    <div className={`text-xs leading-relaxed transition-colors duration-300 ${
                      isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                    }`}>
                      {element.description}
                    </div>
                  </div>
                  
                  {/* Индикатор типа */}
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-all duration-300 ${
                    element.category === 'basic' ? (isDark ? 'bg-green-400' : 'bg-green-500') :
                    element.category === 'layout' ? (isDark ? 'bg-blue-400' : 'bg-blue-500') :
                    element.category === 'media' ? (isDark ? 'bg-purple-400' : 'bg-purple-500') :
                    element.category === 'forms' ? (isDark ? 'bg-orange-400' : 'bg-orange-500') :
                    element.category === 'navigation' ? (isDark ? 'bg-pink-400' : 'bg-pink-500') :
                    (isDark ? 'bg-gray-400' : 'bg-gray-500')
                  }`} />
                  
                  {/* Hover эффект */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5' 
                      : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                  }`} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

// Основной компонент редактора
const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  // Получаем projectId и sessionId из URL напрямую
  const pathParts = window.location.pathname.split('/');
  const projectId = pathParts[2]; // /builder/{projectId}/{sessionId}
  const sessionId = pathParts[3]; // /builder/{projectId}/{sessionId}
  
  console.log('🎨 BuilderPage загружен');
  console.log('🆔 SessionId из URL:', sessionId);
  console.log('📁 ProjectId:', projectId);
  console.log('🌐 Текущий URL:', window.location.pathname);
  console.log('📊 URL parts:', pathParts);
  
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
  
  // Состояние видимости меню - по умолчанию скрыты для максимального пространства
  const [leftMenuVisible, setLeftMenuVisible] = useState(false);
  const [rightMenuVisible, setRightMenuVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  // Загрузка данных при монтировании компонента
  // Загружаем сохраненный layout при инициализации
  useEffect(() => {
    const loadSavedLayout = async () => {
      if (!sessionId) return;
      
      try {
        console.log('🔄 Загружаем сохраненный layout для сессии:', sessionId);
        const savedLayout = await apiClient.loadLayout(sessionId);
        if (savedLayout && savedLayout.elements) {
          console.log('✅ Получен layout из базы данных:', savedLayout);
          setElements(savedLayout.elements);
        }
      } catch (error) {
        console.log('⚠️ Layout не найден в БД:', error.message);
        // Fallback к localStorage
        const storedLayout = localStorage.getItem(`layout_${sessionId}`);
        if (storedLayout) {
          try {
            const layoutData = JSON.parse(storedLayout);
            console.log('✅ Получен layout из localStorage:', layoutData);
            setElements(layoutData.elements);
          } catch (parseError) {
            console.error('❌ Ошибка парсинга localStorage:', parseError);
          }
        }
      }
    };
    
    loadSavedLayout();
  }, [sessionId]);

  useEffect(() => {
    const loadPageData = async () => {
    if (!sessionId) return;

      try {
        console.log('🔄 Загружаем данные для сессии:', sessionId);
        
        // Сначала проверяем localStorage на наличие данных Mod3
        const storedMod3Data = localStorage.getItem(`mod3_layout_${sessionId}`);
        if (storedMod3Data) {
          try {
            const mod3Data: Mod3LayoutResponse = JSON.parse(storedMod3Data);
            console.log('✅ Получены данные Mod3 из localStorage:', mod3Data);
            
            // Создаем элементы из ответа Mod3
            const generatedElements = createElementsFromMod3(mod3Data);
            console.log('🎨 Созданы элементы из шаблона:', generatedElements);
            
            setElements(generatedElements);
            return;
          } catch (error) {
            console.error('❌ Ошибка парсинга данных Mod3 из localStorage:', error);
          }
        }

        // Затем пытаемся загрузить напрямую из Mod3
        try {
          const mod3Response = await fetch(`http://localhost:9001/v1/layout/${sessionId}`);
          if (mod3Response.ok) {
            const mod3Data: Mod3LayoutResponse = await mod3Response.json();
            console.log('✅ Получены данные от Mod3:', mod3Data);
            
            // Создаем элементы из ответа Mod3
            const generatedElements = createElementsFromMod3(mod3Data);
            console.log('🎨 Созданы элементы из шаблона:', generatedElements);
            
            setElements(generatedElements);
            return;
          }
        } catch (mod3Error) {
          console.log('⚠️ Mod3 недоступен, пробуем альтернативный источник');
        }
        
        // Fallback: загружаем из веб-API
        const response = await apiClient.get(`/web/v1/session/${sessionId}/layout`);
        if (response.data && response.data.sections) {
          console.log('✅ Получены данные от веб-API:', response.data);
          
          // Конвертируем данные в элементы
          const convertedElements = convertLayoutToElements(response.data);
          setElements(convertedElements);
        } else {
          console.log('📝 Данные не найдены, используем элементы по умолчанию');
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        // Используем элементы по умолчанию при ошибке
      }
    };

    loadPageData();
  }, [sessionId]);

  // Функция для конвертации layout в элементы (fallback)
  const convertLayoutToElements = (layout: any): PageElement[] => {
    const elements: PageElement[] = [];
    
    if (layout.sections) {
      Object.entries(layout.sections).forEach(([sectionName, sectionData]: [string, any]) => {
        if (Array.isArray(sectionData)) {
          sectionData.forEach((block: any, index: number) => {
            const element: PageElement = {
              id: `${sectionName}-${index}-${Date.now()}`,
              type: block.component || 'text',
              category: 'basic',
              name: block.component || 'Элемент',
              description: '',
              icon: '📄',
              content: block.props?.text || block.props?.content || 'Контент',
              x: index * 50,
              y: sectionName === 'hero' ? 0 : sectionName === 'main' ? 200 : 400,
              width: 200,
              height: 100,
              zIndex: 1,
              opacity: 1,
              locked: false,
              visible: true,
              props: block.props || {},
              styles: {}
            };
            elements.push(element);
          });
        }
      });
    }
    
    return elements;
  };

  // Обработчики событий
  const handleElementSelect = (elementId: string) => {
    setSelectedElementId(elementId);
  };

  // Автоматическое сохранение с debounce
  const debouncedSave = useCallback(
    debounce(async (elementsToSave: PageElement[]) => {
      if (!sessionId || elementsToSave.length === 0) return;
      
      try {
        const layoutData = {
          sessionId,
          elements: elementsToSave,
          timestamp: new Date().toISOString()
        };
        
        await apiClient.saveLayout(sessionId, layoutData);
        console.log('💾 Автосохранение выполнено');
      } catch (error) {
        console.error('❌ Ошибка автосохранения:', error);
      }
    }, 2000), // Сохраняем через 2 секунды после последнего изменения
    [sessionId]
  );

  // Эффект для автосохранения при изменении элементов
  useEffect(() => {
    if (elements.length > 0) {
      debouncedSave(elements);
    }
  }, [elements, debouncedSave]);

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

  const handleElementDuplicate = (elementId: string) => {
    const elementToDuplicate = elements.find(el => el.id === elementId);
    if (elementToDuplicate) {
      const duplicatedElement = {
        ...elementToDuplicate,
        id: `${elementToDuplicate.type}-${Date.now()}`,
        x: elementToDuplicate.x + 20, // Смещаем на 20px вправо
        y: elementToDuplicate.y + 20, // Смещаем на 20px вниз
        name: `${elementToDuplicate.name} (копия)`
      };
      setElements(prev => [...prev, duplicatedElement]);
      setSelectedElementId(duplicatedElement.id);
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

  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      const layoutData = {
        sessionId,
        elements: elements,
        timestamp: new Date().toISOString()
      };
      
      // Сохраняем в базу данных через API
      await apiClient.saveLayout(sessionId, layoutData);
      
      // Также сохраняем в localStorage как резервную копию
      localStorage.setItem(`layout_${sessionId}`, JSON.stringify(layoutData));
      
      console.log('✅ Layout сохранен в базу данных:', sessionId);
      alert('Макет успешно сохранен!');
    } catch (error) {
      console.error('❌ Ошибка сохранения layout:', error);
      alert('Ошибка при сохранении макета: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportHTML = () => {
    try {
      // Генерируем HTML
      const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Экспортированная страница - ${sessionId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
    }
    .page-container {
      width: 1200px;
      margin: 0 auto;
      position: relative;
      min-height: 100vh;
    }
    .element {
      position: absolute;
    }
  </style>
</head>
<body>
  <div class="page-container">
${elements.map(element => `    <div class="element" style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; opacity: ${element.opacity}; z-index: ${element.zIndex}; display: ${element.visible ? 'block' : 'none'};">
      <div>${element.content || element.name}</div>
    </div>`).join('\n')}
  </div>
</body>
</html>`;

      // Создаем Blob и скачиваем
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `page_${sessionId}_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ HTML экспортирован');
      alert('HTML файл успешно экспортирован!');
    } catch (error) {
      console.error('❌ Ошибка экспорта HTML:', error);
      alert('Ошибка при экспорте HTML');
    }
  };

  const handleExportPNG = async () => {
    try {
      // Создаем canvas для рендеринга
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Не удалось получить контекст canvas');
      }

      // Размеры canvas (1200x800 для стандартного макета)
      const canvasWidth = 1200;
      const canvasHeight = 800;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Белый фон
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Рендерим каждый элемент
      elements.forEach(element => {
        if (!element.visible) return;

        // Позиция и размеры
        const x = element.x;
        const y = element.y;
        const width = element.width;
        const height = element.height;

        // Настройки стиля
        ctx.globalAlpha = element.opacity;
        ctx.fillStyle = '#f8f9fa';
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;

        // Рисуем прямоугольник элемента
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);

        // Добавляем текст
        if (element.content || element.name) {
          ctx.fillStyle = '#374151';
          ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          
          const text = element.content || element.name || element.type;
          const maxWidth = width - 16; // Отступы
          const maxHeight = height - 16;
          
          // Обрезаем текст если не помещается
          let displayText = text;
          if (ctx.measureText(text).width > maxWidth) {
            displayText = text.substring(0, Math.floor(maxWidth / 8)) + '...';
          }
          
          ctx.fillText(displayText, x + 8, y + 8);
        }

        // Добавляем тип элемента в углу
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(element.type, x + 4, y + height - 12);
      });

      // Конвертируем canvas в PNG и скачиваем
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Не удалось создать PNG изображение');
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `layout_${sessionId}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png', 0.95);

      console.log('✅ PNG экспортирован');
      alert('PNG файл успешно экспортирован!');
    } catch (error) {
      console.error('❌ Ошибка экспорта PNG:', error);
      alert('Ошибка при экспорте PNG: ' + error.message);
    }
  };

    return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Общая шапка проекта - фиксированная */}
      <div className="sticky top-0 z-60">
        <SharedHeader
          account={{ name: user?.name || 'Пользователь', email: user?.email || 'user@example.com' }}
          isDark={isDark}
          onThemeToggle={toggleTheme}
          showBackButton={false}
        />
      </div>

      {/* Панель инструментов редактора - фиксированная под шапкой */}
      <div className={`border-b flex-shrink-0 sticky top-0 z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Информация о проекте */}
            <div className="flex items-center space-x-4">
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigate(`/projects/${projectId}`);
                  // Принудительно обновляем страницу через history API
                  window.history.pushState({}, "", `/projects/${projectId}`);
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className={`h-8 w-8 p-0 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Вернуться к проекту"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
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
                onClick={handleSaveLayout}
                disabled={isSaving}
                className={`${isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleExportHTML}
                className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
              >
                <Download className="w-4 h-4 mr-1" />
                Экспорт HTML
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleExportPNG}
                className={isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
              >
                <Download className="w-4 h-4 mr-1" />
                Экспорт PNG
              </Button>
            </div>

            {/* Управление меню */}
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setLeftMenuVisible(!leftMenuVisible);
                  setRightMenuVisible(!rightMenuVisible);
                }}
                className={`h-8 w-8 p-0 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                title={leftMenuVisible && rightMenuVisible ? 'Скрыть все меню' : 'Показать все меню'}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setLeftMenuVisible(!leftMenuVisible)}
                className={`h-8 w-8 p-0 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                title={leftMenuVisible ? 'Скрыть левое меню' : 'Показать левое меню'}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setRightMenuVisible(!rightMenuVisible)}
                className={`h-8 w-8 p-0 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                title={rightMenuVisible ? 'Скрыть правое меню' : 'Показать правое меню'}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент - занимает оставшееся место */}
      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель - фиксированная на высоту монитора */}
        {leftMenuVisible && (
          <div className={`w-72 border-r flex-shrink-0 transition-all duration-300 sticky left-0 top-0 z-30 h-[100vh] ${isDark ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'} shadow-lg`}>
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                <div className="mb-4">
                  <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Библиотека элементов
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Перетащите элементы на полотно
                  </p>
                </div>
                
                <Tabs defaultValue="elements" className="w-full">
                  <TabsList className={`grid w-full grid-cols-2 mb-4 p-1 rounded-xl ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 shadow-lg' : 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 shadow-lg'} backdrop-blur-sm`}>
                    <TabsTrigger 
                      value="elements" 
                      className={`text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 ${
                        isDark 
                          ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 hover:bg-gray-700/50 text-gray-300' 
                          : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-400/25 hover:bg-gray-200/50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center ${
                          isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                          <Palette className={`w-3 h-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        Элементы
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="layers" 
                      className={`text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 ${
                        isDark 
                          ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 hover:bg-gray-700/50 text-gray-300' 
                          : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-400/25 hover:bg-gray-200/50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center ${
                          isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                        }`}>
                          <Layers className={`w-3 h-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        </div>
                        Слои
                      </div>
                    </TabsTrigger>
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
          </div>
        )}

        {/* Центральная область канваса - прокручиваемая */}
        <div className={`flex-1 relative overflow-auto ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div 
            className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{ 
              width: '1200px',
              minHeight: '1500px',
              margin: '20px auto'
            }}
          >
            {/* Элементы страницы */}
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
          </div>
        </div>

        {/* Правая панель инспектора - фиксированная на высоту монитора */}
        {rightMenuVisible && (
          <div className={`w-80 border-l flex-shrink-0 transition-all duration-300 sticky right-0 top-0 z-30 h-[100vh] ${isDark ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'} shadow-lg`}>
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                <div className="mb-4">
                  <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Инспектор свойств
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Настройте параметры элемента
                  </p>
                </div>
                <InspectorPanel
                  selectedElement={selectedElement}
                  onUpdateElement={handleElementUpdate}
                  onDuplicateElement={handleElementDuplicate}
                  onDeleteElement={handleElementDelete}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderPage;