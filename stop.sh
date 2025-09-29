#!/bin/bash

# Скрипт для остановки InterView проекта

echo "🛑 Останавливаем InterView проект..."

# Останавливаем контейнеры
docker-compose down

echo "✅ Проект остановлен!"
echo ""
echo "📋 Для полной очистки выполните:"
echo "   • Удалить контейнеры: docker-compose down --rmi all"
echo "   • Удалить volumes: docker-compose down -v"
echo "   • Полная очистка: docker-compose down --rmi all -v"

