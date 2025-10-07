@echo off
echo 🚀 Сборка TWA приложения ValutCalc...

echo 📱 Проверка зависимостей...

REM Проверяем Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ JDK не найден
    echo Установите JDK 11 или выше
    pause
    exit /b 1
)

echo ✅ JDK найден

REM Проверяем Android SDK
if not defined ANDROID_HOME (
    echo ❌ ANDROID_HOME не установлен
    echo Установите Android SDK и настройте переменную окружения
    pause
    exit /b 1
)

echo ✅ Android SDK найден

echo 🔨 Сборка проекта...

REM Синхронизация и сборка
call gradlew.bat build

if %errorlevel% equ 0 (
    echo ✅ Сборка завершена успешно!
    echo 📁 APK файлы в папке: app\build\outputs\apk\
    dir app\build\outputs\apk\ /b
) else (
    echo ❌ Ошибка при сборке
    pause
    exit /b 1
)

echo.
echo 🎉 Готово! APK файл готов для публикации в Google Play.
pause