# ValutCalc TWA - Android приложение

Это Trusted Web Activity (TWA) версия конвертера валют ValutCalc для публикации в Google Play Market.

## 📁 Структура проекта

```
android-twa/
├── app/                          # Основной модуль приложения
│   ├── src/main/
│   │   ├── AndroidManifest.xml   # Манифест приложения
│   │   ├── java/.../LauncherActivity.java  # Главная активность
│   │   └── res/                  # Ресурсы (иконки, строки, стили)
│   ├── build.gradle             # Конфигурация модуля
│   └── proguard-rules.pro       # Правила оптимизации
├── twa-manifest.json            # Конфигурация TWA
├── build.gradle                 # Корневой build файл
├── settings.gradle              # Настройки Gradle
├── build-apk.sh                 # Скрипт сборки
└── README.md                    # Этот файл
```

## 🚀 Быстрый запуск

### Требования

1. **Android Studio** (рекомендуется) или **Android SDK**
2. **JDK 11+**
3. **GitHub Pages** с вашим PWA (уже настроен)

### Сборка APK

#### Способ 1: Через Android Studio
1. Откройте папку `android-twa/` в Android Studio
2. Дождитесь синхронизации Gradle
3. Выберите Build → Generate Signed Bundle/APK
4. Выберите APK и следуйте инструкциям мастера

#### Способ 2: Через командную строку
```bash
cd android-twa
./gradlew assembleRelease
```

APK файл будет создан в: `app/build/outputs/apk/release/`

## ⚙️ Конфигурация

### Основные настройки в `twa-manifest.json`:

```json
{
  "packageId": "com.viksoft.valutcalc.twa",     // ID пакета
  "host": "viksoftdev.github.io",              // Домен PWA
  "name": "ValutCalc - Конвертер валют",        // Название приложения
  "themeColor": "#ff6b35",                     // Цвет темы
  "startUrl": "/ValutCalc/",                   // Стартовая страница
  "iconUrl": "https://viksoftdev.github.io/ValutCalc/icons/icon-512.png"
}
```

### Смена домена

Если нужно изменить домен PWA:

1. Обновите `twa-manifest.json`:
   - `"host"`: ваш домен (viktordirin.github.io)
   - `"webManifestUrl"`: ссылка на ваш manifest.json
   - Все ссылки на иконки и ресурсы

2. Обновите `app/src/main/res/values/strings.xml`:
   - Asset statements для нового домена

## 📱 Публикация в Google Play

### Шаг 1: Подготовка аккаунта
1. Создайте аккаунт разработчика: [Google Play Console](https://play.google.com/console)
2. Оплатите $25 (единоразово)

### Шаг 2: Подготовка APK
1. Создайте подписанный APK (release сборка)
2. Убедитесь что версия уникальна

### Шаг 3: Публикация
1. Создайте новое приложение в Play Console
2. Загрузите APK файл
3. Заполните информацию:
   - Название и описание
   - Скриншоты (минимум 2)
   - Иконки разных размеров
   - Возрастной рейтинг

### Шаг 4: Публикация
1. Отправьте на ревью
2. Дождитесь одобрения (обычно 1-3 дня)

## 🔧 Настройка цифровой подписи

Для публикации нужен подписанный APK:

1. **В Android Studio:**
   - Build → Generate Signed Bundle/APK
   - Создайте новый keystore или используйте существующий

2. **Через командную строку:**
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```

## 🌐 Смена домена PWA

Если у вас есть собственный домен:

1. Разместите файлы PWA на новом домене
2. Обновите ссылки в `twa-manifest.json`:
   ```json
   {
     "host": "viktordirin.github.io",
     "webManifestUrl": "https://viktordirin.github.io/ValutCalc/manifest.json",
     "iconUrl": "https://viktordirin.github.io/ValutCalc/icons/icon-512.png"
   }
   ```

3. Обновите asset statements в `strings.xml`

## 🛠️ Разработка

### Добавление функций
- Изменения в PWA автоматически применяются в TWA
- Обновляйте PWA на вашем домене
- Публикуйте обновления как новые версии в Play Store

### Локальное тестирование
```bash
# Сборка debug версии
./gradlew assembleDebug

# Установка на подключенное устройство
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 📋 Чек-лист для публикации

- [ ] Создан аккаунт Google Play Console
- [ ] Подготовлен подписанный APK
- [ ] Созданы скриншоты приложения
- [ ] Подготовлено описание приложения
- [ ] Выбрана категория приложения
- [ ] Указан возрастной рейтинг
- [ ] Настроены asset statements для домена

## 🆘 Устранение проблем

### Ошибка "App not installed"
- Проверьте цифровую подпись APK
- Убедитесь что версия уникальна

### TWA не запускается
- Проверьте настройки домена в `twa-manifest.json`
- Убедитесь что PWA доступен по HTTPS
- Проверьте asset statements

### Проблемы с Play Console
- Убедитесь что APK подписан
- Проверьте размер APK (< 100MB для обычной публикации)
- Убедитесь что манифест корректен

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте логи в Android Studio
2. Тестируйте на разных устройствах
3. Используйте Android Debug Bridge для диагностики

---

**Создано для проекта ValutCalc** | Версия 1.0.3