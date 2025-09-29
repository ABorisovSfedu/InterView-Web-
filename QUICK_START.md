# 🚀 Быстрый запуск InterView проекта

## Вариант 1: Через Docker (рекомендуется)

### Предварительные требования
- Docker Desktop установлен и запущен
- Порты 3000 и 5000 свободны

### Запуск одной командой
```bash
./start.sh
```

### Или через npm
```bash
npm run docker:start
```

### Остановка
```bash
./stop.sh
# или
npm run docker:stop
```

## Вариант 2: Обычный запуск (без Docker)

### 1. Установка зависимостей
```bash
# Фронтенд
npm install

# Бэкенд
cd server
npm install
cd ..
```

### 2. Инициализация базы данных
```bash
cd server
npm run init-db
cd ..
```

### 3. Запуск серверов
```bash
# Терминал 1 - Бэкенд
cd server
npm run dev

# Терминал 2 - Фронтенд
npm run dev
```

## 🌐 Доступ к приложению

После запуска:
- **Фронтенд**: http://localhost:3000
- **Бэкенд API**: http://localhost:5001

## 📋 Полезные команды

### Docker команды
```bash
npm run docker:start    # Запуск
npm run docker:stop     # Остановка
npm run docker:logs     # Логи
npm run docker:restart  # Перезапуск
npm run docker:status   # Статус
npm run docker:clean    # Полная очистка
```

### Обычные команды
```bash
npm run dev             # Запуск фронтенда
npm run build           # Сборка фронтенда
cd server && npm run dev # Запуск бэкенда
```

## 🐛 Решение проблем

### Docker не запускается
1. Убедитесь, что Docker Desktop запущен
2. Проверьте, что порты 3000 и 5000 свободны
3. Попробуйте перезапустить Docker

### Проблемы с портами
```bash
# Проверить занятые порты
lsof -i :3000
lsof -i :5000

# Остановить процессы на портах
kill -9 <PID>
```

### Очистка Docker
```bash
# Полная очистка
docker-compose down --rmi all -v
docker system prune -a
```

## 📚 Дополнительная документация

- [DOCKER.md](DOCKER.md) - Подробная документация по Docker
- [README.md](README.md) - Основная документация проекта
