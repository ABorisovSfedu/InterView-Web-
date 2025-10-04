// Единая конфигурация API для всех модулей
// Безопасная отправка запросов с retry и таймаутами

import { v4 as uuidv4 } from 'uuid';

// Конфигурация базовых URL из переменных среды
export const API_CONFIG = {
  MOD1_BASE_URL: 'http://localhost:8080', // Mod1 порт
  MOD2_BASE_URL: 'http://localhost:8001', // Mod2 порт  
  MOD3_BASE_URL: 'http://localhost:9001', // Mod3 порт
  API_BASE_URL: 'http://localhost:3002', // Backend порт (исправлен с 5001)
} as const;

// Интерфейсы для конфигурации запросов
export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  retries?: number;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  requestId: string;
  url: string;
  status: number;
}

// Утилиты для работы с сессиями
export const SessionManager = {
  getSessionId(): string | null {
    return localStorage.getItem('session_id');
  },
  
  setSessionId(sessionId: string): void {
    localStorage.setItem('session_id', sessionId);
  },
  
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  ensureSessionId(): string {
    let sessionId = this.getSessionId();
    if (!sessionId) {
      sessionId = uuidv4();
      this.setSessionId(sessionId);
    }
    return sessionId;
  }
};

// Базовый URL для заголовков безопасности
const SECURITY_HEADERS = {
  'X-Client': 'interview-web',
  'User-Agent': 'InterviewWebApp/1.0.0',
};

// Конфигурация для логирования (только в dev)
const shouldLog = import.meta.env.DEV;

// Локальное хранение кэша компонентов (для Mod3)
const ComponentCache = {
  data: null as any,
  timestamp: 0,
  TTL: 60 * 1000, // 60 секунд
  
  set(data: any) {
    this.data = data;
    this.timestamp = Date.now();
  },
  
  get() {
    if (Date.now() - this.timestamp < this.TTL) {
      return this.data;
    }
    return null;
  },
  
  clear() {
    this.data = null;
    this.timestamp = 0;
  }
};

export { ComponentCache };

/**
 * Основная функция для безопасных API запросов
 * Включает retry с экспоненциальным backoff, таймауты и логирование
 */
export async function fetchJson<T = any>(
  url: string, 
  options: FetchOptions = {},
  config: { source?: string; sessionId?: string } = {}
): Promise<ApiResponse<T>> {
  const { 
    method = 'GET', 
    headers = {}, 
    body, 
    retries = 2, 
    timeout = 10000 
  } = options;
  
  const { source = 'unknown', sessionId = SessionManager.getSessionId() } = config;
  const requestId = SessionManager.generateRequestId();
  
  // Формируем заголовки
  const requestHeaders: Record<string, string> = {
    ...SECURITY_HEADERS,
    'X-Request-Id': requestId,
    'X-Session-Id': sessionId,
    ...headers,
  };
  
  // Для multipart не добавляем Content-Type
  if (!headers['Content-Type'] && method !== 'GET') {
    requestHeaders['Content-Type'] = 'application/json';
  }
  
  // Настройки запроса
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    signal: controller.signal,
  };
  
  // Добавляем body если есть
  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
      // FormData сам устанавливает Content-Type
      delete requestHeaders['Content-Type'];
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }
  
  // Логирование запроса (dev only)
  if (shouldLog) {
    console.group(`🔄 API Request [${source}]`);
    console.log(`URL: ${method} ${url}`);
    console.log(`Request ID: ${requestId}`);
    console.log(`Session ID: ${sessionId}`);
    console.log(headers);
    if (body && !(body instanceof FormData)) {
      console.log('Body:', body);
    }
  }
  
  // Выполняем запрос с retry логикой
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // Логирование ответа (dev only)
      if (shouldLog) {
        console.log(`Status: ${response.status} ${response.statusText}`);
      }
      
      // Обработка различных статусов
      if (response.ok) {
        let data: T;
        
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as any;
        }
        
        if (shouldLog) {
          console.log('Response data:', data);
          console.groupEnd();
        }
        
        return {
          data,
          requestId,
          url: response.url,
          status: response.status,
        };
      }
      
      // Обработка ошибок HTTP
      const errorText = await response.text();
      lastError = new Error(`HTTP ${response.status}: ${errorText}`);
      
      // Быстрый retry для 429 или 5xx
      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          if (shouldLog) {
            console.log(`⏳ Retry ${attempt + 1}/${retries} after ${delay}ms`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Для других ошибок не делаем retry
      throw lastError;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (shouldLog) {
        console.error(`❌ Attempt ${attempt + 1} failed:`, lastError.message);
      }
      
      // Если это не последняя попытка и ошибка связана с сетью
      if (attempt < retries && (
        lastError.message.includes('fetch') || 
        lastError.message.includes('AbortError') ||
        lastError.message.includes('Network')
      )) {
        const delay = Math.pow(2, attempt) * 1000;
        if (shouldLog) {
          console.log(`⏳ Retry ${attempt + 1}/${retries} after ${delay}ms`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break;
    }
  }
  
  // Если все попытки исчерпаны
  if (shouldLog) {
    console.error(`❌ All retries failed for ${method} ${url}`);
    console.groupEnd();
  }
  
  throw lastError || new Error('Request failed after all retries');
}

/**
 * Утилиты для нормализации текста перед отправкой в Mod2
 */
export const TextUtils = {
  normalize(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Заменяем множественные пробелы на одиночные
      .replace(/\n\s*\n/g, '\n') // Убираем пустые строки между текстом
      .trim();
  },
  
  isEmpty(text: string): boolean {
    return !text || text.trim().length === 0;
  }
};

/**
 * Адаптеры для конвертации данных между форматами модулей
 */
export const DataAdapters = {
  // Конвертация ответа Mod3 в формат PageModel
  fromMod3(mod3Layout: any): any {
    if (!mod3Layout?.layout) {
      return null;
    }
    
    const { layout } = mod3Layout;
    
    // Конвертируем компоненты в ui.* формат для фронтенда
    const convertSection = (section: any[]) => {
      if (!Array.isArray(section)) return [];
      
      return section.map(block => ({
        ...block,
        component: block.component?.startsWith('ui.') 
          ? block.component 
          : `ui.${block.component}`,
        // Добавляем метаданные если их нет
        metadata: {
          confidence: block.confidence || 1.0,
          match_type: block.match_type || 'unknown',
          source: 'mod3',
          ...block.metadata
        }
      }));
    };
    
    return {
      template: layout.template || 'hero-main-footer',
      sections: {
        hero: convertSection(layout.sections?.hero || []),
        main: convertSection(layout.sections?.main || []),
        footer: convertSection(layout.sections?.footer || [])
      },
      metadata: {
        sessionId: mod3Layout.session_id,
        count: layout.count || 0,
        source: 'mod3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }
};

// Экспорт для использования в других модулях
export default {
  fetchJson,
  API_CONFIG,
  SessionManager,
  TextUtils,
  DataAdapters,
  ComponentCache
};
