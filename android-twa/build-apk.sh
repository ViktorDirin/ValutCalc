#!/bin/bash

echo "🚀 Начинаем сборку TWA приложения ValutCalc..."

# Проверяем наличие Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME не установлен"
    echo "Установите Android SDK и настройте переменную окружения ANDROID_HOME"
    exit 1
fi

# Проверяем наличие JDK
if ! command -v javac &> /dev/null; then
    echo "❌ JDK не найден"
    echo "Установите JDK 11 или выше"
    exit 1
fi

echo "📱 Сборка APK файла..."

# Сборка проекта
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo "✅ APK успешно создан!"
    echo "📁 Файл расположен в: android-twa/app/build/outputs/apk/release/"
    ls -la android-twa/app/build/outputs/apk/release/
else
    echo "❌ Ошибка при сборке APK"
    exit 1
fi