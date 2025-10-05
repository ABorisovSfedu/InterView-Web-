// Debug Overlay для движка страницы
// Показывает отладочную информацию в режиме разработки

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { 
  Bug, 
  Eye, 
  EyeOff, 
  Info, 
  Clock, 
  Layers, 
  Settings,
  Code,
  Database,
  Zap
} from 'lucide-react';
import { DebugInfo, Block, PageModel } from './types';

interface DebugOverlayProps {
  pageModel: PageModel;
  debugInfo: DebugInfo[];
  renderTime: number;
  isVisible: boolean;
  onToggle: () => void;
  onBlockSelect?: (blockId: string) => void;
  selectedBlockId?: string;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  pageModel,
  debugInfo,
  renderTime,
  isVisible,
  onToggle,
  onBlockSelect,
  selectedBlockId
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  const totalBlocks = Object.values(pageModel.sections).flat().length;
  const totalSections = Object.keys(pageModel.sections).length;
  const errorCount = debugInfo.reduce((acc, info) => acc + info.errors.length, 0);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh]">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Debug Overlay</CardTitle>
            </div>
            <Button
              onClick={onToggle}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Отладочная информация для разработки
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">
                <Info className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="blocks" className="text-xs">
                <Layers className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">
                <Clock className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                <Database className="w-3 h-3" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{totalBlocks}</div>
                    <div className="text-xs text-blue-600">Блоков</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{totalSections}</div>
                    <div className="text-xs text-green-600">Секций</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{renderTime}ms</div>
                    <div className="text-xs text-purple-600">Рендер</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{errorCount}</div>
                    <div className="text-xs text-red-600">Ошибок</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Шаблон:</span>
                    <Badge variant="outline">{pageModel.template}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Заголовок:</span>
                    <span className="text-xs text-gray-600 truncate max-w-32">
                      {pageModel.metadata.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Версия:</span>
                    <Badge variant="outline">
                      {pageModel.metadata.version || '1.0.0'}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="blocks" className="mt-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {Object.entries(pageModel.sections).map(([sectionName, blocks]) => (
                    <div key={sectionName}>
                      <div className="font-medium text-sm text-gray-700 mb-1 capitalize">
                        {sectionName} ({blocks.length})
                      </div>
                      {blocks.map((block) => (
                        <div
                          key={block.id}
                          className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                            selectedBlockId === block.id
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => onBlockSelect?.(block.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{block.component}</span>
                            <Badge variant="outline" className="text-xs">
                              {block.metadata?.matchType || 'manual'}
                            </Badge>
                          </div>
                          {block.metadata?.confidence && (
                            <div className="text-xs text-gray-500 mt-1">
                              Уверенность: {(block.metadata.confidence * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span>Время рендеринга</span>
                    <Badge variant="outline">{renderTime}ms</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((renderTime / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {debugInfo.map((info) => (
                    <div key={info.blockId} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{info.component}</span>
                        <span className="text-gray-500">{info.renderTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-4">
              <ScrollArea className="h-64">
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(pageModel, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Хук для управления состоянием debug overlay
export const useDebugOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>();

  const toggle = () => setIsVisible(!isVisible);
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return {
    isVisible,
    selectedBlockId,
    toggle,
    show,
    hide,
    selectBlock: setSelectedBlockId
  };
};





