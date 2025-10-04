import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, 
  Filter, 
  Code, 
  Eye, 
  Copy,
  ExternalLink,
  Loader2,
  Package,
  Tag
} from 'lucide-react';
import { ComponentCatalogItem, ComponentCatalog } from '../../page-engine/types';
import { getComponent } from '../../page-engine/registry';
import { ThemeProvider } from '../../contexts/ThemeContext';

const ComponentShowcase: React.FC = () => {
  const [catalog, setCatalog] = useState<ComponentCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComponent, setSelectedComponent] = useState<ComponentCatalogItem | null>(null);

  // Загрузка каталога
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch('/web/v1/components');
        if (!response.ok) throw new Error('Ошибка загрузки каталога');
        
        const data = await response.json();
        setCatalog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  // Фильтрация компонентов
  const filteredComponents = catalog?.components.filter(component => {
    const matchesSearch = component.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="ml-3 text-gray-300">Загрузка каталога компонентов...</span>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Ошибка загрузки каталога</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-950">
        {/* Шапка */}
        <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-cyan-400" />
                Витрина компонентов
              </h1>
              <p className="text-gray-400 mt-1">
                Каталог всех доступных компонентов для конструктора страниц
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                {filteredComponents.length} компонентов
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                {catalog?.categories.length} категорий
              </Badge>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Боковая панель с фильтрами */}
          <aside className="w-80 bg-gray-900 border-r border-gray-700 p-6">
            <div className="space-y-6">
              {/* Поиск */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Поиск компонентов
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Название, описание, теги..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Категории */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Категория
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">
                      Все категории
                    </SelectItem>
                    {catalog?.categories.map(category => (
                      <SelectItem key={category} value={category} className="text-white">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Статистика */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Статистика</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Всего компонентов:</span>
                    <span className="text-white">{catalog?.components.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Найдено:</span>
                    <span className="text-cyan-400">{filteredComponents.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Основной контент */}
          <main className="flex-1">
            {selectedComponent ? (
              <ComponentDetail 
                component={selectedComponent} 
                onBack={() => setSelectedComponent(null)}
                onCopy={copyToClipboard}
              />
            ) : (
              <ComponentGrid 
                components={filteredComponents}
                onSelect={setSelectedComponent}
              />
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Сетка компонентов
const ComponentGrid: React.FC<{
  components: ComponentCatalogItem[];
  onSelect: (component: ComponentCatalogItem) => void;
}> = ({ components, onSelect }) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {components.map(component => (
          <ComponentCard 
            key={component.id} 
            component={component} 
            onClick={() => onSelect(component)}
          />
        ))}
      </div>
      
      {components.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Компоненты не найдены
          </h3>
          <p className="text-gray-500">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      )}
    </div>
  );
};

// Карточка компонента
const ComponentCard: React.FC<{
  component: ComponentCatalogItem;
  onClick: () => void;
}> = ({ component, onClick }) => {
  return (
    <Card 
      className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-all hover:scale-105"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-lg truncate">
              {component.displayName}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              {component.description}
            </CardDescription>
          </div>
          {component.preview_image && (
            <img 
              src={component.preview_image} 
              alt={component.displayName}
              className="w-12 h-12 rounded bg-gray-700 object-cover ml-3"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
            {component.category}
          </Badge>
          <div className="flex gap-1">
            {component.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Детальный просмотр компонента
const ComponentDetail: React.FC<{
  component: ComponentCatalogItem;
  onBack: () => void;
  onCopy: (text: string) => void;
}> = ({ component, onBack, onCopy }) => {
  const Component = getComponent(component.name);
  
  return (
    <div className="p-6">
      {/* Навигация */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="border-gray-600 text-gray-300">
          ← Назад к каталогу
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{component.displayName}</h1>
          <p className="text-gray-400">{component.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Превью */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Превью компонента
          </h2>
          
          <Card className="bg-gray-800 border-gray-700 p-6">
            {Component ? (
              <Component {...component.example_props} />
            ) : (
              <div className="text-center py-8 text-red-400">
                Компонент не зарегистрирован: {component.name}
              </div>
            )}
          </Card>
        </div>

        {/* Информация */}
        <div className="space-y-6">
          <Tabs defaultValue="props" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="props" className="data-[state=active]:bg-cyan-600">
                Пропсы
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-cyan-600">
                Использование
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-cyan-600">
                Информация
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="props" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Example Props
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopy(JSON.stringify(component.example_props, null, 2))}
                      className="border-gray-600 text-gray-300"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Копировать
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded overflow-auto">
                    {JSON.stringify(component.example_props, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Как использовать</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Имя компонента:
                    </h4>
                    <code className="text-cyan-400 bg-gray-900 px-2 py-1 rounded">
                      {component.name}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Пример использования в JSON:
                    </h4>
                    <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded overflow-auto">
{JSON.stringify({
  id: "example-block",
  component: component.name,
  props: component.example_props,
  layout: {
    colStart: 1,
    colSpan: 6,
    row: 1
  }
}, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="info" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Информация о компоненте</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">ID:</span>
                      <p className="text-white font-mono">{component.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Категория:</span>
                      <p className="text-white">{component.category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Теги:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {component.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="border-gray-600 text-gray-300">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {component.documentation && (
                    <div>
                      <span className="text-gray-400">Документация:</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 border-gray-600 text-gray-300"
                        onClick={() => window.open(component.documentation, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Открыть
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;

