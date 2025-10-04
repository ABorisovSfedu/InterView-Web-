// Компонент с кнопками для интеграции с новыми API
// Предоставляет интерфейс для генерации из текста/аудио и управления Mod3

import React, { useState, useRef } from 'react';
import { usePageStore } from '../stores/usePageStore';
import { useToast, toastHelpers } from '../utils/toast';
import { mod3Client } from '../api/mod3';

interface ApiIntegrationButtonsProps {
  sessionId?: string;
  className?: string;
  onLayoutGenerated?: (componentsCount: number) => void;
}

export function ApiIntegrationButtons({ 
  sessionId,
  className = '',
  onLayoutGenerated 
}: ApiIntegrationButtonsProps) {
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    generateFromText,
    generateFromVoice,
    refreshMod3Layout,
    isGenerating,
    generationProgress,
    generationStep,
    error,
    setError
  } = usePageStore();
  
  const { addToast } = useToast();

  // Генерация из текста
  const handleGenerateFromText = async () => {
    if (!textInput.trim()) {
      addToast({
        type: 'warning',
        title: 'Введите текст',
        message: 'Опишите желаемый интерфейс в текстовом поле'
      });
      return;
    }

    if (!sessionId) {
      addToast({
        type: 'error',
        title: 'Сессия не выбрана',
        message: 'Необходимо выбрать или создать сессию для генерации'
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      addToast(toastHelpers.processingStarted());
      
      const result = await generateFromText(textInput, sessionId);
      
      if (result.success) {
        const componentsCount = result.finalLayout?.metadata?.count || 0;
        addToast(toastHelpers.layoutGenerated(componentsCount));
        onLayoutGenerated?.(componentsCount);
        setIsTextModalOpen(false);
        setTextInput('');
      } else {
        // Показываем конкретную ошибку
        if (result.error?.includes('Mod3') || result.error?.includes('сопоставление')) {
          addToast(toastHelpers.mod3MappingFailed(() => {
            mod3Client.clearCache();
            refreshMod3Layout(sessionId);
          }));
        } else if (result.error?.includes('entities') || result.error?.includes('Mod2')) {
          addToast(toastHelpers.mod2EntitiesEmpty(() => {
            handleGenerateFromText(); // Ретри
          }));
        } else {
          addToast({
            type: 'error',
            title: 'Ошибка генерации',
            message: result.error || 'Не удалось сгенерировать layout из текста'
          });
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Ошибка обработки',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Генерация из аудио
  const handleGenerateFromVoice = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!sessionId) {
      addToast({
        type: 'error',
        title: 'Сессия не выбрана',
        message: 'Необходимо выбрать или создать сессию для генерации'
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      addToast(toastHelpers.processingStarted());
      
      const result = await generateFromVoice(file, {
        sessionId,
        autoSave: true
      });
      
      if (result.success) {
        const componentsCount = result.finalLayout?.metadata?.count || 0;
        addToast(toastHelpers.layoutGenerated(componentsCount));
        onLayoutGenerated?.(componentsCount);
      } else {
        // Анализируем ошибки
        if (result.error?.includes('транскрипция') || result.error?.includes('transcribe')) {
          addToast(toastHelpers.transcriptionError());
        } else if (result.error?.includes('Mod1') || result.error?.includes('502')) {
          addToast(toastHelpers.networkError('Mod1 (ASR)', () => {
            handleGenerateFromVoice({ target: { files: [file] } } as any); // Ретри
          }));
        } else if (result.error?.includes('Mod3')) {
          addToast(toastHelpers.mod3MappingFailed(() => {
            mod3Client.clearCache();
            refreshMod3Layout(sessionId);
          }));
        } else {
          addToast({
            type: 'error',
            title: 'Ошибка генерации из аудио',
            message: result.error || 'Не удалось обработать аудио файл'
          });
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Ошибка обработки аудио',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    } finally {
      setIsProcessing(false);
      // Очищаем input для повторного выбора того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Обновление layout от Mod3
  const handleRefreshFromMod3 = async () => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    try {
      await refreshMod3Layout(sessionId);
      addToast({
        type: 'info',
        title: 'Layout обновлен',
        message: 'Получены последние данные от Mod3',
        duration: 3000
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Обновление не удалось',
        message: error instanceof Error ? error.message : 'Ошибка обновления от Mod3'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isGenerating || isProcessing;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Кнопка генерации из текста */}
      <div className="relative">
        <button
          onClick={() => setIsTextModalOpen(true)}
          disabled={isLoading || !sessionId}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Сгенерировать из текста
        </button>
      </div>

      {/* Кнопка генерации из аудио */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.webm,.mp3,.m4a"
          onChange={handleGenerateFromVoice}
          className="sr-only"
          disabled={isLoading || !sessionId}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || !sessionId}
          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Сгенерировать из аудио
        </button>
      </div>

      {/* Кнопка обновления от Mod3 */}
      <div className="relative">
        <button
          onClick={handleRefreshFromMod3}
          disabled={isLoading || !sessionId}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить из Mod3
        </button>
      </div>

      {/* Индикатор прогресса */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-blue-500 animate-spin rounded-full border-2 border-blue-300 border-b-blue-600"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-800">
                {generationStep || 'Обработка...'}
              </div>
              {generationProgress > 0 && (
                <div className="mt-1 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для ввода текста */}
      {isTextModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Генерация layout из текста
            </h3>
            
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Например: Создай сайт с кнопкой и изображением в шапке, текстом в основной части и навигационным меню..."
              className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-blue-500 text-sm"
              disabled={isProcessing}
            />
            
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsTextModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleGenerateFromText}
                disabled={isProcessing || !textInput.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                {isProcessing ? 'Обработка...' : 'Сгенерировать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiIntegrationButtons;

