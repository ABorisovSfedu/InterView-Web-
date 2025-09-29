
# 🎯 InterView Platform

Полнофункциональная платформа для проведения интервью с AI-ассистентом и визуализацией данных.

## 🚀 Быстрый запуск

### Вариант 1: Docker (рекомендуется)
```bash
# Одна команда для запуска всего проекта
./start.sh
```

### Вариант 2: Обычный запуск
```bash
# Установка зависимостей
npm install
cd server && npm install && cd ..

# Инициализация базы данных
cd server && npm run init-db && cd ..

# Запуск (в разных терминалах)
npm run dev          # Фронтенд
cd server && npm run dev  # Бэкенд
```

## 🌐 Доступ к приложению

- **Фронтенд**: http://localhost:3000
- **Бэкенд API**: http://localhost:5001

## 📋 Основные команды

### Docker команды
```bash
npm run docker:start    # Запуск проекта
npm run docker:stop     # Остановка проекта
npm run docker:logs     # Просмотр логов
npm run docker:restart  # Перезапуск
npm run docker:status   # Статус контейнеров
npm run docker:clean    # Полная очистка
```

### Обычные команды
```bash
npm run dev             # Запуск фронтенда
npm run build           # Сборка фронтенда
cd server && npm run dev # Запуск бэкенда
```

## 🏗️ Архитектура

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **UI Components**: Radix UI + Lucide React
- **Deployment**: Docker + Docker Compose

## 📚 Документация

- [QUICK_START.md](QUICK_START.md) - Быстрый старт
- [DOCKER.md](DOCKER.md) - Подробная документация по Docker
- [src/guidelines/Guidelines.md](src/guidelines/Guidelines.md) - Руководство по разработке

## 🎨 Дизайн

Оригинальный дизайн доступен в [Figma](https://www.figma.com/design/W0rIuTB8FrKOy9xjDy49kM/%D0%A1%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0-%D0%9E-%D0%BD%D0%B0%D1%81-%D0%B4%D0%BB%D1%8F-InterView).
  