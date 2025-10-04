// End-to-end поток: Voice Audio → Layout Generation
// Полный цикл преобразования голоса в визуальный интерфейс

import { mod1Client, Mod1TranscribeResponse } from '../api/mod1';
import { mod2Client, Mod2EntitiesResponse, Mod2LayoutResponse } from '../api/mod2';
import { mod3Client, Mod3LayoutResponse } from '../api/mod3';
import { webClient, WebLayoutResponse } from '../api/web';
import { DataAdapters, SessionManager } from '../api/config';

// Интерфейсы для потока данных
export interface VoiceToLayoutOptions {
  audioFile: File;
  sessionId?: string;
  skipMod3?: boolean; // Пропустить Mod3 и использовать только Mod2 layout
  autoSave?: boolean;  // Автоматически сохранять результат в бэкенде
  template?: string;   // Шаблон для Mod3 (по умолчанию 'hero-main-footer')
}

export interface VoiceToLayoutProgress {
  step: 'transcribe' | 'nlp' | 'entities' | 'visual-mapping' | 'save' | 'complete';
  progress: number; // 0-100
  message: string;
  data?: any;
}

export interface VoiceToLayoutResult {
  success: boolean;
  sessionId: string;
  transcription?: string;
  entities?: string[];
  keyphrases?: string[];
  mod2Layout?: Mod2LayoutResponse;
  mod3Layout?: Mod3LayoutResponse;
  finalLayout?: any; // PageModel или Block[]
  webLayout?: WebLayoutResponse;
  error?: string;
  steps: VoiceToLayoutProgress[];
}

/**
 * Основной класс для обработки end-to-end потока
 */
export class VoiceToLayoutFlow {
  private currentProgress: VoiceToLayoutProgress[] = [];
  private onProgressCallback?: (progress: VoiceToLayoutProgress[]) => void;
  
  /**
   * Конструктор с опциональным коллбэком прогресса
   */
  constructor(onProgress?: (progress: VoiceToLayoutProgress[]) => void) {
    this.onProgressCallback = onProgress;
  }
  
