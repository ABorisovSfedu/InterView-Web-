// Библиотека визуальных элементов для рендеринга страниц
// Получает данные от Mod3 и строит страницу из визуальных элементов

import React from 'react';
import { MapResponse, ComponentMatch } from '../../api/mod3Client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  Star, 
  Heart,
  ShoppingCart,
  Search,
  Menu,
  X,
  ArrowRight,
  Download,
  Upload,
  Settings,
  Home,
  Info,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Типы для визуальных компонентов
export interface VisualComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: VisualComponent[];
  confidence?: number;
  matchType?: string;
}

export interface PageLayout {
  template: string;
  sections: {
    [key: string]: VisualComponent[];
  };
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Базовые визуальные компоненты
export const VisualComponents = {
  // UI Components
  'ui.button': ({ text, variant = 'default', size = 'default', onClick, ...props }: any) => (
    <Button variant={variant} size={size} onClick={onClick} {...props}>
      {text || 'Кнопка'}
    </Button>
  ),

  'ui.input': ({ placeholder, type = 'text', value, onChange, ...props }: any) => (
    <Input 
      type={type} 
      placeholder={placeholder || 'Введите текст...'} 
      value={value} 
      onChange={onChange} 
      {...props} 
    />
  ),

  'ui.textarea': ({ placeholder, rows = 3, value, onChange, ...props }: any) => (
    <Textarea 
      placeholder={placeholder || 'Введите текст...'} 
      rows={rows} 
      value={value} 
      onChange={onChange} 
      {...props} 
    />
  ),

  'ui.badge': ({ text, variant = 'default', ...props }: any) => (
    <Badge variant={variant} {...props}>
      {text || 'Бейдж'}
    </Badge>
  ),

  // Layout Components
  'ui.card': ({ title, description, children, ...props }: any) => (
    <Card {...props}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
    </Card>
  ),

  'ui.container': ({ children, className = '', ...props }: any) => (
    <div className={`container mx-auto px-4 ${className}`} {...props}>
      {children}
    </div>
  ),

  'ui.section': ({ children, className = '', ...props }: any) => (
    <section className={`py-8 ${className}`} {...props}>
      {children}
    </section>
  ),

  'ui.grid': ({ children, cols = 1, gap = 4, className = '', ...props }: any) => (
    <div 
      className={`grid grid-cols-${cols} gap-${gap} ${className}`} 
      {...props}
    >
      {children}
    </div>
  ),

  'ui.flex': ({ children, direction = 'row', justify = 'start', align = 'start', className = '', ...props }: any) => (
    <div 
      className={`flex flex-${direction} justify-${justify} items-${align} ${className}`} 
      {...props}
    >
      {children}
    </div>
  ),

  // Content Components
  'ui.heading': ({ level = 1, text, className = '', ...props }: any) => {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <HeadingTag className={`font-bold ${className}`} {...props}>
        {text || `Заголовок ${level}`}
      </HeadingTag>
    );
  },

  'ui.paragraph': ({ text, className = '', ...props }: any) => (
    <p className={`text-gray-700 ${className}`} {...props}>
      {text || 'Текст параграфа'}
    </p>
  ),

  'ui.list': ({ items, ordered = false, className = '', ...props }: any) => {
    const ListTag = ordered ? 'ol' : 'ul';
    return (
      <ListTag className={`list-disc list-inside ${className}`} {...props}>
        {items?.map((item: string, index: number) => (
          <li key={index}>{item}</li>
        )) || <li>Элемент списка</li>}
      </ListTag>
    );
  },

