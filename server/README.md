# InterView Platform - Backend Server

Серверная часть платформы InterView для визуализации требований.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd server
npm install
```

### 2. Настройка окружения
```bash
cp config.env .env
# Отредактируйте .env файл под ваши нужды
```

### 3. Инициализация базы данных
```bash
npm run init-db
```

### 4. Запуск сервера

**Режим разработки:**
```bash
npm run dev
```

**Продакшн режим:**
```bash
npm start
```

## 📊 API Endpoints

### Аутентификация (`/api/auth`)

- `POST /register` - Регистрация пользователя
- `POST /login` - Вход в систему
- `GET /profile` - Получение профиля пользователя
- `PUT /profile` - Обновление профиля
- `PUT /change-password` - Смена пароля

### Проекты (`/api/projects`)

- `GET /` - Получить все проекты пользователя
- `GET /:projectId` - Получить конкретный проект
- `POST /` - Создать новый проект
- `PUT /:projectId` - Обновить проект
- `DELETE /:projectId` - Удалить проект
- `GET /:projectId/stats` - Статистика проекта

### Сессии (`/api/sessions`)

- `GET /project/:projectId` - Получить сессии проекта
- `GET /:sessionId` - Получить конкретную сессию
- `POST /project/:projectId` - Создать новую сессию
- `PUT /:sessionId` - Обновить сессию
- `DELETE /:sessionId` - Удалить сессию
- `POST /:sessionId/upload` - Загрузить файлы в сессию
- `GET /:sessionId/files` - Получить файлы сессии

### Система (`/api`)

- `GET /health` - Проверка здоровья сервера

## 🗄️ База данных

Используется SQLite с следующими таблицами:

- **users** - Пользователи системы
- **projects** - Проекты пользователей
- **sessions** - Сессии интервью/импорта
- **uploaded_files** - Загруженные файлы

## 🔐 Аутентификация

Используется JWT токены. Добавьте заголовок:
```
Authorization: Bearer <your-jwt-token>
```

## 📁 Загрузка файлов

Поддерживаемые форматы:
- **Документы**: PDF, DOCX
- **Аудио**: MP3, WAV, M4A
- **Текст**: TXT

Максимальный размер файла: 10MB
Максимум файлов за раз: 10

## 🛠️ Разработка

### Структура проекта
```
server/
├── config/          # Конфигурация БД
├── middleware/      # Middleware функции
├── models/          # Модели данных
├── routes/          # API маршруты
├── scripts/         # Скрипты инициализации
├── uploads/         # Загруженные файлы
├── server.js        # Главный файл сервера
└── package.json     # Зависимости
```

### Переменные окружения

```env
PORT=3001                    # Порт сервера
NODE_ENV=development         # Окружение
DB_PATH=./database.sqlite    # Путь к БД
JWT_SECRET=your-secret-key   # Секретный ключ JWT
UPLOAD_DIR=./uploads         # Директория загрузок
MAX_FILE_SIZE=10485760       # Максимальный размер файла
CORS_ORIGIN=http://localhost:5173  # CORS origin
```

## 🔧 Скрипты

- `npm start` - Запуск в продакшн режиме
- `npm run dev` - Запуск в режиме разработки с автоперезагрузкой
- `npm run init-db` - Инициализация базы данных

## 📝 Примеры запросов

### Регистрация
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Иван Иванов",
    "plan": "basic"
  }'
```

### Создание проекта
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Мой проект",
    "client": "ООО Рога и копыта",
    "description": "Описание проекта"
  }'
```

### Загрузка файлов
```bash
curl -X POST http://localhost:3001/api/sessions/1/upload \
  -H "Authorization: Bearer <token>" \
  -F "files=@document.pdf"
```

## 🚨 Обработка ошибок

Сервер возвращает JSON с полем `error` при ошибках:

```json
{
  "error": "Описание ошибки",
  "details": "Дополнительные детали (в dev режиме)"
}
```

Коды ошибок:
- `400` - Ошибка валидации
- `401` - Не авторизован
- `403` - Нет доступа
- `404` - Не найдено
- `409` - Конфликт данных
- `500` - Внутренняя ошибка сервера
