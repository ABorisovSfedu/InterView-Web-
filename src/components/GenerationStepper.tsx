import React from 'react';
import { CheckIcon, ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface Step {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress?: number;
  details?: any;
}

interface GenerationStepperProps {
  steps: Step[];
  isVisible: boolean;
  onRetryStage?: (stageId: string) => void;
  generationComplete?: boolean;
}

export const GenerationStepper: React.FC<GenerationStepperProps> = ({ 
  steps, 
  isVisible,
  onRetryStage,
  generationComplete = false
}) => {
  if (!isVisible) return null;

  const getStepIcon = (step: Step) => {
    switch (step.status) {
      case 'completed':
        return <CheckIcon className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      case 'in-progress':
        return <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepClasses = (step: Step) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'failed':
        return 'border-red-500 bg-red-500/10';
      case 'in-progress':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-600 bg-gray-800';
    }
  };

  const getProgressBar = (step: Step) => {
    if (step.status === 'in-progress' && step.progress !== undefined) {
      return (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${step.progress}%` }}
            />
          </div>
          <div className="text-xs text-blue-400 mt-1">
            {step.progress.toFixed(0)}%
          </div>
        </div>
      );
    }
    return null;
  };

  const renderStageResult = (step: Step) => {
    if (step.status !== 'completed' || !step.details) return null;

    switch (step.id) {
      case 'mod1-transcribe':
        return renderMod1Result(step.details);
      case 'mod2-entities':
        return renderMod2Result(step.details);
      case 'mod3-mapping':
        return renderMod3Result(step.details);
      case 'save-layout':
        return renderLayoutResult(step.details);
      default:
        return null;
    }
  };

  const renderMod1Result = (result: any) => (
    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
      <div className="text-xs text-green-400 space-y-1">
        <div className="font-medium">📝 Результат транскрипции:</div>
        <div className="font-mono bg-gray-900 p-2 rounded text-sm">
          "{result.text}"
        </div>
        <div className="flex justify-between">
          <span>Уверенность: {(result.confidence * 100).toFixed(1)}%</span>
          <span>Язык: {result.language}</span>
        </div>
        <div className="text-xs opacity-75">
          Chunk ID: {result.chunk_id}
        </div>
      </div>
    </div>
  );

  const renderMod2Result = (result: any) => (
    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
      <div className="text-xs text-green-400 space-y-2">
        <div className="font-medium">🏷️ Извлеченные сущности:</div>
        <div className="flex flex-wrap gap-1">
          {result.entities.map((entity: string, index: number) => (
            <span key={index} className="bg-green-600/20 px-2 py-1 rounded text-xs">
              {entity}
            </span>
          ))}
        </div>
        <div className="font-medium">🔑 Ключевые фразы:</div>
        <div className="flex flex-wrap gap-1">
          {result.keyphrases.map((phrase: string, index: number) => (
            <span key={index} className="bg-blue-600/20 px-2 py-1 rounded text-xs">
              {phrase}
            </span>
          ))}
        </div>
        <div className="text-xs opacity-75">
          Обработано частей: {result.chunks_processed}
        </div>
      </div>
    </div>
  );

  const renderMod3Result = (result: any) => (
    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
      <div className="text-xs text-green-400 space-y-2">
        <div className="font-medium">🎨 Сопоставление компонентов:</div>
        <div className="space-y-1">
          {result.matches?.length > 0 ? result.matches.map((match: any, index: number) => (
            <div key={index} className="flex justify-between items-center bg-gray-900 p-2 rounded">
              <span className="text-yellow-400">"{match.term}"</span>
              <span className="text-cyan-400">→</span>
              <span className="text-blue-400">{match.component}</span>
              <span className="text-xs opacity-75 ml-2">
                {(match.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )) : (
            <div className="text-gray-500 text-xs italic">
              Маппинг компонентов недоступен
            </div>
          )}
        </div>
        <div className="text-xs opacity-75">
          Шаблон: {result.layout.template} | Всего компонентов: {result.layout.count}
        </div>
      </div>
    </div>
  );

  const renderLayoutResult = (result: any) => (
    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
      <div className="text-xs text-green-400 space-y-2">
        <div className="font-medium">💾 Сохраненный layout:</div>
        <div className="bg-gray-900 p-2 rounded">
          <div className="grid grid-cols-12 gap-1 text-white/80">
            {result.layoutData.blocks.map((block: any, index: number) => (
              <div 
                key={index} 
                className="col-span-12 bg-purple-600/20 p-1 rounded text-center text-xs border border-purple-500/30"
              >
                {block.component}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs opacity-75">
          Сессия: {result.layoutData.metadata.sessionId}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">
        🔄 Обработка вашего запроса
      </h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Линия соединения */}
            {index < steps.length - 1 && (
              <div className={`absolute left-6 top-12 h-8 w-0.5 ${
                step.status === 'completed' ? 'bg-green-500' : 
                step.status === 'failed' ? 'bg-red-500' : 'bg-gray-600'
              }`} />
            )}
            
            {/* Шаг */}
            <div className={`flex items-start border rounded-lg p-4 ${getStepClasses(step)}`}>
              {/* Иконка */}
              <div className="flex-shrink-0 mr-4 mt-0.5">
                {getStepIcon(step)}
              </div>
              
              {/* Содержимое */}
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-300' :
                  step.status === 'failed' ? 'text-red-300' :
                  step.status === 'in-progress' ? 'text-blue-300' : 'text-gray-300'
                }`}>
                  {step.name}
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  {step.description}
                </p>
                
                {/* Прогресс бар */}
                {getProgressBar(step)}
                
                {/* Детали ошибки */}
                {step.status === 'failed' && step.details && (
                  <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-xs text-red-400">
                      Ошибка: {step.details.error || 'Неизвестная ошибка'}
                    </p>
                  </div>
                )}
                
                {/* Отображение результатов стадии */}
                {renderStageResult(step)}
                
                {/* Кнопка повтора для failed стадий */}
                {step.status === 'failed' && onRetryStage && (
                  <div className="mt-2">
                    <button
                      onClick={() => onRetryStage(step.id)}
                      className="flex items-center px-3 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-400 hover:bg-red-600/30 transition-colors"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Повторить
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Общий статус */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-300">
                Общий прогресс:
              </span>
              <div className="text-lg font-semibold text-white mt-1">
                {steps.filter(s => s.status === 'completed').length} из {steps.length} шагов
              </div>
            </div>
            <div className="text-right">
              {steps.some(s => s.status === 'failed') && (
                <span className="text-red-400 text-sm">❌ Ошибка</span>
              )}
              {steps.every(s => s.status === 'completed') && (
                <span className="text-green-400 text-sm">✅ Завершено</span>
              )}
              {steps.some(s => s.status === 'in-progress') && (
                <span className="text-blue-400 text-sm">🔄 В процессе</span>
              )}
            </div>
          </div>
          
          {/* Кнопка "Открыть в редакторе" */}
          {generationComplete && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const currentUrl = window.location.href;
                    const sessionId = currentUrl.split('/').pop();
                    window.location.href = `/session/${sessionId}`;
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                🎨 Открыть в редакторе
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationStepper;
