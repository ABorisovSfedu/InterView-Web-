// Страница просмотра сессии /session/[sessionId]
// Read-only рендеринг PageModel из page-engine

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageRenderer } from '../page-engine/PageRenderer';
import { usePageStore } from '../stores/usePageStore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Share, 
  Eye,
  Code,
  Brain,
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { Label } from './ui/label';
import apiClient from '../api/client';

const SessionViewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const {
    pageModel,
    isLoading,
    error,
    loadFromMod3,
    setLoading,
    setError,
    exportToMod3
  } = usePageStore();

  const [sessionData, setSessionData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Загрузка данных сессии
  useEffect(() => {
    if (!sessionId) return;

    const loadSessionData = async () => {
      setLoading(true);
      try {
        // Загружаем данные сессии
        const [sessionResponse, layoutResponse] = await Promise.all([
          apiClient.get(`/sessions/${sessionId}`),
          apiClient.get(`/web/v1/session/${sessionId}/layout`)
        ]);

        setSessionData(sessionResponse);
        
        if (layoutResponse.layout) {
          loadFromMod3(layoutResponse);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId, loadFromMod3, setLoading, setError]);

  const handleEdit = () => {
    navigate(`/builder/${sessionId}`);
  };

  const handleExport = () => {
    const mod3Data = exportToMod3();
    if (mod3Data) {
      const dataStr = JSON.stringify(mod3Data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session-${sessionId}-layout.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: sessionData?.name || 'Сессия',
          text: 'Посмотрите на эту сессию',
          url: window.location.href
        });
      } else {
        // Fallback - копируем URL в буфер обмена
        await navigator.clipboard.writeText(window.location.href);
        alert('Ссылка скопирована в буфер обмена');
      }
    } catch (err) {
      console.error('Ошибка при попытке поделиться:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка сессии...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Ошибка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/app')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pageModel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Страница не найдена</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Для этой сессии не найден layout или страница пуста.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Создать страницу
              </Button>
              <Button variant="outline" onClick={() => navigate('/app')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад к проектам
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {sessionData?.name || 'Сессия'}
                </h1>
                <p className="text-sm text-gray-500">
                  {pageModel.metadata.title}
                </p>
                {pageModel.metadata.title === 'Страница от Mod3' && (
                  <Badge variant="outline" className="mt-1">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <Button
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Основная область просмотра */}
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Предварительный просмотр</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      Только просмотр
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Предварительный просмотр</TabsTrigger>
                    <TabsTrigger value="code">Код</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <div className="border rounded-lg p-6 bg-white">
                      <PageRenderer
                        pageModel={pageModel}
                        options={{
                          showDebugOverlay: false,
                          enableDragDrop: false
                        }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="mt-4">
                    <ScrollArea className="h-96">
                      <pre className="text-sm bg-gray-100 p-4 rounded-lg overflow-auto">
                        {JSON.stringify(pageModel, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель с информацией */}
          <div className="col-span-3">
            <div className="space-y-6">
              {/* Информация о сессии */}
              <Card>
                <CardHeader>
                  <CardTitle>Информация о сессии</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessionData && (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {sessionData.user?.name || 'Неизвестный пользователь'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(sessionData.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(sessionData.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Информация о странице */}
              <Card>
                <CardHeader>
                  <CardTitle>Информация о странице</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Шаблон</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{pageModel.template}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Описание</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {pageModel.metadata.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Статистика</Label>
                    <div className="mt-2 space-y-2">
                      {pageModel.sections && Object.entries(pageModel.sections).map(([sectionName, blocks]) => (
                        <div key={sectionName} className="flex justify-between text-sm">
                          <span className="capitalize">{sectionName}:</span>
                          <span className="text-gray-600">{blocks.length} блоков</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Быстрые действия */}
              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="w-full justify-start"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать страницу
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Экспортировать layout
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="w-full justify-start"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Поделиться сессией
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionViewPage;