  // Form Components
  'ui.form': ({ children, onSubmit, className = '', ...props }: any) => (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`} {...props}>
      {children}
    </form>
  ),

  'ui.label': ({ text, htmlFor, className = '', ...props }: any) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
      {text || 'Метка'}
    </label>
  ),

  'ui.select': ({ options, value, onChange, placeholder, ...props }: any) => (
    <select 
      value={value} 
      onChange={onChange} 
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((option: any, index: number) => (
        <option key={index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  ),

  'ui.checkbox': ({ label, checked, onChange, ...props }: any) => (
    <div className="flex items-center">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        {...props}
      />
      {label && <label className="ml-2 block text-sm text-gray-900">{label}</label>}
    </div>
  ),

  'ui.radio': ({ name, options, value, onChange, ...props }: any) => (
    <div className="space-y-2">
      {options?.map((option: any, index: number) => (
        <div key={index} className="flex items-center">
          <input 
            type="radio" 
            name={name}
            value={option.value || option}
            checked={value === (option.value || option)}
            onChange={onChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            {...props}
          />
          <label className="ml-2 block text-sm text-gray-900">
            {option.label || option}
          </label>
        </div>
      ))}
    </div>
  ),

  // Navigation Components
  'ui.nav': ({ children, className = '', ...props }: any) => (
    <nav className={`bg-white shadow ${className}`} {...props}>
      {children}
    </nav>
  ),

  'ui.navbar': ({ brand, links, className = '', ...props }: any) => (
    <nav className={`bg-white shadow-lg ${className}`} {...props}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {brand && <div className="text-xl font-bold">{brand}</div>}
          </div>
          <div className="flex items-center space-x-4">
            {links?.map((link: any, index: number) => (
              <a key={index} href={link.href} className="text-gray-700 hover:text-gray-900">
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  ),

  'ui.breadcrumb': ({ items, className = '', ...props }: any) => (
    <nav className={`flex ${className}`} {...props}>
      <ol className="flex items-center space-x-2">
        {items?.map((item: any, index: number) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
            <a href={item.href} className="text-gray-500 hover:text-gray-700">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  ),

  // Media Components
  'ui.image': ({ src, alt, className = '', ...props }: any) => (
    <img 
      src={src || 'https://via.placeholder.com/300x200'} 
      alt={alt || 'Изображение'} 
      className={`w-full h-auto ${className}`} 
      {...props} 
    />
  ),

  'ui.video': ({ src, controls = true, className = '', ...props }: any) => (
    <video 
      src={src} 
      controls={controls}
      className={`w-full ${className}`} 
      {...props}
    >
      Ваш браузер не поддерживает видео.
    </video>
  ),

  // Icon Components
  'ui.icon': ({ name, size = 24, className = '', ...props }: any) => {
    const icons: Record<string, React.ComponentType<any>> = {
      mail: Mail,
      phone: Phone,
      map: MapPin,
      user: User,
      calendar: Calendar,
      clock: Clock,
      star: Star,
      heart: Heart,
      cart: ShoppingCart,
      search: Search,
      menu: Menu,
      close: X,
      arrow: ArrowRight,
      download: Download,
      upload: Upload,
      settings: Settings,
      home: Home,
      info: Info,
      check: CheckCircle,
      alert: AlertCircle,
      eye: Eye,
      edit: Edit,
      trash: Trash2,
      plus: Plus,
      minus: Minus,
      chevronDown: ChevronDown,
      chevronUp: ChevronUp,
      chevronLeft: ChevronLeft,
      chevronRight: ChevronRight
    };

    const IconComponent = icons[name] || Info;
    return <IconComponent size={size} className={className} {...props} />;
  },

  // Special Components
  'ui.hero': ({ title, subtitle, backgroundImage, children, className = '', ...props }: any) => (
    <section 
      className={`relative bg-cover bg-center py-20 ${className}`}
      style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }}
      {...props}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
        {title && <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>}
        {subtitle && <p className="text-xl md:text-2xl mb-8">{subtitle}</p>}
        {children}
      </div>
    </section>
  ),

  'ui.footer': ({ copyright, links, className = '', ...props }: any) => (
    <footer className={`bg-gray-800 text-white py-8 ${className}`} {...props}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {links?.map((section: any, index: number) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items?.map((link: any, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="text-gray-300 hover:text-white">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {copyright && (
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            {copyright}
          </div>
        )}
      </div>
    </footer>
  ),

  'ui.testimonial': ({ quote, author, role, avatar, className = '', ...props }: any) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`} {...props}>
      <blockquote className="text-gray-700 mb-4">
        "{quote || 'Отличный сервис!'}"
      </blockquote>
      <div className="flex items-center">
        {avatar && (
          <img 
            src={avatar} 
            alt={author} 
            className="w-12 h-12 rounded-full mr-4"
          />
        )}
        <div>
          <div className="font-semibold text-gray-900">{author || 'Имя автора'}</div>
          {role && <div className="text-gray-600 text-sm">{role}</div>}
        </div>
      </div>
    </div>
  ),

  'ui.pricing': ({ plans, className = '', ...props }: any) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`} {...props}>
      {plans?.map((plan: any, index: number) => (
        <Card key={index} className="text-center">
          <CardHeader>
            <CardTitle>{plan.name || 'План'}</CardTitle>
            <div className="text-3xl font-bold">{plan.price || '0₽'}</div>
            <CardDescription>{plan.period || '/месяц'}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {plan.features?.map((feature: string, featureIndex: number) => (
                <li key={featureIndex} className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="w-full">{plan.buttonText || 'Выбрать план'}</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  ),

  // Новые компоненты для расширенного словаря
  'ui.gallery': ({ images, className = '', ...props }: any) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`} {...props}>
      {images?.map((image: any, index: number) => (
        <div key={index} className="relative overflow-hidden rounded-lg">
          <img 
            src={image.src || 'https://via.placeholder.com/300x200'} 
            alt={image.alt || 'Галерея'} 
            className="w-full h-48 object-cover hover:scale-105 transition-transform"
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  ),

  'ui.slider': ({ slides, className = '', ...props }: any) => (
    <div className={`relative overflow-hidden rounded-lg ${className}`} {...props}>
      <div className="flex transition-transform duration-300">
        {slides?.map((slide: any, index: number) => (
          <div key={index} className="w-full flex-shrink-0">
            <img 
              src={slide.image || 'https://via.placeholder.com/800x400'} 
              alt={slide.title || 'Слайд'} 
              className="w-full h-64 object-cover"
            />
            {slide.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <h3 className="text-xl font-bold">{slide.title}</h3>
                {slide.description && <p className="text-sm">{slide.description}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  ),

  'ui.accordion': ({ items, className = '', ...props }: any) => (
    <div className={`space-y-2 ${className}`} {...props}>
      {items?.map((item: any, index: number) => (
        <div key={index} className="border rounded-lg">
          <div className="p-4 cursor-pointer hover:bg-gray-50">
            <h3 className="font-semibold">{item.title || 'Заголовок'}</h3>
          </div>
          <div className="px-4 pb-4">
            <p className="text-gray-700">{item.content || 'Содержимое'}</p>
          </div>
        </div>
      ))}
    </div>
  ),

  'ui.tabs': ({ tabs, className = '', ...props }: any) => (
    <div className={`${className}`} {...props}>
      <div className="flex border-b">
        {tabs?.map((tab: any, index: number) => (
          <button 
            key={index}
            className="px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
          >
            {tab.title || `Вкладка ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs?.[0]?.content || 'Содержимое вкладки'}
      </div>
    </div>
  ),

  'ui.modal': ({ title, content, isOpen, onClose, className = '', ...props }: any) => (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${className}`} {...props}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{title || 'Модальное окно'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>{content || 'Содержимое модального окна'}</div>
        </div>
      </div>
    ) : null
  ),

  'ui.alert': ({ type = 'info', message, className = '', ...props }: any) => {
    const alertClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };
    
    return (
      <div className={`p-4 border rounded-lg ${alertClasses[type]} ${className}`} {...props}>
        <div className="flex items-center">
          {type === 'info' && <Info className="w-5 h-5 mr-2" />}
          {type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
          {type === 'warning' && <AlertCircle className="w-5 h-5 mr-2" />}
          {type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
          <span>{message || 'Уведомление'}</span>
        </div>
      </div>
    );
  },

  'ui.progress': ({ value = 0, max = 100, className = '', ...props }: any) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`} {...props}>
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  ),

  'ui.spinner': ({ size = 'md', className = '', ...props }: any) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    
    return (
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]} ${className}`} {...props} />
    );
  },

  'ui.table': ({ headers, rows, className = '', ...props }: any) => (
    <div className={`overflow-x-auto ${className}`} {...props}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers?.map((header: string, index: number) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows?.map((row: any[], rowIndex: number) => (
            <tr key={rowIndex}>
              {row.map((cell: any, cellIndex: number) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),

  'ui.calendar': ({ events, className = '', ...props }: any) => (
    <div className={`bg-white rounded-lg shadow ${className}`} {...props}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Календарь</h3>
        <div className="grid grid-cols-7 gap-1">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => (
            <div key={i} className="p-2 text-center text-sm hover:bg-gray-100 rounded">
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  'ui.search': ({ placeholder, onSearch, className = '', ...props }: any) => (
    <div className={`relative ${className}`} {...props}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input 
        type="text"
        placeholder={placeholder || 'Поиск...'}
        className="pl-10"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  ),

  'ui.filter': ({ options, onFilter, className = '', ...props }: any) => (
    <div className={`space-y-2 ${className}`} {...props}>
      {options?.map((option: any, index: number) => (
        <label key={index} className="flex items-center">
          <input 
            type="checkbox" 
            className="mr-2"
            onChange={(e) => onFilter?.(option.value, e.target.checked)}
          />
          <span>{option.label || option}</span>
        </label>
      ))}
    </div>
  ),

  'ui.pagination': ({ currentPage, totalPages, onPageChange, className = '', ...props }: any) => (
    <div className={`flex items-center justify-between ${className}`} {...props}>
      <button 
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
      >
        Назад
      </button>
      <span className="text-sm text-gray-700">
        Страница {currentPage} из {totalPages}
      </span>
      <button 
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
      >
        Вперед
      </button>
    </div>
  ),

  'ui.sidebar': ({ items, className = '', ...props }: any) => (
    <div className={`w-64 bg-gray-100 p-4 ${className}`} {...props}>
      <nav>
        {items?.map((item: any, index: number) => (
          <a 
            key={index}
            href={item.href}
            className="block py-2 px-3 text-gray-700 hover:bg-gray-200 rounded"
          >
            {item.text || `Пункт ${index + 1}`}
          </a>
        ))}
      </nav>
    </div>
  ),

  'ui.header': ({ title, subtitle, className = '', ...props }: any) => (
    <header className={`bg-white shadow-sm border-b ${className}`} {...props}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
    </header>
  ),

  'ui.menu': ({ items, className = '', ...props }: any) => (
    <nav className={`${className}`} {...props}>
      <ul className="flex space-x-4">
        {items?.map((item: any, index: number) => (
          <li key={index}>
            <a 
              href={item.href}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              {item.text || `Пункт ${index + 1}`}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ),

  'ui.dropdown': ({ options, onSelect, className = '', ...props }: any) => (
    <div className={`relative ${className}`} {...props}>
      <select 
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        onChange={(e) => onSelect?.(e.target.value)}
      >
        {options?.map((option: any, index: number) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  ),

  'ui.tooltip': ({ content, children, className = '', ...props }: any) => (
    <div className={`relative group ${className}`} {...props}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {content || 'Подсказка'}
      </div>
    </div>
  ),

  'ui.popup': ({ isOpen, onClose, children, className = '', ...props }: any) => (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-lg p-6 max-w-lg w-full mx-4 ${className}`} {...props}>
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    ) : null
  ),

  'ui.overlay': ({ children, className = '', ...props }: any) => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 ${className}`} {...props}>
      {children}
    </div>
  ),

  'ui.spoiler': ({ title, content, isOpen, onToggle, className = '', ...props }: any) => (
    <div className={`border rounded-lg ${className}`} {...props}>
      <button 
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-gray-50 flex justify-between items-center"
      >
        <span className="font-medium">{title || 'Заголовок'}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t">
          {content || 'Содержимое'}
        </div>
      )}
    </div>
  ),

  'ui.tag': ({ text, color = 'blue', className = '', ...props }: any) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color]} ${className}`} {...props}>
        {text || 'Тег'}
      </span>
    );
  },

  'ui.chip': ({ text, onRemove, className = '', ...props }: any) => (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 ${className}`} {...props}>
      <span>{text || 'Чип'}</span>
      {onRemove && (
        <button 
          onClick={onRemove}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  ),

  'ui.avatar': ({ src, alt, size = 'md', className = '', ...props }: any) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };
    
    return (
      <img 
        src={src || 'https://via.placeholder.com/100x100'} 
        alt={alt || 'Аватар'} 
        className={`rounded-full ${sizeClasses[size]} ${className}`} 
        {...props}
      />
    );
  },

  'ui.rating': ({ value = 0, max = 5, onRate, className = '', ...props }: any) => (
    <div className={`flex items-center ${className}`} {...props}>
      {Array.from({ length: max }, (_, i) => (
        <button 
          key={i}
          onClick={() => onRate?.(i + 1)}
          className="text-yellow-400 hover:text-yellow-500"
        >
          <Star className={`w-5 h-5 ${i < value ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  ),

  'ui.counter': ({ value = 0, onIncrement, onDecrement, className = '', ...props }: any) => (
    <div className={`flex items-center space-x-2 ${className}`} {...props}>
      <button 
        onClick={onDecrement}
        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-lg font-medium">{value}</span>
      <button 
        onClick={onIncrement}
        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
};

// Функция для рендеринга компонента
export const renderVisualComponent = (component: VisualComponent): React.ReactElement => {
  const ComponentRenderer = VisualComponents[component.type as keyof typeof VisualComponents];
  
  if (!ComponentRenderer) {
    console.warn(`Unknown component type: ${component.type}`);
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Неизвестный компонент: {component.type}
      </div>
    );
  }

  // Рендерим дочерние компоненты
  const children = component.children?.map((child, index) => 
    React.createElement(React.Fragment, { key: index }, renderVisualComponent(child))
  );

  // Добавляем информацию о сопоставлении
  const props = {
    ...component.props,
    children,
    'data-confidence': component.confidence,
    'data-match-type': component.matchType,
    className: `${component.props.className || ''} ${component.confidence ? 'opacity-90' : ''}`.trim()
  };

  return React.createElement(ComponentRenderer, props);
};

// Функция для рендеринга секции
export const renderSection = (sectionName: string, components: VisualComponent[]): React.ReactElement => {
  return (
    <div key={sectionName} className={`section-${sectionName} mb-8`}>
      {components.map((component, index) => (
        <div key={index} className="mb-4">
          {renderVisualComponent(component)}
        </div>
      ))}
    </div>
  );
};

// Функция для рендеринга всей страницы
export const renderPage = (layout: PageLayout): React.ReactElement => {
  const { template, sections, metadata } = layout;

  return (
    <div className={`page-template-${template} min-h-screen bg-gray-50`}>
      {metadata?.title && (
        <head>
          <title>{metadata.title}</title>
          {metadata.description && <meta name="description" content={metadata.description} />}
          {metadata.keywords && <meta name="keywords" content={metadata.keywords.join(', ')} />}
        </head>
      )}
      
      {sections && Object.entries(sections).map(([sectionName, components]) => 
        renderSection(sectionName, components)
      )}
    </div>
  );
};

// Функция для конвертации данных Mod3 в PageLayout
export const convertMod3ToPageLayout = (mod3Data: MapResponse): PageLayout => {
  const { layout, matches } = mod3Data;
  
  // Создаем маппинг компонентов с информацией о сопоставлении
  const componentMap = new Map<string, { confidence: number; matchType: string }>();
  matches.forEach(match => {
    componentMap.set(match.component, {
      confidence: match.confidence,
      matchType: match.match_type
    });
  });

  // Конвертируем секции
  const convertedSections: { [key: string]: VisualComponent[] } = {};
  
  Object.entries(layout.sections || {}).forEach(([sectionName, components]) => {
    convertedSections[sectionName] = components.map((comp: any, index: number) => {
      const componentInfo = componentMap.get(comp.component);
      
      return {
        id: `${sectionName}-${index}`,
        type: comp.component,
        props: comp.props || {},
        confidence: componentInfo?.confidence || 1.0,
        matchType: componentInfo?.matchType || 'default'
      };
    });
  });

  return {
    template: layout.template,
    sections: convertedSections,
    metadata: {
      title: 'Сгенерированная страница',
      description: 'Страница, созданная на основе анализа речи'
    }
  };
};

export default VisualComponents;