  /**
   * Основной метод обработки потока voice to layout
   * @param options - параметры обработки
   * @returns результат полного потока
   */
  async process(options: VoiceToLayoutOptions): Promise<VoiceToLayoutResult> {
    this.currentProgress = [];
    
    try {
      // Определяем session ID
      const sessionId = options.sessionId || SessionManager.getSessionId();
      SessionManager.setSessionId(sessionId);
      
      console.log('🎤 Начинаем voice-to-layout поток...', {
        sessionId,
        audioSize: options.audioFile.size,
        audioType: options.audioFile.type,
        skipMod3: options.skipMod3,
        autoSave: options.autoSave
      });
      
      // Шаг 1: Транскрипция аудио (Mod1)
      const transcription = await this.stepTranscribe(options.audioFile, sessionId);
      if (!transcription.success) {
        return this.createErrorResult(sessionId, 'Транскрипция аудио не удалась', transcription.error);
      }
      
      // Шаг 2: NLP обработка текста (Mod2)
      const nlpResult = await this.stepNLP(transcription.data.text, sessionId);
      if (!nlpResult.success) {
        return this.createErrorResult(sessionId, 'NLP обработка не удалась', nlpResult.error);
      }
      
      // Шаг 3: Получение entities (Mod2)
      const entitiesResult = await this.stepGetEntities(sessionId);
      if (!entitiesResult.success) {
        return this.createErrorResult(sessionId, 'Извлечение entities не удалось', entitiesResult.error);
      }
      
      // Шаг 4: Визуальное сопоставление (Mod3) или использование Mod2 layout
      let mod3Result;
      let finalLayout;
      
      if (options.skipMod3 || entitiesResult.data.entities.length === 0) {
        // Используем layout от Mod2
        const mod2LayoutResult = await this.stepGetMod2Layout(sessionId);
        if (mod2LayoutResult.success) {
          finalLayout = mod2LayoutResult.data;
          mod3Result = { success: false, data: null };
        } else {
          return this.createErrorResult(sessionId, 'Получение Mod2 layout не удалось', mod2LayoutResult.error);
        }
      } else {
        // Используем Mod3 для визуального сопоставления
        mod3Result = await this.stepMod3Mapping(entitiesResult.data, sessionId, options.template);
        if (mod3Result.success) {
          // Конвертируем Mod3 layout в формат PageModel
          finalLayout = DataAdapters.fromMod3(mod3Result.data);
        } else {
          return this.createErrorResult(sessionId, 'Визуальное сопоставление Mod3 не удалось', mod3Result.error);
        }
      }
      
      // Шаг 5: Сохранение в бэкенде (опционально)
      let webLayoutResult;
      if (options.autoSave && finalLayout) {
        webLayoutResult = await this.stepSaveLayout(sessionId, finalLayout);
      }
      
      // Формируем итоговый результат
      const result: VoiceToLayoutResult = {
        success: true,
        sessionId,
        transcription: transcription.data.text,
        entities: entitiesResult.data.entities,
        keyphrases: entitiesResult.data.keyphrases,
        mod2Layout: mod2LayoutResult?.data,
        mod3Layout: mod3Result.success ? mod3Result.data : undefined,
        finalLayout,
        webLayout: webLayoutResult?.success ? webLayoutResult.data : undefined,
        steps: [...this.currentProgress]
      };
      
      console.log('✅ Voice-to-layout поток завершен успешно:', {
        sessionId,
        transcriptionLength: transcription.data.text.length,
        entitiesCount: entitiesResult.data.entities.length,
        componentsGenerated: finalLayout ? this.countComponents(finalLayout) : 0,
        completedSteps: this.currentProgress.length
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Критическая ошибка в voice-to-layout потоке:', error);
      return this.createErrorResult(
        options.sessionId || SessionManager.getSessionId(),
        'Критическая ошибка приложения',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Шаг 1: Транскрипция аудио
   */
  private async stepTranscribe(audioFile: File, sessionId: string): Promise<{
    success: boolean;
    data?: Mod1TranscribeResponse;
    error?: string;
  }> {
    this.updateProgress({
      step: 'transcribe',
      progress: 10,
      message: 'Обработка аудио в Mod1...'
    });
    
    try {
      const result = await mod1Client.transcribe({
        file: audioFile,
        sessionId,
        chunkId: `chunk_${Date.now()}`
      });
      
      this.updateProgress({
        step: 'transcribe',
        progress: 25,
        message: 'Транскрипция завершена',
        data: { transcription: result.text }
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка транскрипции';
      this.updateProgress({
        step: 'transcribe',
        progress: 25,
        message: `Ошибка транскрипции: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Шаг 2: NLP обработка текста
   */
  private async stepNLP(text: string, sessionId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    this.updateProgress({
      step: 'nlp',
      progress: 40,
      message: 'NLP обработка текста в Mod2...'
    });
    
    try {
      await mod2Client.ingestFullText({
        session_id: sessionId,
        lang: 'ru-RU',
        text_full: text
      });
      
      this.updateProgress({
        step: 'nlp',
        progress: 50,
        message: 'NLP обработка завершена',
        data: { textProcessed: text.length }
      });
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка NLP обработки';
      this.updateProgress({
        step: 'nlp',
        progress: 50,
        message: `Ошибка NLP: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Шаг 3: Получение entities
   */
  private async stepGetEntities(sessionId: string): Promise<{
    success: boolean;
    data?: Mod2EntitiesResponse;
    error?: string;
  }> {
    this.updateProgress({
      step: 'entities',
      progress: 60,
      message: 'Извлечение сущностей из текста...'
    });
    
    try {
      const entities = await mod2Client.getEntities(sessionId);
      
      this.updateProgress({
        step: 'entities',
        progress: 75,
        message: `Извлечено ${entities.entities.length} сущностей`,
        data: { entitiesCount: entities.entities.length, entities: entities.entities.slice(0, 3) }
      });
      
      return { success: true, data: entities };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка извлечения entities';
      this.updateProgress({
        step: 'entities',
        progress: 75,
        message: `Ошибка извлечения сущностей: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Шаг 4: Получение layout от Mod2
   */
  private async stepGetMod2Layout(sessionId: string): Promise<{
    success: boolean;
    data?: Mod2LayoutResponse;
    error?: string;
  }> {
    this.updateProgress({
      step: 'visual-mapping',
      progress: 80,
      message: 'Получение layout от Mod2...'
    });
    
    try {
      const layout = await mod2Client.getLayout(sessionId);
      
      this.updateProgress({
        step: 'visual-mapping',
        progress: 90,
        message: `Получен layout с ${layout.layout.count} компонентами`,
        data: { componentsCount: layout.layout.count, template: layout.layout.template }
      });
      
      return { success: true, data: layout };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка получения Mod2 layout';
      this.updateProgress({
        step: 'visual-mapping',
        progress: 90,
        message: `Ошибка Mod2 layout: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Шаг 5: Визуальное сопоставление в Mod3
   */
  private async stepMod3Mapping(entitiesData: Mod2EntitiesResponse, sessionId: string, template?: string): Promise<{
    success: boolean;
    data?: Mod3LayoutResponse;
    error?: string;
  }> {
    this.updateProgress({
      step: 'visual-mapping',
      progress: 80,
      message: 'Сопоставление с визуальными элементами в Mod3...'
    });
    
    try {
      const mapping = await mod3Client.mapEntities({
        session_id: sessionId,
        entities: entitiesData.entities,
        keyphrases: entitiesData.keyphrases,
        template: template || 'hero-main-footer'
      });
      
      this.updateProgress({
        step: 'visual-mapping',
        progress: 90,
        message: `Сгенерировано ${mapping.layout.count} компонентов`,
        data: { 
          componentsCount: mapping.layout.count,
          template: mapping.layout.template,
          sections: {
            hero: mapping.layout.sections.hero.length,
            main: mapping.layout.sections.main.length,
            footer: mapping.layout.sections.footer.length
          }
        }
      });
      
      return { success: true, data: mapping };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка Mod3 сопоставления';
      this.updateProgress({
        step: 'visual-mapping',
        progress: 90,
        message: `Ошибка Mod3: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Шаг 6: Сохранение layout в бэкенде
   */
  private async stepSaveLayout(sessionId: string, layout: any): Promise<{
    success: boolean;
    data?: WebLayoutResponse;
    error?: string;
  }> {
    this.updateProgress({
      step: 'save',
      progress: 95,
      message: 'Сохранение layout в бэкенде...'
    });
    
    try {
      const result = await webClient.saveLayout(sessionId, layout);
      
      this.updateProgress({
        step: 'complete',
        progress: 100,
        message: 'Процесс завершен успешно',
        data: { saved: true, updatedAt: result.updated_at }
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сохранения';
      this.updateProgress({
        step: 'save',
        progress: 100,
        message: `Ошибка сохранения: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Обновление прогресса
   */
  private updateProgress(progress: VoiceToLayoutProgress): void {
    this.currentProgress.push(progress);
    
    if (this.onProgressCallback) {
      this.onProgressCallback([...this.currentProgress]);
    }
  }
  
  /**
   * Создание результата с ошибкой
   */
  private createErrorResult(sessionId: string, message: string, error?: string): VoiceToLayoutResult {
    return {
      success: false,
      sessionId,
      error: `${message}: ${error || 'Unknown error'}`,
      steps: [...this.currentProgress]
    };
  }
  
  /**
   * Подсчет компонентов в layout
   */
  private countComponents(layout: any): number {
    if (Array.isArray(layout)) {
      return layout.length;
    }
    
    if (layout.sections) {
      return (layout.sections.hero?.length || 0) + 
             (layout.sections.main?.length || 0) + 
             (layout.sections.footer?.length || 0);
    }
    
    return 0;
  }
  
  /**
   * Получение последнего прогресса
   */
  getLastProgress(): VoiceToLayoutProgress | null {
    return this.currentProgress[this.currentProgress.length - 1] || null;
  }
  
  /**
   * Получение всего прогресса
   */
  getAllProgress(): VoiceToLayoutProgress[] {
    return [...this.currentProgress];
  }
}

/**
 * Быстрый метод для запуска потока без детального контроля прогресса
 * @param audioFile - аудио файл
 * @param options - дополнительные опции
 * @returns результат обработки
 */
export async function convertVoiceToLayout(
  audioFile: File, 
  options: Omit<VoiceToLayoutOptions, 'audioFile'> = {}
): Promise<VoiceToLayoutResult> {
  const flow = new VoiceToLayoutFlow();
  return flow.process({ audioFile, ...options });
}

/**
 * Поток обработки только текста (без аудио)
 * @param text - текст для обработки
 * @param sessionId - идентификатор сессии (опционально)
 * @returns результат обработки
 */
export async function convertTextToLayout(
  text: string,
  sessionId?: string
): Promise<VoiceToLayoutResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Текст для обработки не может быть пустым');
  }
  
  const actualSessionId = sessionId || SessionManager.getSessionId();
  
  console.log('📝 Начинаем text-to-layout поток...', {
    sessionId: actualSessionId,
    textLength: text.length
  });
  
  // Шаг 1: NLP обработка
  await mod2Client.ingestFullText({
    session_id: actualSessionId,
    lang: 'ru-RU',
    text_full: text
  });
  
  // Шаг 2: Извлечение entities  
  const entities = await mod2Client.getEntities(actualSessionId);
  
  // Шаг 3: Визуальное сопоставление
  const mod3Layout = await mod3Client.mapEntities({
    session_id: actualSessionId,
    entities: entities.entities,
    keyphrases: entities.keyphrases,
    template: 'hero-main-footer'
  });
  
  // Шаг 4: Конвертация в PageModel
  const finalLayout = DataAdapters.fromMod3(mod3Layout);
  
  // Шаг 5: Сохранение в бэкенде
  const webLayout = await webClient.saveLayout(actualSessionId, finalLayout);
  
  return {
    success: true,
    sessionId: actualSessionId,
    transcription: text,
    entities: entities.entities,
    keyphrases: entities.keyphrases,
    mod3Layout,
    finalLayout,
    webLayout,
    steps: [
      { step: 'nlp', progress: 25, message: 'NLP обработка завершена' },
      { step: 'entities', progress: 50, message: 'Сущности извлечены' },
      { step: 'visual-mapping', progress: 75, message: 'Компоненты сопоставлены' },
      { step: 'save', progress: 90, message: 'Layout сохранен' },
      { step: 'complete', progress: 100, message: 'Процесс завершен' }
    ]
  };
}

export default VoiceToLayoutFlow;
