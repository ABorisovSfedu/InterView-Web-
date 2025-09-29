const { dbGet, dbRun, dbAll } = require('../config/database');

class Project {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.name = data.name;
    this.client = data.client;
    this.description = data.description;
    this.status = data.status || 'draft';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Создать новый проект
  static async create(userId, name, client = null, description = null) {
    const result = await dbRun(
      'INSERT INTO projects (user_id, name, client, description) VALUES (?, ?, ?, ?)',
      [userId, name, client, description]
    );

    return await Project.findById(result.id);
  }

  // Найти проект по ID
  static async findById(id) {
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    return project ? new Project(project) : null;
  }

  // Найти проекты пользователя
  static async findByUserId(userId) {
    const projects = await dbAll(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return projects.map(project => new Project(project));
  }

  // Обновить проект
  async update(data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.client !== undefined) {
      fields.push('client = ?');
      values.push(data.client);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) return this;

    values.push(this.id);

    await dbRun(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await Project.findById(this.id);
  }

  // Получить сессии проекта
  async getSessions() {
    const sessions = await dbAll(
      'SELECT * FROM sessions WHERE project_id = ? ORDER BY created_at DESC',
      [this.id]
    );
    return sessions;
  }

  // Получить загруженные файлы проекта
  async getUploadedFiles() {
    const files = await dbAll(
      'SELECT * FROM uploaded_files WHERE project_id = ? ORDER BY created_at DESC',
      [this.id]
    );
    return files;
  }

  // Получить статистику проекта
  async getStats() {
    const stats = await dbGet(`
      SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
        COUNT(DISTINCT uf.id) as total_files,
        COUNT(DISTINCT CASE WHEN uf.status = 'completed' THEN uf.id END) as completed_files,
        COALESCE(SUM(s.duration), 0) as total_duration
      FROM projects p
      LEFT JOIN sessions s ON p.id = s.project_id
      LEFT JOIN uploaded_files uf ON p.id = uf.project_id
      WHERE p.id = ?
    `, [this.id]);

    return stats;
  }

  // Проверить права доступа пользователя
  async checkAccess(userId) {
    return this.userId === userId;
  }

  // Удалить проект
  async delete() {
    await dbRun('DELETE FROM projects WHERE id = ?', [this.id]);
  }

  // Преобразовать в JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      client: this.client,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Project;
