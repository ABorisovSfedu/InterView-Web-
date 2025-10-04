// API клиент для Mod2-v1 (NLP + Entity Extraction)
// Обработка текста, извлечение сущностей и генерация базового layout

import { fetchJson, API_CONFIG, TextUtils } from './config';

// Интерфейсы для Mod2 API
export interface Mod2IngestChunkRequest {
  session_id: string;
  chunk_id: string;
  seq: number;
  lang: string;
  text: string;
  timestamp?: number;
}

export interface Mod2IngestFullRequest {
  session_id: string;
  lang: string;
  text_full: string;
}

export interface Mod2EntitiesResponse {
  status: 'ok' | 'error';
  session_id: string;
  entities: string[];
  keyphrases: string[];
  chunks_processed: number;
  error?: string;
}

export interface Mod2LayoutResponse {
  status: 'ok' | 'error';
  session_id: string;
  layout: {
    template: string;
    sections: {
      hero: any[];
      main: any[];
      footer: any[];
    };
    count: number;
  };
  error?: string;
}

export interface Mod2DebugResponse {
  status: 'ok' | 'error';
  sentences: string[];
  lemmas: string;
  np_candidates: string[];
  error?: string;
}

/**
 * Класс для работы с Mod2 API
 */
export class Mod2Client {
  private baseUrl: string;
  
  constructor(baseUrl = API_CONFIG.MOD2_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Убираем trailing slash
  }
  
