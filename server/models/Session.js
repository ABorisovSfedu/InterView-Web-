const { dbGet, dbRun, dbAll } = require('../config/database');

class Session {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.project_id;
    this.type = data.type;
    this.status = data.status || 'pending';
    this.duration = data.duration;
    this.filePath = data.file_path;
    this.fileSize = data.file_size;
    this.transcript = data.transcript;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Создать новую сессию
  static async create(projectId, type, duration = null, filePath = null, fileSize = null) {
    const result = await dbRun(
      'INSERT INTO sessions (project_id, type, duration, file_path, file_size) VALUES (?, ?, ?, ?, ?)',
      [projectId, type, duration, filePath, fileSize]
    );

    return await Session.findById(result.id);
  }

  // Найти сессию по ID
  static async findById(id) {
    const session = await dbGet('SELECT * FROM sessions WHERE id = ?', [id]);
    return session ? new Session(session) : null;
  }

  // Найти сессии проекта
  static async findByProjectId(projectId) {
    const sessions = await dbAll(
      'SELECT * FROM sessions WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return sessions.map(session => new Session(session));
  }

  // Найти сессии пользователя за период
  static async findByUserIdAndDateRange(userId, startDate, endDate) {
    const sessions = await dbAll(
      `SELECT s.* FROM sessions s 
       JOIN projects p ON s.project_id = p.id 
       WHERE p.user_id = ? AND s.created_at >= ? AND s.created_at <= ? 
       ORDER BY s.created_at DESC`,
      [userId, startDate.toISOString(), endDate.toISOString()]
    );
    return sessions.map(session => new Session(session));
  }

  // Обновить сессию
  async update(data) {
    const fields = [];
    const values = [];

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.duration !== undefined) {
      fields.push('duration = ?');
      values.push(data.duration);
    }
    if (data.filePath !== undefined) {
      fields.push('file_path = ?');
      values.push(data.filePath);
    }
    if (data.fileSize !== undefined) {
      fields.push('file_size = ?');
      values.push(data.fileSize);
    }
    if (data.transcript !== undefined) {
      fields.push('transcript = ?');
      values.push(data.transcript);
    }

    if (fields.length === 0) return this;

    values.push(this.id);

    await dbRun(
      `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await Session.findById(this.id);
  }

  // Получить загруженные файлы сессии
  async getUploadedFiles() {
    const files = await dbAll(
      'SELECT * FROM uploaded_files WHERE session_id = ? ORDER BY created_at DESC',
      [this.id]
    );
    return files;
  }

  // Проверить права доступа через проект
  async checkAccess(userId) {
    const project = await dbGet(
      'SELECT user_id FROM projects WHERE id = ?',
      [this.projectId]
    );
    return project && project.user_id === userId;
  }

  // Удалить сессию
  async delete() {
    await dbRun('DELETE FROM sessions WHERE id = ?', [this.id]);
  }

  // Преобразовать в JSON
  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      type: this.type,
      status: this.status,
      duration: this.duration,
      filePath: this.filePath,
      fileSize: this.fileSize,
      transcript: this.transcript,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Session;
