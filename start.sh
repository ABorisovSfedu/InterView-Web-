#!/bin/bash

# Скрипт для запуска InterView проекта через Docker

set -e

echo "🚀 Запуск InterView проекта через Docker..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose и попробуйте снова."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down

# Собираем и запускаем контейнеры
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose up --build -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Проверяем статус сервисов..."
docker-compose ps

echo ""
echo "✅ Проект успешно запущен!"
echo ""
echo "🌐 Доступные сервисы:"
echo "   • Фронтенд: http://localhost:3000"
echo "   • Бэкенд API: http://localhost:5001"
echo ""
echo "📋 Полезные команды:"
echo "   • Остановить: docker-compose down"
echo "   • Логи: docker-compose logs -f"
echo "   • Перезапустить: docker-compose restart"
echo "   • Статус: docker-compose ps"
echo ""
echo "🎉 Готово! Откройте http://localhost:3000 в браузере"
