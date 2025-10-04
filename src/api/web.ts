// API клиент для Backend Orchestrator (Web App)
// Оркестрация между фронтендом и модулями, сохранение layout

import { fetchJson, API_CONFIG } from './config';

// Интерфейсы для Web API
export interface WebLayoutRequest {
  layout: any; // PageModel или Block[]
  metadata?: {
    sessionId: string;
    updatedAt: string;
    source: string;
  };
}

export interface WebLayoutResponse {
  status: 'ok' | 'error';
  session_id: string;
  layout_data: any;
  created_at: string;
  updated_at: string;
  error?: string;
}

export interface WebComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  props: any;
  defaultProps: any;
  example_props: any;
  preview?: string;
}

export interface WebComponentsResponse {
  status: 'ok' | 'error';
  components: WebComponent[];
  categories: string[];
  error?: string;
}

export interface WebSessionInfo {
  session_id: string;
  created_at: string;
  updated_at: string;
  layout_count: number;
  last_activity: string;
}

/**
 * Класс для работы с Web API (бэкенд оркестратор)
 * Предоставляет методы для сохранения/загрузки layout и компонентов
 */
export class WebClient {
  private baseUrl: string;
  
  constructor(baseUrl = API_CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Убираем trailing slash
  }
  
  /**
   * Сохранение layout в бэкенде
   * @param sessionId - идентификатор сессии
   * @param layout - layout для сохранения
   * @returns результат сохранения
   */
  async saveLayout(sessionId: string, layout: any): Promise<WebLayoutResponse> {
    if (!layout) {
      throw new Error('Layout для сохранения не может быть пустым');
    }
    
    // Валидируем layout перед сохранением
    const validatedLayout = this.validateLayout(layout);
    
    const payload: WebLayoutRequest = {
      layout: validatedLayout,
      metadata: {
        sessionId,
        updatedAt: new Date().toISOString(),
        source: 'frontend'
      }
    };
    
    const url = `${this.baseUrl}/api/web/v1/session/${sessionId}/layout`;
    
    try {
      console.log('💾 Сохранение layout в бэкенде...', {
        source: 'web-backend',
        sessionId,
        layoutType: Array.isArray(layout) ? 'blocks' : 'pageModel',
        componentsCount: this.countComponents(validatedLayout)
      });
      
      const response = await fetchJson<WebLayoutResponse>(url, {
        method: 'POST',
        body: payload,
        timeout: 15000
      }, {
        source: 'web-save-layout',
        sessionId
      });
      
      if (response.data.status !== 'ok') {
        throw new Error(response.data.error || 'Бэкенд вернул ошибку при сохранении layout');
      }
      
      console.log('✅ Layout сохранен в бэкенде:', {
        source: 'web-backend',
        sessionId,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка сохранения layout в бэкенде:', {
        source: 'web-backend',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      
      throw new Error(`Сохранение layout не удалось: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Загрузка layout из бэкенда
   * @param sessionId - идентификатор сессии
   * @returns загруженный layout
   */
  async loadLayout(sessionId: string): Promise<WebLayoutResponse> {
    const url = `${this.baseUrl}/api/web/v1/session/${sessionId}/layout`;
    
    try {
      console.log('📂 Загрузка layout из бэкенда...', {
        source: 'web-backend',
        sessionId
      });
      
      const response = await fetchJson<WebLayoutResponse>(url, {
        method: 'GET',
        timeout: 10000
      }, {
        source: 'web-load-layout',
        sessionId
      });
      
      if (response.data.status !== 'ok') {
        return {
          status: 'error',
          session_id: sessionId,
          layout_data: null,
          created_at: '',
          updated_at: '',
          error: response.data.error || 'Layout не найден'
        };
      }
      
      console.log('✅ Layout загружен из бэкенда:', {
        source: 'web-backend',
        sessionId,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        hasLayout: !!response.data.layout_data
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка загрузки layout из бэкенда:', {
        source: 'web-backend',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      
      // Возвращаем null вместо ошибки для совместимости
      return {
        status: 'error',
        session_id: sessionId,
        layout_data: null,
        created_at: '',
        updated_at: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Получение списка компонентов веб-приложения
   * @returns список доступных компонентов
   */
  async getWebComponents(): Promise<WebComponentsResponse> {
    const url = `${this.baseUrl}/web/v1/components`;
    
    try {
      console.log('🧳 Получение компонентов веб-приложения...', {
        source: 'web-backend'
      });
      
      const response = await fetchJson<WebComponentsResponse>(url, {
        method: 'GET',
        timeout: 10000
      }, {
        source: 'web-components'
      });
      
      if (response.data.status !== 'ok') {
        throw new Error(response.data.error || 'Бэкенд вернул ошибку при получении компонентов');
      }
      
      console.log('✅ Компоненты веб-приложения получены:', {
        source: 'web-backend',
        count: response.data.components.length,
        categories: response.data.categories
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка получения компонентов веб-приложения:', {
        source: 'web-backend',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Возвращаем стандартные компоненты при ошибке
      return {
        status: 'error',
        components: this.getFallbackComponents(),
        categories: ['ui', 'content', 'layout'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Получение информации о сессии
   * @param sessionId - идентификатор сессии
   * @returns информация о сессии
   */
  async getSessionInfo(sessionId: string): Promise<WebSessionInfo | null> {
    const url = `${this.baseUrl}/web/v1/session/${sessionId}/info`;
    
    try {
      const response = await fetchJson<WebSessionInfo>(url, {
        method: 'GET',
        timeout: 5000
      }, {
        source: 'web-session-info',
        sessionId
      });
      
      return response.data;
    } catch (error) {
      console.warn('⚠️ Не удалось получить информацию о сессии:', error);
      return null;
    }
  }
  
  /**
   * Удаление layout из бэкенда
   * @param sessionId - идентификатор сессии
   * @returns результат удаления
   */
  async deleteLayout(sessionId: string): Promise<{ status: string }> {
    const url = `${this.baseUrl}/api/web/v1/session/${sessionId}/layout`;
    
    try {
      console.log('🗑️ Удаление layout из бэкенда...', {
        source: 'web-backend',
        sessionId
      });
      
      const response = await fetchJson<{ status: string }>(url, {
        method: 'DELETE',
        timeout: 10000
      }, {
        source: 'web-delete-layout',
        sessionId
      });
      
      console.log('✅ Layout удален из бэкенда:', {
        source: 'web-backend',
        sessionId,
        status: response.data.status
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Ошибка удаления layout из бэкенда:', {
        source: 'web-backend',
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      });
      
      throw new Error(`Удаление layout не удалось: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Валидация layout перед сохранением
   * @param layout - layout для валидации
   * @returns валидированный layout
   */
  private validateLayout(layout: any): any {
    if (!layout) {
      throw new Error('Layout не может быть пустым');
    }
    
    // Если это массив blocks
    if (Array.isArray(layout)) {
      return layout.filter(block => block && block.component);
    }
    
    // Если это PageModel
    if (layout.sections) {
      return {
        ...layout,
        sections: {
          hero: (layout.sections.hero || []).filter((block: any) => block && block.component),
          main: (layout.sections.main || []).filter((block: any) => block && block.component),
          footer: (layout.sections.footer || []).filter((block: any) => block && block.component)
        }
      };
    }
    
    // Если это простой объект
    return layout;
  }
  
  /**
   * Подсчет количества компонентов в layout
   * @param layout - layout для подсчета
   * @returns количество компонентов
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
   * Fallback компоненты при недоступности API
   * @returns список стандартных компонентов
   */
  private getFallbackComponents(): WebComponent[] {
    return [
      {
        id: 'ui-button',
        name: 'ui.button',
        type: 'ui.button',
        category: 'ui',
        description: 'Кнопка для действий пользователя',
        props: {
          text: { type: 'string', required: true, default: 'Кнопка' },
          variant: { type: 'string', required: false, default: 'primary' },
          size: { type: 'string', required: false, default: 'medium' }
        },
        defaultProps: { text: 'Кнопка', variant: 'primary', size: 'medium' },
        example_props: { text: 'Нажми меня', variant: 'primary', size: 'large' }
      },
      {
        id: 'ui-heading',
        name: 'ui.heading',
        type: 'ui.heading', 
        category: 'ui',
        description: 'Заголовок различного уровня',
        props: {
          text: { type: 'string', required: true, default: 'Заголовок' },
          level: { type: 'number', required: false, default: 1 },
          variant: { type: 'string', required: false, default: 'default' }
        },
        defaultProps: { text: 'Заголовок', level: 1, variant: 'default' },
        example_props: { text: 'Добро пожаловать', level: 2, variant: 'hero' }
      },
      {
        id: 'ui-text',
        name: 'ui.text',
        type: 'ui.text',
        category: 'ui',
        description: 'Текстовый блок',
        props: {
          text: { type: 'string', required: true, default: 'Текст' },
          variant: { type: 'string', required: false, default: 'body' }
        },
        defaultProps: { text: 'Текст', variant: 'body' },
        example_props: { text: 'Описательный текст...', variant: 'lead' }
      }
    ];
  }
  
  /**
   * Проверка здоровья веб-бэкенда
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetchJson(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      }, {
        source: 'web-health'
      });
      
      return response.data?.status === 'ok';
    } catch (error) {
      console.warn('⚠️ Web backend health check failed:', error);
      return false;
    }
  }
}

// Экспортируем синглтон для использования в приложении
export const webClient = new WebClient();

// Экспорт по умолчанию
export default webClient;

