// Реестр компонентов для движка страницы
// Маппинг имен компонентов на React-компоненты

import React from 'react';
import { ComponentRegistry } from './types';

// Импорты UI компонентов
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../components/ui/context-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '../components/ui/menubar';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '../components/ui/navigation-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import { ScrollArea } from '../components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { Toggle, ToggleGroup, ToggleGroupItem } from '../components/ui/toggle';

// Базовые HTML элементы
const Heading = ({ level = 1, children, ...props }: { level?: number; children: React.ReactNode; [key: string]: any }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return React.createElement(Tag, props, children);
};

const Paragraph = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return React.createElement('p', props, children);
};

const Image = ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => {
  return React.createElement('img', { src, alt, ...props });
};

const Link = ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: any }) => {
  return React.createElement('a', { href, ...props }, children);
};

const List = ({ items, ordered = false, ...props }: { items: string[]; ordered?: boolean; [key: string]: any }) => {
  const Tag = ordered ? 'ol' : 'ul';
  return React.createElement(
    Tag,
    props,
    items.map((item, index) => React.createElement('li', { key: index }, item))
  );
};

// Специальные компоненты для страниц
const Hero = ({ title, subtitle, backgroundImage, ...props }: { 
  title: string; 
  subtitle?: string; 
  backgroundImage?: string; 
  [key: string]: any 
}) => {
  return React.createElement(
    'div',
    {
      className: "relative min-h-[400px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white",
      style: backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {},
      ...props
    },
    React.createElement(
      'div',
      { className: "text-center" },
      React.createElement('h1', { className: "text-4xl md:text-6xl font-bold mb-4" }, title),
      subtitle && React.createElement('p', { className: "text-xl md:text-2xl" }, subtitle)
    )
  );
};

const Navbar = ({ brand, links, ...props }: { 
  brand: string; 
  links: Array<{ text: string; href: string }>; 
  [key: string]: any 
}) => {
  return React.createElement(
    'nav',
    { className: "bg-white shadow-lg", ...props },
    React.createElement(
      'div',
      { className: "max-w-7xl mx-auto px-4" },
      React.createElement(
        'div',
        { className: "flex justify-between items-center py-4" },
        React.createElement('div', { className: "text-xl font-bold" }, brand),
        React.createElement(
          'div',
          { className: "space-x-4" },
          links.map((link, index) =>
            React.createElement(
              'a',
              { key: index, href: link.href, className: "text-gray-600 hover:text-gray-900" },
              link.text
            )
          )
        )
      )
    )
  );
};

const Footer = ({ copyright, links, ...props }: { 
  copyright: string; 
  links?: Array<{ text: string; href: string }>; 
  [key: string]: any 
}) => {
  return React.createElement(
    'footer',
    { className: "bg-gray-800 text-white py-8", ...props },
    React.createElement(
      'div',
      { className: "max-w-7xl mx-auto px-4" },
      React.createElement(
        'div',
        { className: "flex justify-between items-center" },
        React.createElement('div', null, copyright),
        links && React.createElement(
          'div',
          { className: "space-x-4" },
          links.map((link, index) =>
            React.createElement(
              'a',
              { key: index, href: link.href, className: "text-gray-300 hover:text-white" },
              link.text
            )
          )
        )
      )
    )
  );
};

const Form = ({ fields, onSubmit, ...props }: { 
  fields: Array<{ name: string; type: string; label: string; required?: boolean }>; 
  onSubmit?: (data: any) => void; 
  [key: string]: any 
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit?.(data);
  };

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, className: "space-y-4", ...props },
    fields.map((field, index) =>
      React.createElement(
        'div',
        { key: index },
        React.createElement(Label, { htmlFor: field.name }, field.label),
        field.type === 'textarea' 
          ? React.createElement(Textarea, { id: field.name, name: field.name, required: field.required })
          : React.createElement(Input, { id: field.name, name: field.name, type: field.type, required: field.required })
      )
    ),
    React.createElement(Button, { type: "submit" }, "Отправить")
  );
};

