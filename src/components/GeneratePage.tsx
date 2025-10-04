import React, { useState } from 'react';
import { ArrowLeftIcon, CogIcon } from '@heroicons/react/24/outline';
import { VoiceRecorder } from './VoiceRecorder';
import { TextInput } from './TextInput';
import { GenerationStepper } from './GenerationStepper';
import { useToast } from '../utils/toast';
import { usePageStore } from '../stores/usePageStoreNew';

interface GeneratePageProps {
  sessionId: string;
}

export const GeneratePage: React.FC<GeneratePageProps> = ({ sessionId }) => {
  const toast = useToast();
  const { 
    isGenerating, 
    generationStages, 
    generationComplete,
    generateFromVoice, 
    generateFromText,
    setSessionId,
    updateStage,
    retryStage,
    resetGeneration
  } = usePageStore();

  const handleBackToEditor = () => {
    window.location.href = `/session/${sessionId}`;
  };

  const handleVoiceSubmit = async (audioBlob: File) => {
    try {
      setSessionId(sessionId);
      await generateFromVoice(audioBlob);
      toast.showSuccess('Layout успешно сгенерирован из аудио записи!');
    } catch (error: any) {
      console.error('Ошибка генерации из аудио:', error);
      toast.showError(`Ошибка генерации: ${error.message}`);
    }
  };

  const handleTextSubmit = async (text: string) => {
    try {
      setSessionId(sessionId);
      await generateFromText(text);
      toast.showSuccess('Layout успешно сгенерирован из текста!');
    } catch (error: any) {
      console.error('Ошибка генерации из текста:', error);
      toast.showError(`Ошибка генерации: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <button
              onClick={handleBackToEditor}
              className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Назад в редактор
            </button>

            {/* Title */}
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-cyan-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">
                Генерация Layout
              </h1>
            </div>

            {/* Session ID */}
            <div className="text-sm text-gray-400">
              Сессия: <span className="font-mono text-cyan-400">{sessionId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Создайте Layout из вашего контента
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Используйте голосовую запись или текстовое описание для автоматической генерации 
            визуального интерфейса. Система использует ИИ для преобразования ваших идей 
            в готовые компоненты UI.
          </p>
        </div>

        {/* Generation Tools */}
        {!isGenerating ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VoiceRecorder 
              onRecordingComplete={handleVoiceSubmit}
              disabled={isGenerating}
            />
            
            <TextInput 
              onSubmit={handleTextSubmit}
              disabled={isGenerating}
            />
          </div>
        ) : (
          <GenerationStepper 
            steps={generationStages.map(stage => ({
              id: stage.id,
              name: stage.name,
              description: stage.description,
              status: stage.status,
              progress: stage.progress,
              details: stage.result,
              error: stage.error
            }))}
            isVisible={isGenerating}
            generationComplete={generationComplete}
            onRetryStage={retryStage}
          />
        )}

        {/* Info Cards */}
        {!isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-cyan-400 mb-2">
                🎤 Голосовая генерация
              </h4>
              <p className="text-gray-300 text-sm">
                Запишите голосовое описание желаемого интерфейса. 
                Система автоматически распознает речь и создаст соответствующие компоненты.
              </p>
              <ul className="mt-3 text-xs text-gray-400 space-y-1">
                <li>• Поддерживает русский язык</li>
                <li>• Точность транскрипции: 95%+</li>
                <li>• Автоматическое извлечение сущностей</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-purple-400 mb-2">
                ✏️ Текстовая генерация
              </h4>
              <p className="text-gray-300 text-sm">
                Опишите желаемый интерфейс текстом. Система проанализирует 
                описание и преобразует в структурированный layout с компонентами.
              </p>
              <ul className="mt-3 text-xs text-gray-400 space-y-1">
                <li>• Нейросетевой анализ текста</li>
                <li>• Различение сущностей и действий</li>
                <li>• Автоматическое сопоставление компонентов</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePage;