// Компонент PageBuilder для построения страниц из данных Mod3
// Интегрируется с VisualLibrary для рендеринга визуальных элементов

import React, { useState, useEffect } from 'react';
import { MapResponse } from '../../api/mod3Client';
import { 
  renderPage, 
  convertMod3ToPageLayout, 
  PageLayout, 
  VisualComponent 
} from './VisualLibrary';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Eye, 
  Code, 
  Settings, 
  Download, 
  Upload, 
  RefreshCw, 
  Maximize2,
  Minimize2,
  Edit,
  Save,
  Trash2,
  Plus,
  Move,
  Copy,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface PageBuilderProps {
  mod3Data?: MapResponse;
  onPageChange?: (pageLayout: PageLayout) => void;
  onSave?: (pageLayout: PageLayout) => void;
  className?: string;
}

interface PreviewMode {
  type: 'desktop' | 'tablet' | 'mobile';
  width: string;
  height: string;
}

const PageBuilder: React.FC<PageBuilderProps> = ({
  mod3Data,
  onPageChange,
  onSave,
  className = ''
}) => {
  const [pageLayout, setPageLayout] = useState<PageLayout | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>({
    type: 'desktop',
    width: '100%',
    height: 'auto'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [editHistory, setEditHistory] = useState<PageLayout[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Инициализация pageLayout из mod3Data
  useEffect(() => {
    if (mod3Data) {
      const layout = convertMod3ToPageLayout(mod3Data);
      setPageLayout(layout);
      addToHistory(layout);
      onPageChange?.(layout);
    }
  }, [mod3Data, onPageChange]);

  // Добавление в историю изменений
  const addToHistory = (layout: PageLayout) => {
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(layout);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Отмена изменений
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPageLayout(editHistory[newIndex]);
      onPageChange?.(editHistory[newIndex]);
    }
  };

  // Повтор изменений
  const redo = () => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPageLayout(editHistory[newIndex]);
      onPageChange?.(editHistory[newIndex]);
    }
  };

  // Сохранение страницы
  const handleSave = () => {
    if (pageLayout) {
      onSave?.(pageLayout);
    }
  };

  // Экспорт страницы
  const handleExport = () => {
    if (pageLayout) {
      const dataStr = JSON.stringify(pageLayout, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `page-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Импорт страницы
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLayout = JSON.parse(e.target?.result as string);
          setPageLayout(importedLayout);
          addToHistory(importedLayout);
          onPageChange?.(importedLayout);
        } catch (error) {
          console.error('Ошибка импорта:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Режимы предварительного просмотра
  const previewModes: PreviewMode[] = [
    { type: 'desktop', width: '100%', height: 'auto' },
    { type: 'tablet', width: '768px', height: 'auto' },
    { type: 'mobile', width: '375px', height: 'auto' }
  ];

  // Генерация HTML кода
  const generateHTML = (layout: PageLayout): string => {
    // Простая генерация HTML (можно расширить)
    let html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${layout.metadata?.title || 'Сгенерированная страница'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
`;

    Object.entries(layout.sections).forEach(([sectionName, components]) => {
      html += `    <section class="section-${sectionName} mb-8">\n`;
      components.forEach(component => {
        html += `        <div class="component-${component.type} mb-4">\n`;
        html += `            <!-- ${component.type} -->\n`;
        html += `        </div>\n`;
      });
      html += `    </section>\n`;
    });

    html += `</body>
</html>`;

    return html;
  };

  // Генерация CSS кода
  const generateCSS = (layout: PageLayout): string => {
    let css = `/* Стили для сгенерированной страницы */
.page-template-${layout.template} {
    min-height: 100vh;
    background-color: #f9fafb;
}

`;

    Object.entries(layout.sections).forEach(([sectionName, components]) => {
      css += `.section-${sectionName} {
    padding: 2rem 0;
}

`;
      components.forEach(component => {
        css += `.component-${component.type} {
    margin-bottom: 1rem;
}

`;
      });
    });

    return css;
  };

  if (!pageLayout) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <CardContent>
          <Layout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Нет данных для построения страницы</h3>
          <p className="text-gray-600">
            Загрузите данные от Mod3 для начала построения страницы
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`page-builder ${className}`}>
      {/* Панель инструментов */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Конструктор страниц</h2>
            <Badge variant="outline">
              {pageLayout.template}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Режимы предварительного просмотра */}
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              {previewModes.map((mode) => (
                <Button
                  key={mode.type}
                  variant={previewMode.type === mode.type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode(mode)}
                  className="p-2"
                >
                  {mode.type === 'desktop' && <Monitor className="w-4 h-4" />}
                  {mode.type === 'tablet' && <Tablet className="w-4 h-4" />}
                  {mode.type === 'mobile' && <Smartphone className="w-4 h-4" />}
                </Button>
              ))}
            </div>

            {/* Полноэкранный режим */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Отменить
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= editHistory.length - 1}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Повторить
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>

          <label className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Импорт
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex h-screen">
        {/* Боковая панель */}
        {!isFullscreen && (
          <div className="w-80 bg-white border-r border-gray-200 p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Превью
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="w-4 h-4 mr-2" />
                  Код
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Секции страницы</h3>
                  {Object.entries(pageLayout.sections).map(([sectionName, components]) => (
                    <Card key={sectionName}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm capitalize">
                          {sectionName}
                        </CardTitle>
                        <CardDescription>
                          {components.length} компонентов
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {components.map((component, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm font-mono">
                                {component.type}
                              </span>
                              {component.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {(component.confidence * 100).toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">HTML</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                      {generateHTML(pageLayout)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">CSS</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                      {generateCSS(pageLayout)}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Название страницы
                    </label>
                    <input
                      type="text"
                      value={pageLayout.metadata?.title || ''}
                      onChange={(e) => {
                        const newLayout = {
                          ...pageLayout,
                          metadata: {
                            ...pageLayout.metadata,
                            title: e.target.value
                          }
                        };
                        setPageLayout(newLayout);
                        addToHistory(newLayout);
                        onPageChange?.(newLayout);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Описание
                    </label>
                    <textarea
                      value={pageLayout.metadata?.description || ''}
                      onChange={(e) => {
                        const newLayout = {
                          ...pageLayout,
                          metadata: {
                            ...pageLayout.metadata,
                            description: e.target.value
                          }
                        };
                        setPageLayout(newLayout);
                        addToHistory(newLayout);
                        onPageChange?.(newLayout);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Область предварительного просмотра */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-auto h-full">
            <div
              className="mx-auto"
              style={{
                width: previewMode.width,
                height: previewMode.height,
                maxWidth: '100%'
              }}
            >
              {renderPage(pageLayout)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;


