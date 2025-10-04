// API клиент для интеграции с Mod2-v1 (NLP + Layout)
// Модуль обработки текста и генерации layout'ов

export interface Mod2Config {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface ChunkIngestRequest {
  session_id: string;
  chunk_id: string;
  seq: number;
  text: string;
  overlap_prefix: string | null;
  lang: string;
}

export interface FullIngestRequest {
  session_id: string;
  text_full: string;
  lang: string;
  duration_sec: number;
  total_chunks?: number;
  chunks?: any[];
}

export interface EntitiesResponse {
  status: string;
  session_id: string;
  entities: string[];
  keyphrases: string[];
  chunks_processed: number;
}

export interface LayoutResponse {
  status: string;
  session_id: string;
  layout: {
    template: string;
    sections: {
      hero?: any[];
      main?: any[];
      footer?: any[];
    };
    count: number;
  };
}

export interface VocabResponse {
  terms: Array<{
    term: string;
    category: string;
    synonyms?: string[];
  }>;
}

export class Mod2Client {
  private config: Mod2Config;

  constructor(config: Mod2Config) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  /**
   * Отправка чанка в Mod2 для NLP обработки
   */
  async ingestChunk(chunk: ChunkIngestRequest): Promise<void> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const idempotencyKey = `chunk_${chunk.chunk_id}_${Date.now()}`;
    
    const response = await fetch(`${this.config.baseUrl}/v2/ingest/chunk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': 'test-signature', // Временная подпись для тестирования
        'Idempotency-Key': idempotencyKey,
        'X-Request-Id': requestId,
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify(chunk)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to ingest chunk: ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * Отправка финального результата в Mod2
   */
  async ingestFull(result: FullIngestRequest): Promise<void> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const idempotencyKey = `full_${result.session_id}_${Date.now()}`;
    
    const response = await fetch(`${this.config.baseUrl}/v2/ingest/full`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': 'test-signature', // Временная подпись для тестирования
        'Idempotency-Key': idempotencyKey,
        'X-Request-Id': requestId,
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify(result)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to ingest full result: ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * Получение сущностей для сессии
   */
  async getSessionEntities(sessionId: string): Promise<EntitiesResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/session/${sessionId}/entities`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get session entities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение layout для сессии
   */
  async getSessionLayout(sessionId: string): Promise<LayoutResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/session/${sessionId}/layout`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get session layout: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение словаря терминов
   */
  async getVocab(): Promise<VocabResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/vocab`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get vocab: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Проверка здоровья Mod2 сервиса
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(`${this.config.baseUrl}/healthz`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Mod2 health check failed:', error);
      return false;
    }
  }

  /**
   * Отладка парсинга текста
   */
  async debugParse(text: string): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/v2/debug/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Failed to debug parse: ${response.statusText}`);
    }

    return response.json();
  }
}

// Создаем экземпляр клиента с настройками по умолчанию
export const mod2Client = new Mod2Client({
  baseUrl: import.meta.env.VITE_MOD2_BASE_URL || 'http://localhost:8001',
  apiKey: import.meta.env.VITE_MOD2_API_KEY
});

export default mod2Client;
