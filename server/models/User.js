const bcrypt = require('bcryptjs');
const { dbGet, dbRun, dbAll } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.plan = data.plan || 'basic';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Создать нового пользователя
  static async create(email, password, name, plan = 'basic') {
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      
      const result = await dbRun(
        'INSERT INTO users (email, password_hash, name, plan) VALUES (?, ?, ?, ?)',
        [email, passwordHash, name, plan]
      );

      return await User.findById(result.id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Пользователь с таким email уже существует');
      }
      throw error;
    }
  }

  // Найти пользователя по ID
  static async findById(id) {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    return user ? new User(user) : null;
  }

  // Найти пользователя по email
  static async findByEmail(email) {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    return user ? new User(user) : null;
  }

  // Проверить пароль
  async checkPassword(password) {
    const user = await dbGet('SELECT password_hash FROM users WHERE id = ?', [this.id]);
    return await bcrypt.compare(password, user.password_hash);
  }

  // Обновить данные пользователя
  async update(data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.plan !== undefined) {
      fields.push('plan = ?');
      values.push(data.plan);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }

    if (fields.length === 0) return this;

    values.push(this.id);

    await dbRun(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await User.findById(this.id);
  }

  // Обновить пароль
  async updatePassword(newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await dbRun(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, this.id]
    );
  }

  // Получить все проекты пользователя
  async getProjects() {
    const projects = await dbAll(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [this.id]
    );
    return projects;
  }

  // Получить статистику пользователя
  async getStats() {
    const stats = await dbGet(`
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
        COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions
      FROM users u
      LEFT JOIN projects p ON u.id = p.user_id
      LEFT JOIN sessions s ON p.id = s.project_id
      WHERE u.id = ?
    `, [this.id]);

    return stats;
  }

  // Удалить пользователя
  async delete() {
    await dbRun('DELETE FROM users WHERE id = ?', [this.id]);
  }

  // Преобразовать в JSON (без пароля)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      plan: this.plan,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
