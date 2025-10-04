import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Code, 
  Eye, 
  Upload, 
  Download,
  FileText,
  Grid,
  AlertTriangle,
  CheckCircle,
  Copy,
  Trash2
} from 'lucide-react';
import { PageModel, Block } from '../../page-engine/types';
import { PageRenderer } from '../../page-engine/PageRenderer';
import { ThemeProvider } from '../../contexts/ThemeContext';

const LayoutViewer: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [pageModel, setPageModel] = useState<PageModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'grid'>('preview');

  // Пример JSON для демонстрации
  const exampleJson = JSON.stringify({
    id: "example-page",
    blocks: [
      {
        id: "hero-block",
        component: "HeroSection",
        props: {
          title: "Добро пожаловать",
          subtitle: "Это пример hero-секции",
          buttonText: "Начать"
        },
        layout: {
          colStart: 1,
          colSpan: 12,
          row: 1
        },
        metadata: {
          matchType: "manual"
        }
      },
      {
        id: "feature-block-1",
        component: "FeatureCard",
        props: {
          title: "Функция 1",
          description: "Описание первой функции",
          icon: "star"
        },
        layout: {
          colStart: 1,
          colSpan: 4,
          row: 2
        },
        metadata: {
          matchType: "manual"
        }
      },
      {
        id: "feature-block-2",
        component: "FeatureCard",
        props: {
          title: "Функция 2",
          description: "Описание второй функции",
          icon: "heart"
        },
        layout: {
          colStart: 5,
          colSpan: 4,
          row: 2
        },
        metadata: {
          matchType: "manual"
        }
      },
      {
        id: "feature-block-3",
        component: "FeatureCard",
        props: {
          title: "Функция 3",
          description: "Описание третьей функции",
          icon: "zap"
        },
        layout: {
          colStart: 9,
          colSpan: 4,
          row: 2
        },
        metadata: {
          matchType: "manual"
        }
      }
    ],
    metadata: {
      title: "Пример страницы",
      description: "Демонстрация layout viewer",
      version: "2.0"
    },
    settings: {
      responsive: true
    }
  }, null, 2);

  const parseJson = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      setPageModel(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка парсинга JSON');
    }
  };

  const loadExample = () => {
    setJsonInput(exampleJson);
    setPageModel(JSON.parse(exampleJson));
    setError(null);
  };

  const clearAll = () => {
    setJsonInput('');
    setPageModel(null);
    setError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadJson = () => {
    if (!pageModel) return;
    
    const blob = new Blob([JSON.stringify(pageModel, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-${pageModel.id || 'unnamed'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-950">
        {/* Шапка */}
        <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-cyan-400" />
                Layout Viewer
              </h1>
              <p className="text-gray-400 mt-1">
                Просмотр и отладка JSON макетов страниц
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadExample}
                className="border-gray-600 text-gray-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Загрузить пример
              </Button>
              
              {pageModel && (
                <Button
                  variant="outline"
                  onClick={downloadJson}
                  className="border-gray-600 text-gray-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать JSON
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={clearAll}
                className="border-red-600 text-red-400 hover:bg-red-600/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Очистить
              </Button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Левая панель - ввод JSON */}
          <div className="w-1/2 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                JSON Layout
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Вставьте JSON макета страницы для предварительного просмотра
              </p>
            </div>
            
            <div className="flex-1 p-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Вставьте JSON макета здесь..."
                className="h-full resize-none bg-gray-900 border-gray-700 text-gray-100 font-mono text-sm"
              />
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {error ? (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Ошибка JSON
                    </Badge>
                  ) : pageModel ? (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      JSON валиден
                    </Badge>
                  ) : null}
                  
                  {pageModel && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {pageModel.blocks.length} блоков
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(jsonInput)}
                    disabled={!jsonInput}
                    className="border-gray-600 text-gray-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать
                  </Button>
                  
                  <Button
                    onClick={parseJson}
                    disabled={!jsonInput}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Применить
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Правая панель - предварительный просмотр */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  Предварительный просмотр
                </h2>
                
                {pageModel && (
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                    <TabsList className="bg-gray-800">
                      <TabsTrigger value="preview" className="data-[state=active]:bg-cyan-600">
                        <Eye className="w-4 h-4 mr-2" />
                        Превью
                      </TabsTrigger>
                      <TabsTrigger value="grid" className="data-[state=active]:bg-cyan-600">
                        <Grid className="w-4 h-4 mr-2" />
                        Сетка
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {!pageModel ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Нет данных для отображения</p>
                    <p className="text-sm">
                      Введите JSON макета в левой панели и нажмите "Применить"
                    </p>
                  </div>
                </div>
              ) : viewMode === 'preview' ? (
                <div className="p-6 bg-white min-h-full">
                  <PageRenderer pageModel={pageModel} />
                </div>
              ) : (
                <GridView pageModel={pageModel} />
              )}
            </div>
            
            {pageModel && (
              <div className="p-4 border-t border-gray-700 bg-gray-900">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Заголовок:</span>
                    <p className="text-white font-medium">{pageModel.metadata.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Блоков:</span>
                    <p className="text-white font-medium">{pageModel.blocks.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Версия:</span>
                    <p className="text-white font-medium">{pageModel.metadata.version || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Компонент для отображения сетки
const GridView: React.FC<{ pageModel: PageModel }> = ({ pageModel }) => {
  return (
    <div className="p-6 bg-gray-800">
      <div className="mb-4">
        <h3 className="text-white font-medium mb-2">Структура сетки (12 колонок)</h3>
        <div className="grid grid-cols-12 gap-1 h-8 mb-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="bg-gray-600 rounded text-center text-xs text-white flex items-center justify-center">
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {pageModel.blocks
          .sort((a, b) => a.layout.row - b.layout.row)
          .map((block, index) => (
            <BlockInfo key={block.id} block={block} index={index} />
          ))}
      </div>
    </div>
  );
};

// Информация о блоке
const BlockInfo: React.FC<{ block: Block; index: number }> = ({ block, index }) => {
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">
            {block.component}
          </CardTitle>
          <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
            #{index + 1}
          </Badge>
        </div>
        <CardDescription className="text-gray-400 text-xs">
          ID: {block.id}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Позиция в сетке */}
          <div>
            <h4 className="text-gray-300 text-xs font-medium mb-2">Позиция в сетке:</h4>
            <div className="grid grid-cols-12 gap-1 h-6">
              {Array.from({ length: 12 }, (_, i) => {
                const colNum = i + 1;
                const isInRange = colNum >= block.layout.colStart && 
                                colNum < block.layout.colStart + block.layout.colSpan;
                return (
                  <div 
                    key={i} 
                    className={`rounded text-xs flex items-center justify-center ${
                      isInRange 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-gray-600 text-gray-400'
                    }`}
                  >
                    {colNum}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Колонки {block.layout.colStart}-{block.layout.colStart + block.layout.colSpan - 1} 
              (ширина: {block.layout.colSpan}), строка: {block.layout.row}
            </div>
          </div>
          
          {/* Пропсы */}
          {Object.keys(block.props || {}).length > 0 && (
            <div>
              <h4 className="text-gray-300 text-xs font-medium mb-2">Пропсы:</h4>
              <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-auto max-h-24">
                {JSON.stringify(block.props, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Метаданные */}
          {block.metadata && (
            <div className="flex gap-2">
              {block.metadata.matchType && (
                <Badge variant="secondary" className="text-xs">
                  {block.metadata.matchType}
                </Badge>
              )}
              {block.metadata.usingDefaults && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                  defaults
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutViewer;

