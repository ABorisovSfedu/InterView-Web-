// API клиент для Mod3-v1 (Visual Elements Mapping)
// Сопоставление терминов с UI компонентами и генерация детальных layout

import { fetchJson, API_CONFIG, ComponentCache } from './config';

// Интерфейсы для Mod3 API
export interface Mod3MapRequest {
  session_id: string;
  entities: string[];
  keyphrases: string[];
  template?: string;
}

export interface ComponentMetadata {
  component: string;
  component_type?: string;
  confidence: number;
  match_type: 'exact' | 'synonym' | 'fuzzy' | 'fallback';
  rule_id?: number;
  score?: number;
  props?: Record<string, any>;
  metadata?: {
    confidence: number;
    match_type: string;
    source?: string;
  };
}

export interface Mod3LayoutResponse {
  status: 'ok' | 'error';
  session_id: string;
  layout: {
    template: string;
    sections: {
      hero: ComponentMetadata[];
      main: ComponentMetadata[];
      footer: ComponentMetadata[];
    };
    count: number;
  };
  matches?: Array<{
    term: string;
    component: string;
    component_type?: string;
    confidence: number;
    match_type: string;
    rule_id?: number;
    score?: number;
  }>;
  explanations?: Array<{
    term: string;
    matched_component: string;
    match_type: string;
    score: number;
    rule_id?: number;
  }>;
  error?: string;
}

export interface Mod3Component {
  name: string;
  component_type: string;
  description: string;
  props?: Record<string, any>;
  examples?: string[];
}

export interface Mod3ComponentsResponse {
  status: 'ok' | 'error';
  components: Mod3Component[];
  error?: string;
}

/**
 * Класс для работы с Mod3 API
 * Включает клиентское кэширование компонентов и адаптацию имен
 */
export class Mod3Client {
  private baseUrl: string;
  
  constructor(baseUrl = API_CONFIG.MOD3_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Убираем trailing slash
  }
  
