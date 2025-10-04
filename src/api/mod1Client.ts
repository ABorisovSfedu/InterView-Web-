// API клиент для интеграции с Mod1_v2 (ASR + Chunk)
// Модуль обработки аудио и транскрипции

export interface Mod1Config {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface TranscribeRequest {
  session_id: string;
  lang?: string;
  emit_partial?: boolean;
  audio_file?: File;
  audio_data?: ArrayBuffer;
}

export interface TranscribeResponse {
  status: string;
  session_id: string;
  chunk_id: string;
  text_full: string;
  confidence: number;
  language: string;
  chunks: any[];
}

export interface ChunkData {
  session_id: string;
  chunk_id: string;
  seq: number;
  text: string;
  overlap_prefix: string | null;
  lang: string;
}

export interface WebSocketMessage {
  type: 'hello' | 'progress' | 'chunk' | 'final' | 'error';
  data?: ChunkData | TranscribeResponse | { error: string } | any;
}

export class Mod1Client {
  private config: Mod1Config;
  private wsConnection: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Mod1Config) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  /**
   * Пакетная транскрипция аудио файла
   */
  async transcribeFile(request: TranscribeRequest): Promise<TranscribeResponse> {
    console.log('🔄 Mod1Client.transcribeFile called with:', request);
    
    const formData = new FormData();
    // Параметры передаются в URL, не в FormData
    
    if (request.audio_file) {
      console.log('📁 Adding audio file to FormData:', request.audio_file.name, 'size:', request.audio_file.size);
      formData.append('file', request.audio_file);
    }

    console.log('📡 Sending request to Mod1 REST API...');
    // Добавляем timestamp для предотвращения кэширования
    const timestamp = Date.now();
    const url = `${this.config.baseUrl}/v1/transcribe?session_id=${encodeURIComponent(request.session_id)}&lang=${encodeURIComponent(request.lang || 'ru-RU')}&timestamp=${timestamp}`;
    console.log('🔗 Request URL:', url);
    console.log('🕐 Timestamp added:', timestamp);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    console.log('📊 Mod1 REST API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Mod1 REST API error:', response.status, errorText);
      throw new Error(`Transcription failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Mod1 REST API success:', result);
    return result;
  }

  /**
   * Получить полный текст сессии
   */
  async getSessionText(sessionId: string): Promise<TranscribeResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/session/${sessionId}/text`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get session text: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получить чанки сессии
   */
  async getSessionChunks(sessionId: string): Promise<ChunkData[]> {
    const response = await fetch(`${this.config.baseUrl}/v1/session/${sessionId}/chunks`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get session chunks: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Подключение к WebSocket для real-time стриминга
   */
  connectWebSocket(
    sessionId: string,
    onMessage: (message: WebSocketMessage) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
  ): void {
    const wsUrl = `${this.config.baseUrl.replace('http', 'ws')}/v1/stream?session_id=${sessionId}&lang=ru-RU&emit_partial=true&chunking=true`;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('WebSocket connected to Mod1');
      this.wsReconnectAttempts = 0;
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      onClose?.();
      
      // Попытка переподключения
      if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
        this.wsReconnectAttempts++;
        console.log(`Attempting to reconnect (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => {
          this.connectWebSocket(sessionId, onMessage, onError, onClose);
        }, 2000 * this.wsReconnectAttempts);
      }
    };
  }

  /**
   * Отправка аудио данных через WebSocket
   */
  sendAudioData(audioData: ArrayBuffer): void {
    console.log('🎵 Sending audio data, size:', audioData.byteLength, 'bytes');
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(audioData);
      console.log('✅ Audio data sent successfully');
    } else {
      console.warn('❌ WebSocket is not connected, readyState:', this.wsConnection?.readyState);
    }
  }

  /**
   * Отключение от WebSocket
   */
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Проверка здоровья Mod1 сервиса
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
      console.warn('Mod1 health check failed (CORS or service unavailable):', error);
      return false;
    }
  }

  /**
   * Регистрация webhook'ов для получения результатов
   */
  async registerWebhook(webhookUrl: string, events: string[] = ['chunk', 'final']): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/v1/hooks/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({
        url: webhookUrl,
        events
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to register webhook: ${response.statusText}`);
    }
  }
}

// Создаем экземпляр клиента с настройками по умолчанию
export const mod1Client = new Mod1Client({
  baseUrl: import.meta.env.VITE_MOD1_BASE_URL || 'http://localhost:8080',
  apiKey: import.meta.env.VITE_MOD1_API_KEY
});

export default mod1Client;