const Gallery = ({ images, ...props }: { 
  images: Array<{ src: string; alt: string; caption?: string }>; 
  [key: string]: any 
}) => {
  return React.createElement(
    'div',
    { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", ...props },
    images.map((image, index) =>
      React.createElement(
        'div',
        { key: index, className: "relative" },
        React.createElement('img', { src: image.src, alt: image.alt, className: "w-full h-48 object-cover rounded-lg" }),
        image.caption && React.createElement('p', { className: "mt-2 text-sm text-gray-600" }, image.caption)
      )
    )
  );
};

const Testimonial = ({ quote, author, avatar, ...props }: { 
  quote: string; 
  author: string; 
  avatar?: string; 
  [key: string]: any 
}) => {
  return React.createElement(
    Card,
    props,
    React.createElement(
      CardContent,
      { className: "p-6" },
      React.createElement('blockquote', { className: "text-lg italic mb-4" }, `"${quote}"`),
      React.createElement(
        'div',
        { className: "flex items-center" },
        avatar && React.createElement(
          Avatar,
          { className: "mr-3" },
          React.createElement(AvatarImage, { src: avatar }),
          React.createElement(AvatarFallback, null, author[0])
        ),
        React.createElement(
          'div',
          null,
          React.createElement('p', { className: "font-semibold" }, author)
        )
      )
    )
  );
};

const Pricing = ({ plans, ...props }: { 
  plans: Array<{ name: string; price: string; features: string[]; popular?: boolean }>; 
  [key: string]: any 
}) => {
  return React.createElement(
    'div',
    { className: "grid grid-cols-1 md:grid-cols-3 gap-6", ...props },
    plans.map((plan, index) =>
      React.createElement(
        Card,
        { key: index, className: plan.popular ? 'border-blue-500' : '' },
        React.createElement(
          CardHeader,
          null,
          React.createElement(CardTitle, null, plan.name),
          React.createElement('div', { className: "text-3xl font-bold" }, plan.price)
        ),
        React.createElement(
          CardContent,
          null,
          React.createElement(
            'ul',
            { className: "space-y-2" },
            plan.features.map((feature, featureIndex) =>
              React.createElement(
                'li',
                { key: featureIndex, className: "flex items-center" },
                React.createElement('span', { className: "w-2 h-2 bg-green-500 rounded-full mr-2" }),
                feature
              )
            )
          ),
          React.createElement(
            Button,
            { className: "w-full mt-4", variant: plan.popular ? 'default' : 'outline' },
            "Выбрать план"
          )
        )
      )
    )
  );
};

// Основной реестр компонентов
export const componentRegistry: ComponentRegistry = {
  // Базовые HTML элементы
  'ui.heading': Heading,
  'ui.paragraph': Paragraph,
  'ui.image': Image,
  'ui.link': Link,
  'ui.list': List,
  
  // UI компоненты
  'ui.button': Button,
  'ui.card': Card,
  'ui.input': Input,
  'ui.textarea': Textarea,
  'ui.badge': Badge,
  'ui.tabs': Tabs,
  'ui.select': Select,
  'ui.label': Label,
  'ui.separator': Separator,
  'ui.progress': Progress,
  'ui.alert': Alert,
  'ui.avatar': Avatar,
  'ui.checkbox': Checkbox,
  'ui.radio': RadioGroup,
  'ui.switch': Switch,
  'ui.slider': Slider,
  'ui.calendar': Calendar,
  'ui.dialog': Dialog,
  'ui.dropdown': DropdownMenu,
  'ui.popover': Popover,
  'ui.tooltip': Tooltip,
  'ui.accordion': Accordion,
  'ui.breadcrumb': Breadcrumb,
  'ui.command': Command,
  'ui.context-menu': ContextMenu,
  'ui.hover-card': HoverCard,
  'ui.menubar': Menubar,
  'ui.navigation': NavigationMenu,
  'ui.pagination': Pagination,
  'ui.resizable': ResizablePanel,
  'ui.scroll-area': ScrollArea,
  'ui.sheet': Sheet,
  'ui.skeleton': Skeleton,
  'ui.table': Table,
  'ui.toast': toast,
  'ui.toggle': Toggle,
  
  // Специальные компоненты страниц
  'ui.hero': Hero,
  'ui.navbar': Navbar,
  'ui.footer': Footer,
  'ui.form': Form,
  'ui.gallery': Gallery,
  'ui.testimonial': Testimonial,
  'ui.pricing': Pricing,
  
  // Алиасы для совместимости с Mod3
  'Hero': Hero,
  'ContactForm': Form,
  'Navigation': Navbar,
  'Footer': Footer,
  'Gallery': Gallery,
  'Testimonial': Testimonial,
  'Pricing': Pricing,
  'Button': Button,
  'Card': Card,
  'Input': Input,
  'Textarea': Textarea,
  'Badge': Badge,
  'Heading': Heading,
  'Paragraph': Paragraph,
  'Image': Image,
  'Link': Link,
  'List': List,
};

// Функция для получения компонента по имени
export const getComponent = (componentName: string): React.ComponentType<any> | null => {
  return componentRegistry[componentName] || null;
};

// Функция для проверки существования компонента
export const hasComponent = (componentName: string): boolean => {
  return componentName in componentRegistry;
};

// Функция для получения списка всех доступных компонентов
export const getAvailableComponents = (): string[] => {
  return Object.keys(componentRegistry);
};

// Функция для добавления нового компонента в реестр
export const registerComponent = (name: string, component: React.ComponentType<any>): void => {
  componentRegistry[name] = component;
};

// Функция для удаления компонента из реестра
export const unregisterComponent = (name: string): void => {
  delete componentRegistry[name];
};
