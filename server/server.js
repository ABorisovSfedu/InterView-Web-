const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const sessionRoutes = require('./routes/sessions');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware безопасности
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS настройки
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за 15 минут
  message: {
    error: 'Слишком много запросов с этого IP, попробуйте позже'
  }
});
app.use('/api/', limiter);

// Логирование
app.use(morgan('combined'));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sessions', sessionRoutes);

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Обработка 404
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint не найден',
    path: req.originalUrl
  });
});

// Глобальная обработка ошибок
app.use((error, req, res, next) => {
  console.error('Глобальная ошибка:', error);
  
  // Multer ошибки
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Файл слишком большой'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Слишком много файлов'
    });
  }

  // SQLite ошибки
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      error: 'Нарушение уникальности данных'
    });
  }

  // JWT ошибки
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Недействительный токен'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Токен истек'
    });
  }

  // Ошибки валидации
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      details: error.message
    });
  }

  // Ошибки по умолчанию
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 API доступно по адресу: http://localhost:${PORT}/api`);
  console.log(`🏥 Проверка здоровья: http://localhost:${PORT}/api/health`);
  console.log(`📁 Загруженные файлы: http://localhost:${PORT}/uploads`);
  console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершение работы сервера...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершение работы сервера...');
  process.exit(0);
});

module.exports = app;
