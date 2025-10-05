// Определяем базовый URL API в зависимости от окружения
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // В продакшене используем относительный путь (nginx проксирует)
  : 'http://localhost:5001/api';  // В разработке используем прямой URL к бэкенду

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Установить токен
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Получить заголовки
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Базовый метод для запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'include',
      ...options,
    };

    try {
      console.log('Making API request to:', url, config);
      const response = await fetch(url, config);
      
      // Проверяем, есть ли контент для парсинга
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error.name === 'SyntaxError') {
        throw new Error('Сервер недоступен или возвращает некорректный ответ');
      }
      throw error;
    }
  }

  // GET запрос
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST запрос
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT запрос
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE запрос
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Загрузка файлов
  async uploadFiles(endpoint, files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Аутентификация
  async register(email, password, name, plan = 'basic') {
    return this.post('/auth/register', { email, password, name, plan });
  }

  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(data) {
    return this.put('/auth/profile', data);
  }

  async changePassword(currentPassword, newPassword) {
    return this.put('/auth/change-password', { currentPassword, newPassword });
  }

  // Проекты
  async getProjects() {
    return this.get('/projects');
  }

  async getProject(projectId) {
    return this.get(`/projects/${projectId}`);
  }

  async createProject(name, client = null, description = null) {
    return this.post('/projects', { name, client, description });
  }

  async updateProject(projectId, data) {
    return this.put(`/projects/${projectId}`, data);
  }

  async deleteProject(projectId) {
    return this.delete(`/projects/${projectId}`);
  }

  async getProjectStats(projectId) {
    return this.get(`/projects/${projectId}/stats`);
  }

  // Сессии
  async getProjectSessions(projectId) {
    return this.get(`/sessions/project/${projectId}`);
  }

  async getUserSessions() {
    return this.get(`/sessions/user`);
  }

  async getSession(sessionId) {
    return this.get(`/sessions/${sessionId}`);
  }

  async createSession(projectId, type, duration = null, fileSize = null) {
    const data = { type };
    if (duration !== null) data.duration = duration;
    if (fileSize !== null) data.fileSize = fileSize;
    return this.post(`/sessions/project/${projectId}`, data);
  }

  async updateSession(sessionId, data) {
    return this.put(`/sessions/${sessionId}`, data);
  }

  async deleteSession(sessionId) {
    return this.delete(`/sessions/${sessionId}`);
  }

  async uploadSessionFiles(sessionId, files) {
    return this.uploadFiles(`/sessions/${sessionId}/upload`, files);
  }

  async getSessionFiles(sessionId) {
    return this.get(`/sessions/${sessionId}/files`);
  }

  // Layout сохранение и загрузка
  async saveLayout(sessionId, layoutData) {
    return this.post(`/sessions/${sessionId}/layout`, layoutData);
  }

  async loadLayout(sessionId) {
    return this.get(`/sessions/${sessionId}/layout`);
  }

  // Проверка здоровья сервера
  async healthCheck() {
    return this.get('/health');
  }
}

// Создаем единственный экземпляр API клиента
const apiClient = new ApiClient();

export default apiClient;
