# 🐳 Docker Setup для InterView

Этот проект настроен для запуска через Docker, что обеспечивает консистентность окружения и простоту развертывания.

## 🚀 Быстрый запуск

### Вариант 1: Через скрипты (рекомендуется)
```bash
# Запуск проекта
./start.sh

# Или через npm
npm run docker:start
```

### Вариант 2: Через Docker Compose
```bash
# Запуск
docker-compose up --build -d

# Остановка
docker-compose down
```

## 📋 Доступные команды

### NPM скрипты
```bash
npm run docker:start    # Запуск проекта
npm run docker:stop     # Остановка проекта
npm run docker:logs     # Просмотр логов
npm run docker:restart  # Перезапуск
npm run docker:status   # Статус контейнеров
npm run docker:clean    # Полная очистка
```

### Docker Compose команды
```bash
docker-compose up -d                    # Запуск в фоне
docker-compose up --build -d           # Пересборка и запуск
docker-compose down                     # Остановка
docker-compose logs -f                  # Логи в реальном времени
docker-compose ps                       # Статус контейнеров
docker-compose restart                  # Перезапуск
docker-compose down --rmi all -v       # Полная очистка
```

## 🌐 Доступные сервисы

После запуска будут доступны:

- **Фронтенд**: http://localhost:3000
- **Бэкенд API**: http://localhost:5001

## 🏗️ Архитектура

Проект состоит из двух сервисов:

### Frontend (React + Vite + Nginx)
- **Порт**: 3000
- **Контейнер**: `interview-frontend`
- **Основа**: nginx:alpine
- **Функции**: Статический хостинг + API проксирование

### Backend (Node.js + Express + SQLite)
- **Порт**: 5000
- **Контейнер**: `interview-backend`
- **Основа**: node:18-alpine
- **Функции**: API сервер + База данных

## 📁 Структура файлов

```
├── Dockerfile.frontend     # Dockerfile для фронтенда
├── server/Dockerfile       # Dockerfile для бэкенда
├── docker-compose.yml      # Оркестрация сервисов
├── nginx.conf             # Конфигурация Nginx
├── start.sh               # Скрипт запуска
├── stop.sh                # Скрипт остановки
├── .dockerignore          # Исключения для фронтенда
└── server/.dockerignore   # Исключения для бэкенда
```

## 🔧 Настройка

### Переменные окружения
Все настройки находятся в `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=5000
```

### Volumes
- `./server/database.sqlite` - База данных SQLite
- `./server/uploads` - Загруженные файлы

## 🐛 Отладка

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только бэкенд
docker-compose logs -f backend

# Только фронтенд
docker-compose logs -f frontend
```

### Вход в контейнер
```bash
# Бэкенд
docker-compose exec backend sh

# Фронтенд
docker-compose exec frontend sh
```

### Проверка здоровья
```bash
# Статус контейнеров
docker-compose ps

# Проверка API
curl http://localhost:5000/api/health

# Проверка фронтенда
curl http://localhost:3000
```

## 🧹 Очистка

### Остановка и удаление контейнеров
```bash
docker-compose down
```

### Полная очистка (включая образы и volumes)
```bash
docker-compose down --rmi all -v
```

## ⚡ Производительность

- Используется multi-stage build для оптимизации размера
- Nginx настроен с gzip сжатием
- Кэширование статических ресурсов
- Health checks для мониторинга

## 🔒 Безопасность

- Контейнеры запускаются от непривилегированного пользователя
- Минимальные базовые образы (alpine)
- Изолированная сеть между сервисами
- Ограниченные права доступа к файловой системе

## 📝 Требования

- Docker 20.10+
- Docker Compose 2.0+
- 2GB свободного места
- Порты 3000 и 5000 должны быть свободны