  /**
   * Отправка текста для NLP обработки по чанкам
   * @param payload - данные чанка
   * @returns результат обработки Mod2
   */
  async ingestChunk(payload: Mod2IngestChunkRequest): Promise<Mod2IngestChunkRequest> {
    if (!payload.text || TextUtils.isEmpty(payload.text)) {
      throw new Error('Текст для NLP обработки не может быть пустым');
    }
    
    // Нормализуем текст
    const normalizedText = TextUtils.normalize(payload.text);
    const normalizedPayload = {
      ...payload,
      text: normalizedText
    };
    
    const url = `${this.baseUrl}/v2/ingest/chunk`;
    
    try {
      console.log('🧠 Отправка текста в Mod2 (chunk)...', {
        source: 'mod2',
        sessionId: payload.session_id,
        chunkId: payload.chunk_id,
        textLength: normalizedText.length,
        seq: payload.seq
      });
      
      const response = await fetchJson<Mod2IngestChunkRequest>(url, {
        method: 'POST',
        body: normalizedPayload,
        timeout: 15000
      }, {
        source: 'mod2-chunk',
        sessionId: payload.session_id
      });
      
      console.log('✅ Mod2 chunk обработан:', {
        source: 'mod2',
        sessionId: payload.session_id,
        chunkId: payload.chunk_id
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка Mod2 chunk:', {
        source: 'mod2',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: payload.session_id,
        chunkId: payload.chunk_id
      });
      
      throw new Error(`Mod2 обработка текста не удалась: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Отправка полного текста для NLP обработки
   * @param payload - данные полного текста
   * @returns подтверждение обработки
   */
  async ingestFullText(payload: Mod2IngestFullRequest): Promise<{ status: string }> {
    if (!payload.text_full || TextUtils.isEmpty(payload.text_full)) {
      throw new Error('Текст для NLP обработки не может быть пустым');
    }
    
    // Нормализуем текст
    const normalizedText = TextUtils.normalize(payload.text_full);
    const normalizedPayload = {
      ...payload,
      text_full: normalizedText
    };
    
    const url = `${this.baseUrl}/v2/ingest/full`;
    
    try {
      console.log('🧠 Отправка полного текста в Mod2...', {
        source: 'mod2',
        sessionId: payload.session_id,
        textLength: normalizedText.length
      });
      
      const response = await fetchJson<{ status: string }>(url, {
        method: 'POST',
        body: normalizedPayload,
        timeout: 15000
      }, {
        source: 'mod2-full',
        sessionId: payload.session_id
      });
      
      console.log('✅ Mod2 полный текст обработан:', {
        source: 'mod2',
        status: response.data.status,
        sessionId: payload.session_id
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка Mod2 полный текст:', {
        source: 'mod2',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: payload.session_id
      });
      
      throw new Error(`Mod2 обработка текста не удалась: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Получение извлеченных entities из сессии
   * @param sessionId - идентификатор сессии
   * @returns массив извлеченных сущностей и ключевых фраз
   */
  async getEntities(sessionId: string): Promise<Mod2EntitiesResponse> {
    const url = `${this.baseUrl}/v2/session/${sessionId}/entities`;
    
    try {
      console.log('🔍 Получение entities от Mod2...', {
        source: 'mod2',
        sessionId
      });
      
      const response = await fetchJson<Mod2EntitiesResponse>(url, {
        method: 'GET',
        timeout: 10000
      }, {
        source: 'mod2-entities',
        sessionId
      });
      
      if (response.data.status !== 'ok') {
        throw new Error(response.data.error || 'Mod2 вернул ошибку при получении entities');
      }
      
      console.log('✅ Entities получены:', {
        source: 'mod2',
        sessionId,
        entitiesCount: response.data.entities.length,
        keyphrasesCount: response.data.keyphrases.length,
        chunksProcessed: response.data.chunks_processed
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка получения entities от Mod2:', {
        source: 'mod2',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      
      // Возвращаем пустой результат вместо ошибки
      return {
        status: 'error',
        session_id: sessionId,
        entities: [],
        keyphrases: [],
        chunks_processed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Получение layout от Mod2 сервиса
   * @param sessionId - идентификатор сессии
   * @returns базовый layout от Mod2
   */
  async getLayout(sessionId: string): Promise<Mod2LayoutResponse> {
    const url = `${this.baseUrl}/v2/session/${sessionId}/layout`;
    
    try {
      console.log('🏗️ Получение layout от Mod2...', {
        source: 'mod2',
        sessionId
      });
      
      const response = await fetchJson<Mod2LayoutResponse>(url, {
        method: 'GET',
        timeout: 10000
      }, {
        source: 'mod2-layout',
        sessionId
      });
      
      if (response.data.status !== 'ok') {
        throw new Error(response.data.error || 'Mod2 вернул ошибку при получении layout');
      }
      
      console.log('✅ Layout получен от Mod2:', {
        source: 'mod2',
        sessionId,
        template: response.data.layout.template,
        count: response.data.layout.count,
        sections: {
          hero: response.data.layout.sections.hero.length,
          main: response.data.layout.sections.main.length,
          footer: response.data.layout.sections.footer.length
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка получения layout от Mod2:', {
        source: 'mod2',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      
      // Возвращаем пустой layout вместо ошибки
      return {
        status: 'error',
        session_id: sessionId,
        layout: {
          template: 'hero-main-footer',
          sections: {
            hero: [],
            main: [],
            footer: []
          },
          count: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Debug endpoint для прямого парсинга текста
   * Полезно для тестирования NLP функций без сохранения в сессию
   * @param text - текст для парсинга
   * @param lang - язык текста
   * @returns результат парсинга
   */
  async debugParse(text: string, lang = 'ru-RU'): Promise<Mod2DebugResponse> {
    if (!text || TextUtils.isEmpty(text)) {
      throw new Error('Текст для парсинга не может быть пустым');
    }
    
    const normalizedText = TextUtils.normalize(text);
    const payload = {
      text: normalizedText,
      lang
    };
    
    const url = `${this.baseUrl}/debug/parse`;
    
    try {
      console.log('🔍 Debug парсинг текста в Mod2...', {
        source: 'mod2-debug',
        textLength: normalizedText.length,
        lang
      });
      
      const response = await fetchJson<Mod2DebugResponse>(url, {
        method: 'POST',
        body: payload,
        timeout: 10000
      }, {
        source: 'mod2-debug'
      });
      
      console.log('✅ Debug парсинг завершен:', {
        source: 'mod2-debug',
        sentencesCount: response.data.sentences.length,
        lemmasCount: response.data.lemmas.split(' ').length,
        npCandidatesCount: response.data.np_candidates.length
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка debug парсинга Mod2:', {
        source: 'mod2-debug',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new Error(`Debug парсинг не удался: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Проверка здоровья Mod2 сервиса
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetchJson(`${this.baseUrl}/healthz`, {
        method: 'GET',
        timeout: 5000
      }, {
        source: 'mod2-health'
      });
      
      return response.data.status === 'ok';
    } catch (error) {
      console.warn('⚠️ Mod2 health check failed:', error);
      return false;
    }
  }
  
  /**
   * Получение статистики по сессии
   * @param sessionId - идентификатор сессии
   * @returns статистика обработки
   */
  async getSessionStats(sessionId: string): Promise<{
    chunks_processed: number;
    entities_count: number;
    keyphrases_count: number;
    last_processed: string | null;
  }> {
    try {
      const entitiesResponse = await this.getEntities(sessionId);
      
      return {
        chunks_processed: entitiesResponse.chunks_processed,
        entities_count: entitiesResponse.entities.length,
        keyphrases_count: entitiesResponse.keyphrases.length,
        last_processed: entitiesResponse.chunks_processed > 0 ? new Date().toISOString() : null
      };
    } catch (error) {
      return {
        chunks_processed: 0,
        entities_count: 0,
        keyphrases_count: 0,
        last_processed: null
      };
    }
  }
}

// Экспортируем синглтон для использования в приложении
export const mod2Client = new Mod2Client(API_CONFIG.MOD2_BASE_URL);

// Экспорт по умолчанию
export default mod2Client;
