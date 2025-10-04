// API клиент для интеграции с Mod3-v1 (Visual Elements Mapping)
// Модуль сопоставления NLP результатов с визуальными элементами интерфейса

export interface Mod3Config {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface MapRequest {
  session_id: string;
  entities: string[];
  keyphrases: string[];
  template?: string;
}

export interface ComponentMatch {
  term: string;
  component: string;
  component_type: string;
  confidence: number;
  match_type: 'exact' | 'fuzzy' | 'synonym' | 'default';
}

export interface LayoutSection {
  [key: string]: Array<{
    component: string;
    confidence?: number;
    match_type?: string;
  }>;
}

export interface MapResponse {
  status: string;
  session_id: string;
  layout: {
    template: string;
    sections: LayoutSection;
    count: number;
  };
  matches: ComponentMatch[];
  explanations: Array<{
    term: string;
    matched_component: string;
    match_type: string;
    score: number;
  }>;
}

export interface VocabTerm {
  term: string;
  category: string;
  synonyms?: string[];
}

export interface VocabResponse {
  terms: VocabTerm[];
}

export class Mod3Client {
  private config: Mod3Config;

  constructor(config: Mod3Config) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  /**
   * Сопоставление сущностей с layout'ом
   */
  async mapEntities(request: MapRequest): Promise<MapResponse> {
    console.log('🔄 Mod3Client.mapEntities called with:', request);
    
    const response = await fetch(`${this.config.baseUrl}/v1/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify(request)
    });

    console.log('📊 Mod3 API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Mod3 API error:', response.status, errorText);
      throw new Error(`Mapping failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Mod3 API success:', result);
    return result;
  }

  /**
   * Получение сохраненного layout'а для сессии
   */
  async getLayout(sessionId: string): Promise<MapResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/layout/${sessionId}`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get layout: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение словаря терминов
   */
  async getVocab(): Promise<VocabResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/vocab`, {
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
   * Синхронизация словаря терминов
   */
  async syncVocab(): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/v1/vocab/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to sync vocab: ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * Проверка здоровья Mod3 сервиса
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
      console.warn('Mod3 health check failed:', error);
      return false;
    }
  }

  /**
   * Получение статистики сопоставлений
   */
  async getMappingStats(sessionId: string): Promise<{
    total_matches: number;
    exact_matches: number;
    fuzzy_matches: number;
    synonym_matches: number;
    default_matches: number;
    confidence_avg: number;
  }> {
    const response = await fetch(`${this.config.baseUrl}/v1/stats/${sessionId}`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get mapping stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение доступных шаблонов layout'ов
   */
  async getTemplates(): Promise<{
    templates: Array<{
      name: string;
      description: string;
      sections: string[];
      max_components: number;
    }>;
  }> {
    const response = await fetch(`${this.config.baseUrl}/v1/templates`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Создание кастомного сопоставления
   */
  async createCustomMapping(
    term: string, 
    component: string, 
    componentType: string,
    confidence: number = 1.0
  ): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/v1/mappings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({
        term,
        component,
        component_type: componentType,
        confidence
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create custom mapping: ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * Получение истории сопоставлений для сессии
   */
  async getMappingHistory(sessionId: string): Promise<{
    history: Array<{
      timestamp: string;
      entities: string[];
      keyphrases: string[];
      matches: ComponentMatch[];
      layout: LayoutSection;
    }>;
  }> {
    const response = await fetch(`${this.config.baseUrl}/v1/history/${sessionId}`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get mapping history: ${response.statusText}`);
    }

    return response.json();
  }
}

// Создаем экземпляр клиента с настройками по умолчанию
export const mod3Client = new Mod3Client({
  baseUrl: 'http://localhost:9001',
  apiKey: undefined
});

export default mod3Client;
