import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Loader2, CheckCircle, AlertCircle, FileText, RotateCcw } from 'lucide-react';
import { mod2Client } from '../api/mod2';
import { useToast } from '../utils/toast';
import { useTheme } from '../contexts/ThemeContext';

interface QuickMod2TestProps {
  sessionId: string;
}

export const QuickMod2Test: React.FC<QuickMod2TestProps> = ({ sessionId }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);
  const toast = useToast();
  const { isDark } = useTheme();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.showWarning('Введите текст для тестирования Mod2');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSteps([]);
    setShowForm(false);

    try {
      // Шаг 1: Отправка текста в Mod2
      setSteps([{ id: 1, name: 'Отправка текста в Mod2', status: 'in-progress', message: 'Обработка текста...' }]);
      
      const chunkResult = await mod2Client.ingestChunk({
        session_id: sessionId,
        chunk_id: `quick-test-${Date.now()}`,
        seq: 1,
        lang: 'ru-RU',
        text: text.trim()
      });

      setSteps(prev => [...prev, { id: 1, name: 'Отправка текста в Mod2', status: 'completed', message: 'Текст успешно отправлен' }]);

      // Шаг 2: Получение entities
      setSteps(prev => [...prev, { id: 2, name: 'Извлечение сущностей', status: 'in-progress', message: 'Получение entities...' }]);
      
      const entitiesResult = await mod2Client.getEntities(sessionId);

      setSteps(prev => [...prev, { id: 2, name: 'Извлечение сущностей', status: 'completed', message: `Извлечено ${entitiesResult.entities.length} сущностей` }]);

      setResult({
        chunk: chunkResult,
        entities: entitiesResult
      });

      toast.showSuccess(`Mod2 обработал текст! Извлечено ${entitiesResult.entities.length} сущностей`);
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при отправке в Mod2';
      setError(errorMessage);
      setSteps(prev => [...prev, { id: 'error', name: 'Ошибка', status: 'failed', message: errorMessage }]);
      toast.showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setError(null);
    setSteps([]);
    setShowForm(true);
  };

  return (
    <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Текстовый анализ
        </CardTitle>
        <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Отправляйте текст для NLP обработки в Mod2
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <div className="text-center space-y-6">
            {/* Большой круглый элемент как в голосовых записях */}
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
              isLoading
                ? isDark
                  ? 'bg-blue-500/20 border-2 border-blue-500 animate-pulse'
                  : 'bg-blue-100 border-2 border-blue-300 animate-pulse'
                : isDark
                ? 'bg-white/10 border-2 border-white/20'
                : 'bg-gray-100 border-2 border-gray-300'
            }`}>
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <FileText className="w-8 h-8 text-purple-500" />
              )}
            </div>
            
            <div className="space-y-4">
              {/* Textarea */}
              <div className="max-w-md mx-auto">
                <Textarea
                  placeholder="Введите текст для тестирования Mod2 (например: 'сделай заголовок и кнопку отправки формы')"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={`${isDark ? 'bg-white/5 border-white/20 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} min-h-[100px] resize-none`}
                  disabled={isLoading}
                />
              </div>
              
              {/* Инструкция */}
              <div className={`text-sm p-3 rounded ${
                isDark ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300' : 
                'bg-purple-50 border border-purple-200 text-purple-600'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Инструкция по использованию:</span>
                </div>
                <ul className="text-xs space-y-1 ml-6">
                  <li>• Опишите желаемый интерфейс текстом</li>
                  <li>• Используйте русский язык</li>
                  <li>• Будьте конкретными в описании</li>
                  <li>• Mod2 извлечет сущности и ключевые фразы</li>
                </ul>
              </div>
              
              {/* Кнопка отправки */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !text.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Отправить в Mod2
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Пошаговый вывод */}
            {steps.length > 0 && (
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Процесс обработки
                </h3>
                {steps.map((step) => (
                  <div key={step.id} className={`p-4 rounded-lg border ${
                    step.status === 'completed' 
                      ? isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                      : step.status === 'in-progress'
                      ? isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                      : step.status === 'failed'
                      ? isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                      : isDark ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'in-progress' ? 'bg-blue-500 text-white' :
                        step.status === 'failed' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.status === 'in-progress' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : step.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{step.id}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {step.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {step.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Результаты */}
            {result && (
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Результаты анализа
                </h3>
                
                <div className={`p-4 rounded-lg border ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="space-y-3">
                    <div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Извлеченные сущности:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.entities.entities.map((entity: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Ключевые фразы:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.entities.keyphrases.map((phrase: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Обработано чанков: {result.entities.chunks_processed}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ошибка */}
            {error && (
              <div className={`flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/30`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Кнопка сброса */}
            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className={`${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Новый анализ
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickMod2Test;
