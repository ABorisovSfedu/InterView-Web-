const { db, dbRun } = require('../config/database');

async function initDatabase() {
  try {
    console.log('🚀 Инициализация базы данных...');

    // Создаем таблицу пользователей
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        plan TEXT DEFAULT 'basic' CHECK(plan IN ('basic', 'pro', 'premium')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаем таблицу проектов
    await dbRun(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        client TEXT,
        description TEXT,
        status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'done')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Создаем таблицу сессий
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('interview', 'import')),
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'error')),
        duration INTEGER,
        file_path TEXT,
        file_size INTEGER,
        transcript TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Создаем таблицу загруженных файлов
    await dbRun(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        project_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        status TEXT DEFAULT 'uploading' CHECK(status IN ('uploading', 'processing', 'completed', 'error')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Создаем индексы для оптимизации запросов
    await dbRun('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_uploaded_files_project_id ON uploaded_files(project_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

    // Создаем триггеры для автоматического обновления updated_at
    await dbRun(`
      CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
      AFTER UPDATE ON users
      BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    await dbRun(`
      CREATE TRIGGER IF NOT EXISTS update_projects_updated_at 
      AFTER UPDATE ON projects
      BEGIN
        UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    await dbRun(`
      CREATE TRIGGER IF NOT EXISTS update_sessions_updated_at 
      AFTER UPDATE ON sessions
      BEGIN
        UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    console.log('✅ База данных успешно инициализирована!');
    console.log('📊 Созданы таблицы: users, projects, sessions, uploaded_files');
    console.log('🔍 Созданы индексы и триггеры для оптимизации');

  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

initDatabase();