  /**
   * Основной метод сопоставления entities с UI компонентами
   * @param payload - данные для сопоставления
   * @returns детальный layout с компонентами и confidence scores
   */
  async mapEntities(payload: Mod3MapRequest): Promise<Mod3LayoutResponse> {
    if (!payload.entities || payload.entities.length === 0) {
      throw new Error('Entities для сопоставления не могут быть пустыми');
    }
    
    // Создаем стабильный payload без мутаций
    const apiPayload = {
      session_id: payload.session_id,
      entities: [...payload.entities], // Копируем массив
      keyphrases: payload.keyphrases ? [...payload.keyphrases] : [...payload.entities],
      template: payload.template || 'hero-main-footer'
    };
    
    const url = `${this.baseUrl}/v1/map`;
    
    try {
      console.log('🎨 Сопоставление терминов с UI компонентами...', {
        source: 'mod3',
        sessionId: payload.session_id,
        entitiesCount: apiPayload.entities.length,
        template: apiPayload.template,
        entities: apiPayload.entities.slice(0, 5) // Показываем только первые 5
      });
      
      const response = await fetchJson<Mod3LayoutResponse>(url, {
        method: 'POST',
        body: apiPayload,
        timeout: 20000 // Mod3 может быть медленнее из-за синкронизации с компонентами
      }, {
        source: 'mod3-map',
        sessionId: payload.session_id
      });
      
      if (response.data.status !== 'ok') {
        throw new Error(response.data.error || 'Mod3 вернул ошибку при сопоставлении');
      }
      
      // Считаем статистику компонентов
      const stats = this.analyzeLayout(response.data.layout);
      
      console.log('✅ Сопоставление завершено:', {
        source: 'mod3',
        sessionId: payload.session_id,
        totalComponents: response.data.layout.count,
        sections: stats.sections,
        confidence: stats.averageConfidence,
        matches: response.data.matches?.length || 0
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка сопоставления Mod3:', {
        source: 'mod3',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: payload.session_id,
        entitiesCount: payload.entities.length
      });
      
      // Возвращаем минимальный layout при ошибке
      return {
        status: 'error',
        session_id: payload.session_id,
        layout: {
          template: apiPayload.template,
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
   * Получение кэшированного layout из Mod3
   * @param sessionId - идентификатор сессии
   * @returns сохраненный layout
   */
  async getLayout(sessionId: string): Promise<Mod3LayoutResponse> {
    const url = `${this.baseUrl}/v1/layout/${sessionId}`;
    
    try {
      console.log('📋 Получение кэшированного layout из Mod3...', {
        source: 'mod3',
        sessionId
      });
      
      const response = await fetchJson<Mod3LayoutResponse>(url, {
        method: 'GET',
        timeout: 10000
      }, {
        source: 'mod3-layout',
        sessionId
      });
      
      if (response.data.status !== 'ok') {
        return {
          status: 'error',
          session_id: sessionId,
          layout: {
            template: 'hero-main-footer',
            sections: { hero: [], main: [], footer: [] },
            count: 0
          },
          error: 'Layout не найден или недоступен'
        };
      }
      
      console.log('✅ Кэшированный layout получен:', {
        source: 'mod3',
        sessionId,
        template: response.data.layout.template,
        count: response.data.layout.count
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка получения layout из Mod3:', {
        source: 'mod3',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      
      throw new Error(`Layout недоступен: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Получение доступных компонентов с клиентским кэшированием
   * @returns список доступных UI компонентов
   */
  async getComponents(): Promise<Mod3ComponentsResponse> {
    // Проверяем кэш
    const cached = ComponentCache.get();
    if (cached) {
      console.log('📦 Используем кэшированные компоненты:', {
        source: 'mod3',
        count: cached.components?.length || 0
      });
      return cached;
    }
    
    const url = `${this.baseUrl}/v1/components`;
    
    try {
      console.log('🔍 Получение списка компонентов из Mod3...', {
        source: 'mod3'
      });
      
      const response = await fetchJson<Mod3ComponentsResponse>(url, {
        method: 'GET',
        timeout: 10000
      }, {
        source: 'mod3-components'
      });
      
      if (response.data.status !== 'ok') {
        throw new Error(response.data.error || 'Mod3 вернул ошибку при получении компонентов');
      }
      
      // Кэшируем результат
      ComponentCache.set(response.data);
      
      console.log('✅ Компоненты получены:', {
        source: 'mod3',
        count: response.data.components.length
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка получения компонентов из Mod3:', {
        source: 'mod3',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Возвращаем пустой список при ошибке
      const emptyResponse = {
        status: 'error' as const,
        components: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      return emptyResponse;
    }
  }
  
  /**
   * Приведение имени компонента к ui.* формату для фронтенда
   * @param componentName - исходное имя компонента
   * @returns нормализованное имя
   */
  normalizeComponentName(componentName: string): string {
    if (!componentName) return 'ui.unknown';
    
    // Если уже начинается с ui., возвращаем как есть
    if (componentName.startsWith('ui.')) {
      return componentName;
    }
    
    // Добавляем префикс ui.
    return `ui.${componentName}`;
  }
  
  /**
   * Обратное преобразование ui.* имени для отправки в API
   * @param componentName - имя с ui.* префиксом
   * @returns оригинальное имя для API
   */
  denormalizeComponentName(componentName: string): string {
    if (!componentName) return '';
    
    // Убираем префикс ui. если есть
    if (componentName.startsWith('ui.')) {
      return componentName.substring(3);
    }
    
    return componentName;
  }
  
  /**
   * Анализ layout для статистики
   * @param layout - layout для анализа
   * @returns статистическая информация
   */
  private analyzeLayout(layout: any) {
    const sections = {
      hero: layout.sections.hero?.length || 0,
      main: layout.sections.main?.length || 0,
      footer: layout.sections.footer?.length || 0
    };
    
    const allComponents = [
      ...(layout.sections.hero || []),
      ...(layout.sections.main || []),
      ...(layout.sections.footer || [])
    ];
    
    const confidences = allComponents
      .map(c => c.confidence || 0)
      .filter(c => c > 0);
    
    const averageConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0;
    
    return {
      sections,
      totalComponents: layout.count || 0,
      averageConfidence: Math.round(averageConfidence * 100) / 100
    };
  }
  
  /**
   * Проверка здоровья Mod3 сервиса
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetchJson(`${this.baseUrl}/healthz`, {
        method: 'GET',
        timeout: 5000
      }, {
        source: 'mod3-health'
      });
      
      return response.data.status === 'ok';
    } catch (error) {
      console.warn('⚠️ Mod3 health check failed:', error);
      return false;
    }
  }
  
  /**
   * Получение списка доступных шаблонов
   * @returns массив доступных шаблонов
   */
  async getTemplates(): Promise<string[]> {
    try {
      const response = await fetchJson(`${this.baseUrl}/v1/templates`, {
        method: 'GET',
        timeout: 5000
      }, {
        source: 'mod3-templates'
      });
      
      return response.data?.templates || ['hero-main-footer'];
    } catch (error) {
      // Fallback на стандартные шаблоны
      return ['hero-main-footer'];
    }
  }
  
  /**
   * Проверка совместимости компонента
   * @param componentName - имя компонента
   * @returns true если компонент доступен
   */
  async isComponentAvailable(componentName: string): Promise<boolean> {
    try {
      const components = await this.getComponents();
      const normalizedName = this.denormalizeComponentName(componentName);
      
      return components.components.some(
        comp => comp.name === normalizedName || comp.component_type === normalizedName
      );
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Очистка кэша компонентов
   */
  clearCache(): void {
    ComponentCache.clear();
    console.log('🗑️ Кэш компонентов Mod3 очищен');
  }
}

// Экспортируем синглтон для использования в приложении
export const mod3Client = new Mod3Client(API_CONFIG.MOD3_BASE_URL);

// Экспорт по умолчанию
export default mod3Client;
