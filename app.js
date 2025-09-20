class ValutCalc {
    constructor() {
        this.exchangeRates = {};
        this.activeCurrency = 'USD';
        this.currentValue = '1';
        this.baseCurrency = 'USD';
        this.isDarkTheme = true; // По умолчанию темная тема
        this.updateAvailable = false;
        this.serviceWorkerRegistration = null;
        this.deferredPrompt = null;
        this.canInstall = false;
        this.isInstalled = false;
        this.selectedCurrencies = ['USD', 'EUR']; // По умолчанию USD и EUR
        this.hasUserInput = false; // Флаг для отслеживания начала ввода пользователем
        this.currentScreen = 'main'; // Текущий экран: 'main', 'settings', 'currency-settings'
        this.navigationStack = []; // Стек навигации
        this.availableCurrencies = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'AZN': 'Azerbaijani Manat',
            'RUB': 'Russian Ruble',
            'IDR': 'Indonesian Rupiah',
            'KRW': 'South Korean Won',
            'JPY': 'Japanese Yen',
            'CAD': 'Canadian Dollar',
            'BYN': 'Belarusian Ruble',
            'UAH': 'Ukrainian Hryvnia',
            'CNY': 'Chinese Yuan',
            'TRY': 'Turkish Lira',
            'KZT': 'Kazakhstani Tenge',
            'UZS': 'Uzbekistani Som',
            'VND': 'Vietnamese Dong'
        };
        
        this.init();
    }

    async init() {
        console.log('ValutCalc initializing...');
        this.loadTheme();
        this.loadSelectedCurrencies();
        this.setupEventListeners();
        this.setupBackButtonHandling();
        await this.loadExchangeRates();
        this.updateDisplay();
        this.checkForUpdates();
        this.setupPWAInstall();
        
        // Проверяем, что модальное окно настроек существует
        const settingsModal = document.getElementById('settingsModal');
        const settingsBtn = document.getElementById('settingsBtn');
        console.log('Settings modal on init:', settingsModal);
        console.log('Settings button on init:', settingsBtn);
        
        // Проверяем что кнопка настроек найдена
        if (settingsBtn) {
            console.log('Settings button found');
        } else {
            console.error('Settings button not found!');
        }
    }

    setupEventListeners() {
        // Клики по валютам
        document.querySelectorAll('.currency-row').forEach(row => {
            row.addEventListener('click', () => {
                this.setActiveCurrency(row.dataset.currency);
            });
            
            // Долгое нажатие для контекстного меню
            this.setupLongPress(row);
        });

        // Цифровая клавиатура
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                this.handleKeyPress(key.dataset.key);
            });
        });

        // Боковые кнопки
        document.querySelector('.clear-btn').addEventListener('click', () => {
            this.clearAll();
        });

        document.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteLastDigit();
        });

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });

        // Кнопка смены темы
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Кнопка настроек
        document.getElementById('settingsBtn').addEventListener('click', () => {
            console.log('Settings button clicked');
            this.openSettings();
        });

        // Закрытие настроек
        document.getElementById('settingsClose').addEventListener('click', () => {
            this.closeSettings();
        });

        // Кнопка установки
        document.getElementById('installBtn').addEventListener('click', () => {
            this.installApp();
        });

        // Кнопка обновления в настройках
        document.getElementById('updateBtnSettings').addEventListener('click', () => {
            this.updateApp();
        });

        // Кнопка обновления курсов валют
        document.getElementById('refreshRatesBtn').addEventListener('click', () => {
            this.refreshExchangeRates();
        });

        // Переключение темы в настройках
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        });

        // Кнопка настройки валют
        document.getElementById('currencySettingsBtn').addEventListener('click', () => {
            this.openCurrencySettings();
        });

        // Закрытие настроек валют
        document.getElementById('currencySettingsClose').addEventListener('click', () => {
            this.closeCurrencySettings();
        });

        // Контекстное меню для валют
        document.getElementById('copyValueBtn').addEventListener('click', () => {
            this.copyCurrencyValue();
        });

        document.getElementById('pasteValueBtn').addEventListener('click', () => {
            this.pasteCurrencyValue();
        });

        // Закрытие контекстного меню при клике вне его
        document.addEventListener('click', (e) => {
            const contextMenu = document.getElementById('currencyContextMenu');
            if (contextMenu && !contextMenu.contains(e.target) && !e.target.closest('.currency-row')) {
                this.hideContextMenu();
            }
        });
    }

    async loadExchangeRates() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        
        // Принудительно скрываем загрузку через 15 секунд
        const forceHideTimeout = setTimeout(() => {
            loading.classList.add('hidden');
            error.style.display = 'block';
            error.textContent = 'Loading timeout. Using fallback rates.';
            setTimeout(() => {
                error.style.display = 'none';
            }, 5000);
        }, 15000);
        
        try {
            // Пробуем загрузить из кэша
            const cachedRates = this.getCachedRates();
            if (cachedRates && this.isCacheValid(cachedRates.timestamp)) {
                this.exchangeRates = cachedRates.rates;
                clearTimeout(forceHideTimeout);
                loading.classList.add('hidden');
                return;
            }

            // Загружаем с API с таймаутом
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
            
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            this.exchangeRates = data.rates;

            // Сохраняем в кэш
            this.cacheRates(this.exchangeRates);
            
            clearTimeout(forceHideTimeout);
            loading.classList.add('hidden');
        } catch (err) {
            console.error('Error loading exchange rates:', err);
            
            // Пробуем использовать кэшированные данные
            const cachedRates = this.getCachedRates();
            if (cachedRates) {
                this.exchangeRates = cachedRates.rates;
                clearTimeout(forceHideTimeout);
                error.style.display = 'block';
                error.textContent = 'Using cached rates. Check your internet connection.';
                setTimeout(() => {
                    error.style.display = 'none';
                }, 5000);
            } else {
                // Fallback курсы (примерные)
                this.exchangeRates = {
                    USD: 1,
                    EUR: 0.85,
                    AZN: 1.7,
                    RUB: 95.0,
                    IDR: 15500,
                    KRW: 1300,
                    JPY: 150,
                    CAD: 1.35,
                    BYN: 3.2,
                    UAH: 37.0,
                    CNY: 7.2,
                    TRY: 30.0,
                    KZT: 450,
                    UZS: 12000,
                    VND: 24000
                };
                error.style.display = 'block';
                error.textContent = 'Using approximate rates. Check your internet connection.';
            }
            
            clearTimeout(forceHideTimeout);
            loading.classList.add('hidden');
        }
    }

    getCachedRates() {
        try {
            const cached = localStorage.getItem('valutcalc_rates');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }

    cacheRates(rates) {
        try {
            const data = {
                rates: rates,
                timestamp: Date.now()
            };
            localStorage.setItem('valutcalc_rates', JSON.stringify(data));
        } catch (err) {
            console.warn('Failed to save rates to cache:', err);
        }
    }

    isCacheValid(timestamp) {
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа
        return Date.now() - timestamp < CACHE_DURATION;
    }

    setActiveCurrency(currency) {
        this.activeCurrency = currency;
        this.currentValue = '1';
        this.hasUserInput = false; // Сбрасываем флаг при смене валюты
        
        // Обновляем активную строку
        document.querySelectorAll('.currency-row').forEach(row => {
            row.classList.remove('active');
        });
        document.querySelector(`[data-currency="${currency}"]`).classList.add('active');
        
        // Обновляем отображение
        this.updateDisplay();
    }

    handleKeyPress(key) {
        if (key === '.') {
            this.addDecimalPoint();
        } else if (key === '00') {
            this.addDoubleZero();
        } else {
            this.addDigit(key);
        }
    }

    handleKeyboardInput(e) {
        e.preventDefault();
        
        if (e.key >= '0' && e.key <= '9') {
            this.addDigit(e.key);
        } else if (e.key === '.' || e.key === ',') {
            this.addDecimalPoint();
        } else if (e.key === 'Backspace') {
            this.deleteLastDigit();
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            this.clearAll();
        } else if (e.key === 'Enter') {
            // Переключение между валютами
            this.switchToNextCurrency();
        }
    }

    addDigit(digit) {
        // Если пользователь еще не начинал вводить (поле содержит дефолтную "1")
        if (!this.hasUserInput && this.currentValue === '1') {
            this.currentValue = digit;
            this.hasUserInput = true;
        } else if (this.currentValue === '0') {
            this.currentValue = digit;
            this.hasUserInput = true;
        } else {
            this.currentValue += digit;
            this.hasUserInput = true;
        }
        this.updateDisplay();
    }

    addDecimalPoint() {
        if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
            this.updateDisplay();
        }
    }

    addDoubleZero() {
        // Если текущее значение "1" (по умолчанию), заменяем его на "100"
        if (this.currentValue === '1') {
            this.currentValue = '100';
        } else if (this.currentValue === '0') {
            this.currentValue = '0.00';
        } else {
            this.currentValue += '00';
        }
        this.updateDisplay();
    }

    deleteLastDigit() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            // При удалении последней цифры возвращаемся к значению по умолчанию "1"
            this.currentValue = '1';
        }
        this.updateDisplay();
    }

    clearAll() {
        this.currentValue = '1';
        this.hasUserInput = false; // Сбрасываем флаг при очистке
        this.updateDisplay();
    }

    switchToNextCurrency() {
        const currencies = ['USD', 'EUR', 'AZN'];
        const currentIndex = currencies.indexOf(this.activeCurrency);
        const nextIndex = (currentIndex + 1) % currencies.length;
        this.setActiveCurrency(currencies[nextIndex]);
    }

    updateDisplay() {
        const value = parseFloat(this.currentValue) || 0;
        
        // Обновляем отображение валют на основе выбранных
        this.updateCurrencyRows();
        
        // Обновляем все валюты
        document.querySelectorAll('.currency-row').forEach(row => {
            const currency = row.dataset.currency;
            const currencyValue = this.convertCurrency(value, this.activeCurrency, currency);
            const formattedValue = this.formatValue(currencyValue);
            row.querySelector('.currency-value').textContent = formattedValue;
        });
    }

    updateCurrencyRows() {
        const currencySection = document.querySelector('.currency-section');
        currencySection.innerHTML = '';

        this.selectedCurrencies.forEach(currencyCode => {
            const currencyName = this.getCurrencyName(currencyCode);
            const isActive = currencyCode === this.activeCurrency;
            
            const currencyRow = document.createElement('div');
            currencyRow.className = `currency-row ${isActive ? 'active' : ''}`;
            currencyRow.dataset.currency = currencyCode;
            currencyRow.innerHTML = `
                <div class="currency-info">
                    <div class="currency-name">${currencyName}</div>
                    <div class="currency-code">${currencyCode}</div>
                </div>
                <div class="currency-value">0</div>
            `;
            
            // Добавляем обработчик клика
            currencyRow.addEventListener('click', () => {
                this.setActiveCurrency(currencyCode);
            });
            
            // Добавляем долгое нажатие для контекстного меню
            this.setupLongPress(currencyRow);
            
            currencySection.appendChild(currencyRow);
        });
    }

    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        // Конвертируем в USD, затем в целевую валюту
        let usdAmount = amount;
        if (fromCurrency !== 'USD') {
            usdAmount = amount / this.exchangeRates[fromCurrency];
        }

        if (toCurrency === 'USD') {
            return usdAmount;
        }

        return usdAmount * this.exchangeRates[toCurrency];
    }

    formatValue(value) {
        if (value === 0) return '0';
        
        // Форматируем с 2 знаками после запятой и пробелами для тысяч
        const formatted = value.toFixed(2);
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return parts.join('.');
    }

    loadTheme() {
        // Загружаем сохраненную тему из localStorage
        const savedTheme = localStorage.getItem('valutcalc_theme') || 'dark';
        this.changeTheme(savedTheme);
        
        // Устанавливаем правильный radio button
        const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }
    }

    toggleTheme() {
        // Получаем текущую тему
        const currentTheme = localStorage.getItem('valutcalc_theme') || 'dark';
        
        // Умное переключение: темные темы → Light, Light → Dark
        if (currentTheme === 'light') {
            this.changeTheme('dark');
        } else {
            this.changeTheme('light');
        }
    }

    async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    this.serviceWorkerRegistration = registration;
                    
                    // Проверяем обновления
                    await registration.update();
                    
                    // Слушаем события обновления
                    registration.addEventListener('updatefound', () => {
                        this.showUpdateButton();
                    });
                }
            } catch (error) {
                console.log('Error checking for updates:', error);
            }
        }
    }

    showUpdateButton() {
        const updateBtn = document.getElementById('updateBtn');
        updateBtn.style.display = 'flex';
        this.updateAvailable = true;
        
        // Показываем уведомление
        this.showUpdateNotification();
    }

    showUpdateNotification() {
        // Создаем уведомление о доступном обновлении
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-notification-content">
                <span>App update available</span>
                <button class="update-notification-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Добавляем стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            right: 20px;
            background: rgba(255, 107, 53, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 107, 53, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    openSettings() {
        console.log('Opening settings modal');
        const modal = document.getElementById('settingsModal');
        console.log('Modal element:', modal);
        if (modal) {
            modal.style.display = 'flex';
            console.log('Modal display set to flex');
        } else {
            console.error('Settings modal not found!');
        }
        
        // Добавляем в стек навигации
        this.navigationStack.push(this.currentScreen);
        this.currentScreen = 'settings';
        
        // Обновляем состояние кнопок
        this.updateSettingsButtons();
        
        // Обновляем информацию о последнем обновлении курсов
        this.updateLastUpdateTime();
        
        // Устанавливаем текущую тему
        const currentTheme = this.isDarkTheme ? 'dark' : 'light';
        document.querySelector(`input[name="theme"][value="${currentTheme}"]`).checked = true;
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'none';
        
        // Возвращаемся к предыдущему экрану
        if (this.navigationStack.length > 0) {
            this.currentScreen = this.navigationStack.pop();
        } else {
            this.currentScreen = 'main';
        }
    }

    updateSettingsButtons() {
        const installBtn = document.getElementById('installBtn');
        const updateBtn = document.getElementById('updateBtnSettings');
        
        // Показываем кнопку установки если приложение не установлено И можно установить
        if (!this.isInstalled && (this.canInstall || this.deferredPrompt)) {
            installBtn.style.display = 'flex';
            installBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Install App
            `;
        } else if (!this.isInstalled) {
            // Если нельзя установить автоматически, показываем кнопку с инструкциями
            installBtn.style.display = 'flex';
            installBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Install App
            `;
        } else {
            installBtn.style.display = 'none';
        }
        
        // Всегда показываем кнопку обновления
        updateBtn.style.display = 'flex';
        if (this.updateAvailable) {
            updateBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                    <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
                </svg>
                Update App
            `;
        } else {
            updateBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                    <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
                </svg>
                Check for updates
            `;
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA installed');
                this.isInstalled = true;
                this.updateSettingsButtons();
            }
            
            this.deferredPrompt = null;
        } else {
            // Показываем инструкции для ручной установки
            this.showInstallInstructions();
        }
    }

    showInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <div style="text-align: left; line-height: 1.6;">
                    <h4>Installation on iPhone/iPad:</h4>
                    <ol>
                        <li>Tap the "Share" button in Safari</li>
                        <li>Select "Add to Home Screen"</li>
                        <li>Tap "Add"</li>
                    </ol>
                </div>
            `;
        } else if (isAndroid) {
            instructions = `
                <div style="text-align: left; line-height: 1.6;">
                    <h4>Installation on Android:</h4>
                    <ol>
                        <li>Tap browser menu (three dots)</li>
                        <li>Select "Install App" or "Add to Home Screen"</li>
                        <li>Confirm installation</li>
                    </ol>
                </div>
            `;
        } else {
            instructions = `
                <div style="text-align: left; line-height: 1.6;">
                    <h4>Installation on Computer:</h4>
                    <ol>
                        <li>Tap the install icon in the address bar</li>
                        <li>Or use browser menu → "Install App"</li>
                    </ol>
                </div>
            `;
        }
        
        // Создаем модальное окно с инструкциями
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1a1a1a;
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 100%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #ffffff;
            ">
                <h3 style="margin: 0 0 16px 0; color: #ff6b35;">Installation Instructions</h3>
                ${instructions}
                <button onclick="this.parentElement.parentElement.remove()" style="
                    width: 100%;
                    padding: 12px;
                    margin-top: 20px;
                    background: #ff6b35;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                ">Got it</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    changeTheme(theme) {
        // Удаляем все классы тем
        document.body.classList.remove('light-theme', 'green-theme', 'blue-theme', 'purple-theme', 'red-theme');
        
        // Устанавливаем новую тему
        if (theme === 'light') {
            this.isDarkTheme = false;
            document.body.classList.add('light-theme');
        } else if (theme === 'green') {
            this.isDarkTheme = true;
            document.body.classList.add('green-theme');
        } else if (theme === 'blue') {
            this.isDarkTheme = true;
            document.body.classList.add('blue-theme');
        } else if (theme === 'purple') {
            this.isDarkTheme = true;
            document.body.classList.add('purple-theme');
        } else if (theme === 'red') {
            this.isDarkTheme = true;
            document.body.classList.add('red-theme');
        } else {
            // По умолчанию темная тема
            this.isDarkTheme = true;
        }
        
        localStorage.setItem('valutcalc_theme', theme);
    }

    async updateApp() {
        if (!this.updateAvailable || !this.serviceWorkerRegistration) {
            return;
        }

        const updateBtn = document.getElementById('updateBtnSettings');
        
        // Показываем состояние загрузки
        updateBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="updating">
                <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
            </svg>
            Updating...
        `;
        updateBtn.disabled = true;

        try {
            // Принудительно обновляем Service Worker
            await this.serviceWorkerRegistration.update();
            
            // Если есть ожидающий Service Worker, активируем его
            if (this.serviceWorkerRegistration.waiting) {
                this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Перезагружаем страницу для применения обновления
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка обновления:', error);
            updateBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                    <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
                </svg>
                Error
            `;
            setTimeout(() => {
                updateBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                        <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Update App
                `;
                updateBtn.disabled = false;
            }, 2000);
        }
    }

    setupPWAInstall() {
        // Обработка события beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.canInstall = true;
            console.log('PWA can be installed');
        });

        // Обработка события appinstalled
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.canInstall = false;
            this.deferredPrompt = null;
            console.log('PWA installed');
        });

        // Проверяем, установлено ли приложение
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }

        // Дополнительная проверка для Android - если событие beforeinstallprompt не сработало
        setTimeout(() => {
            if (!this.isInstalled && !this.canInstall) {
                // Проверяем, поддерживает ли браузер PWA
                const isAndroid = /Android/.test(navigator.userAgent);
                const isChrome = /Chrome/.test(navigator.userAgent);
                
                if (isAndroid && isChrome) {
                    // На Android Chrome всегда можно установить PWA вручную
                    this.canInstall = true;
                    console.log('Android Chrome detected - manual install available');
                }
            }
        }, 2000);
    }

    // Методы для управления валютами
    loadSelectedCurrencies() {
        const saved = localStorage.getItem('valutcalc_selected_currencies');
        if (saved) {
            this.selectedCurrencies = JSON.parse(saved);
        }
    }

    saveSelectedCurrencies() {
        localStorage.setItem('valutcalc_selected_currencies', JSON.stringify(this.selectedCurrencies));
    }

    openCurrencySettings() {
        const modal = document.getElementById('currencySettingsModal');
        modal.style.display = 'flex';
        
        // Добавляем в стек навигации
        this.navigationStack.push(this.currentScreen);
        this.currentScreen = 'currency-settings';
        
        this.updateCurrencySettingsDisplay();
    }

    closeCurrencySettings() {
        const modal = document.getElementById('currencySettingsModal');
        modal.style.display = 'none';
        
        // Возвращаемся к предыдущему экрану
        if (this.navigationStack.length > 0) {
            this.currentScreen = this.navigationStack.pop();
        } else {
            this.currentScreen = 'main';
        }
    }

    updateCurrencySettingsDisplay() {
        this.updateCurrentCurrenciesList();
        this.updateAvailableCurrenciesList();
    }

    updateCurrentCurrenciesList() {
        const container = document.getElementById('currentCurrenciesList');
        container.innerHTML = '';

        this.selectedCurrencies.forEach((currencyCode, index) => {
            const currencyName = this.getCurrencyName(currencyCode);
            const currencyItem = document.createElement('div');
            currencyItem.className = 'currency-item draggable-item';
            currencyItem.draggable = true;
            currencyItem.dataset.currency = currencyCode;
            currencyItem.dataset.index = index;
            currencyItem.innerHTML = `
                <div class="currency-item-info">
                    <span class="drag-handle">⋮⋮</span>
                    <span class="currency-item-name">${currencyName}</span>
                    <span class="currency-item-code">${currencyCode}</span>
                </div>
                <div class="currency-item-actions">
                    <button class="remove-currency-btn" data-currency="${currencyCode}">×</button>
                </div>
            `;
            
            // Добавляем обработчики drag & drop
            this.addDragListeners(currencyItem);
            
            // Добавляем обработчик для кнопки удаления
            const removeBtn = currencyItem.querySelector('.remove-currency-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем срабатывание drag & drop
                e.preventDefault();
                this.removeCurrency(currencyCode);
            });
            
            container.appendChild(currencyItem);
        });
    }

    updateAvailableCurrenciesList() {
        const container = document.getElementById('availableCurrenciesList');
        container.innerHTML = '';

        Object.entries(this.availableCurrencies).forEach(([code, name]) => {
            const isSelected = this.selectedCurrencies.includes(code);
            if (!isSelected) { // Показываем только не выбранные валюты
                const currencyItem = document.createElement('div');
                currencyItem.className = 'currency-item';
                currencyItem.innerHTML = `
                    <div class="currency-item-info">
                        <span class="currency-item-name">${name}</span>
                        <span class="currency-item-code">${code}</span>
                    </div>
                    <div class="currency-item-actions">
                        <button class="add-currency-btn" data-currency="${code}">Add</button>
                    </div>
                `;
                
                // Добавляем обработчик для кнопки добавления
                const addBtn = currencyItem.querySelector('.add-currency-btn');
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Предотвращаем срабатывание drag & drop
                    e.preventDefault();
                    this.addCurrency(code);
                });
                
                container.appendChild(currencyItem);
            }
        });
    }

    getCurrencyName(code) {
        return this.availableCurrencies[code] || code;
    }

    removeCurrency(currencyCode) {
        if (this.selectedCurrencies.length <= 1) {
            this.showCustomAlert('You must have at least one currency selected.');
            return;
        }

        this.selectedCurrencies = this.selectedCurrencies.filter(code => code !== currencyCode);
        this.saveSelectedCurrencies();
        this.updateCurrencySettingsDisplay();
        this.updateDisplay();
    }

    addCurrency(currencyCode) {
        if (this.selectedCurrencies.length >= 5) {
            this.showCustomAlert('You can select maximum 5 currencies. Please remove one currency first.');
            return;
        }

        this.selectedCurrencies.push(currencyCode);
        this.saveSelectedCurrencies();
        this.updateCurrencySettingsDisplay();
        this.updateDisplay();
    }

    // Методы для drag & drop (desktop) и touch (mobile)
    addDragListeners(item) {
        const dragHandle = item.querySelector('.drag-handle');
        
        if (!dragHandle) return;

        let draggedElement = null;
        let touchStartY = 0;
        let touchCurrentY = 0;
        let isDragging = false;

        // Desktop drag & drop - только на drag handle
        if (dragHandle) {
            dragHandle.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
                item.classList.add('dragging');
            });
        }

        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        item.addEventListener('dragenter', (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', (e) => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            
            const draggedCurrency = e.dataTransfer.getData('text/html');
            const draggedElement = document.createElement('div');
            draggedElement.innerHTML = draggedCurrency;
            const draggedCurrencyCode = draggedElement.querySelector('.draggable-item').dataset.currency;
            
            if (draggedCurrencyCode !== item.dataset.currency) {
                this.reorderCurrencies(draggedCurrencyCode, item.dataset.currency);
            }
        });

        // Mobile touch events - только на drag handle
        if (dragHandle) {
            dragHandle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                draggedElement = item;
                touchStartY = e.touches[0].clientY;
                touchCurrentY = touchStartY;
                isDragging = false;
                item.classList.add('touch-dragging');
            }, { passive: false });

            dragHandle.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (!draggedElement) return;
                
                touchCurrentY = e.touches[0].clientY;
                const deltaY = Math.abs(touchCurrentY - touchStartY);
                
                if (deltaY > 10) {
                    isDragging = true;
                    item.classList.add('dragging');
                    
                    // Показываем визуальную обратную связь
                    const allItems = document.querySelectorAll('.draggable-item');
                    allItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const rect = otherItem.getBoundingClientRect();
                            const itemCenterY = rect.top + rect.height / 2;
                            
                            if (Math.abs(touchCurrentY - itemCenterY) < rect.height / 2) {
                                otherItem.classList.add('drag-over');
                            } else {
                                otherItem.classList.remove('drag-over');
                            }
                        }
                    });
                }
            }, { passive: false });

            dragHandle.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (!draggedElement || !isDragging) {
                    item.classList.remove('touch-dragging');
                    return;
                }

                // Находим элемент под курсором
                const allItems = document.querySelectorAll('.draggable-item');
                let targetItem = null;
                let minDistance = Infinity;

                allItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const rect = otherItem.getBoundingClientRect();
                        const itemCenterY = rect.top + rect.height / 2;
                        const distance = Math.abs(touchCurrentY - itemCenterY);
                        
                        if (distance < minDistance && distance < rect.height) {
                            minDistance = distance;
                            targetItem = otherItem;
                        }
                    }
                });

                // Убираем все классы
                allItems.forEach(otherItem => {
                    otherItem.classList.remove('drag-over', 'dragging', 'touch-dragging');
                });

                // Выполняем переупорядочивание
                if (targetItem && targetItem.dataset.currency !== item.dataset.currency) {
                    this.reorderCurrencies(item.dataset.currency, targetItem.dataset.currency);
                }

                draggedElement = null;
                isDragging = false;
            }, { passive: false });
        }
    }

    reorderCurrencies(draggedCurrency, targetCurrency) {
        const draggedIndex = this.selectedCurrencies.indexOf(draggedCurrency);
        const targetIndex = this.selectedCurrencies.indexOf(targetCurrency);
        
        if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
            // Создаем новый массив
            const newCurrencies = [...this.selectedCurrencies];
            
            // Удаляем перетаскиваемую валюту
            newCurrencies.splice(draggedIndex, 1);
            
            // Вычисляем новую позицию
            let newTargetIndex = targetIndex;
            if (draggedIndex < targetIndex) {
                // Перетаскиваем вниз - позиция уменьшается на 1
                newTargetIndex = targetIndex - 1;
            }
            // Если перетаскиваем вверх - позиция остается той же
            
            // Вставляем валюту на новую позицию
            newCurrencies.splice(newTargetIndex, 0, draggedCurrency);
            
            // Обновляем массив
            this.selectedCurrencies = newCurrencies;
            
            // Сохраняем новый порядок
            this.saveSelectedCurrencies();
            this.updateCurrencySettingsDisplay();
            this.updateDisplay();
        }
    }

    showCustomAlert(message) {
        // Создаем модальное окно с предупреждением
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1a1a1a;
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 100%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #ffffff;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 107, 53, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                ">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style="color: #ff6b35;">
                        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 style="margin: 0 0 16px 0; color: #ff6b35; font-size: 18px; font-weight: 600;">Warning</h3>
                <p style="margin: 0 0 24px 0; line-height: 1.5; color: #cccccc;">${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    width: 100%;
                    padding: 12px;
                    background: #ff6b35;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='#e55a2b'" onmouseout="this.style.background='#ff6b35'">OK</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Автоматически закрываем через 5 секунд
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }

    setupBackButtonHandling() {
        // Обработка кнопки "Назад" на Android
        window.addEventListener('popstate', (event) => {
            event.preventDefault();
            this.handleBackButton();
        });

        // Дополнительная обработка для Android
        document.addEventListener('backbutton', (event) => {
            event.preventDefault();
            this.handleBackButton();
        }, false);

        // Обработка клавиши Escape для тестирования на десктопе
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.handleBackButton();
            }
        });

        // Дополнительная обработка для мобильных устройств
        // Обработка свайпа назад (edge swipe)
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Проверяем, является ли это свайпом назад (слева направо)
            if (deltaX > 100 && Math.abs(deltaY) < 100) {
                // Свайп назад - обрабатываем как кнопку "Назад"
                this.handleBackButton();
            }
        }, { passive: true });
    }

    handleBackButton() {
        console.log('Back button pressed, current screen:', this.currentScreen);
        
        switch (this.currentScreen) {
            case 'currency-settings':
                // Из настроек валют возвращаемся в настройки
                this.closeCurrencySettings();
                break;
                
            case 'settings':
                // Из настроек возвращаемся на главный экран
                this.closeSettings();
                break;
                
            case 'main':
            default:
                // На главном экране - всегда показываем диалог подтверждения выхода
                this.showExitConfirmation();
                break;
        }
    }

    showExitConfirmation() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1a1a1a;
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 100%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #ffffff;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 107, 53, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                ">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style="color: #ff6b35;">
                        <path d="M9 9l6 6m0-6l-6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 style="margin: 0 0 16px 0; color: #ff6b35; font-size: 18px; font-weight: 600;">Exit App</h3>
                <p style="margin: 0 0 24px 0; line-height: 1.5; color: #cccccc;">Are you sure you want to exit the application?</p>
                <div style="display: flex; gap: 12px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        flex: 1;
                        padding: 12px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 16px;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">Cancel</button>
                    <button onclick="window.close()" style="
                        flex: 1;
                        padding: 12px;
                        background: #ff6b35;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 16px;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='#e55a2b'" onmouseout="this.style.background='#ff6b35'">Exit</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async refreshExchangeRates() {
        const refreshBtn = document.getElementById('refreshRatesBtn');
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        
        // Показываем состояние загрузки
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="rotating">
                <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Refreshing...</span>
        `;
        lastUpdateTime.textContent = 'Updating...';

        try {
            // Загружаем новые курсы
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            this.exchangeRates = data.rates;

            // Сохраняем в кэш с новым временем
            this.cacheRates(this.exchangeRates);
            
            // Обновляем отображение
            this.updateDisplay();
            
            // Обновляем время последнего обновления
            this.updateLastUpdateTime();
            
            // Показываем успешное обновление
            refreshBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Updated!</span>
            `;
            
            // Возвращаем к исходному состоянию через 2 секунды
            setTimeout(() => {
                refreshBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                        <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Refresh Exchange Rates</span>
                `;
                refreshBtn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Error refreshing exchange rates:', error);
            
            // Показываем ошибку
            refreshBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Error</span>
            `;
            lastUpdateTime.textContent = 'Update failed';
            
            // Возвращаем к исходному состоянию через 3 секунды
            setTimeout(() => {
                refreshBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/>
                        <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Refresh Exchange Rates</span>
                `;
                refreshBtn.disabled = false;
                this.updateLastUpdateTime();
            }, 3000);
        }
    }

    updateLastUpdateTime() {
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        if (!lastUpdateTime) return;

        try {
            const cachedRates = this.getCachedRates();
            if (cachedRates && cachedRates.timestamp) {
                const updateDate = new Date(cachedRates.timestamp);
                const now = new Date();
                const diffMs = now - updateDate;
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                let timeString;
                if (diffMinutes < 1) {
                    timeString = 'Just now';
                } else if (diffMinutes < 60) {
                    timeString = `${diffMinutes}m ago`;
                } else if (diffHours < 24) {
                    timeString = `${diffHours}h ago`;
                } else {
                    timeString = `${diffDays}d ago`;
                }

                lastUpdateTime.textContent = timeString;
            } else {
                lastUpdateTime.textContent = 'Never updated';
            }
        } catch (error) {
            console.error('Error updating last update time:', error);
            lastUpdateTime.textContent = 'Unknown';
        }
    }

    // Методы для долгого нажатия и контекстного меню
    setupLongPress(element) {
        let longPressTimer = null;
        let isLongPress = false;
        let startX = 0;
        let startY = 0;

        // Touch события для мобильных устройств
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isLongPress = false;
            
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                this.showContextMenu(e, element);
            }, 500); // 500ms для долгого нажатия
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (longPressTimer) {
                const deltaX = Math.abs(e.touches[0].clientX - startX);
                const deltaY = Math.abs(e.touches[0].clientY - startY);
                
                // Если палец сдвинулся больше чем на 10px, отменяем долгое нажатие
                if (deltaX > 10 || deltaY > 10) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            // Если это было долгое нажатие, предотвращаем обычный клик
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Mouse события для десктопа (правый клик)
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, element);
        });

        // Долгое нажатие мышью (для тестирования на десктопе)
        element.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Левая кнопка мыши
                startX = e.clientX;
                startY = e.clientY;
                isLongPress = false;
                
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    this.showContextMenu(e, element);
                }, 500);
            }
        });

        element.addEventListener('mousemove', (e) => {
            if (longPressTimer) {
                const deltaX = Math.abs(e.clientX - startX);
                const deltaY = Math.abs(e.clientY - startY);
                
                if (deltaX > 10 || deltaY > 10) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        });

        element.addEventListener('mouseup', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });

        element.addEventListener('mouseleave', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
    }

    showContextMenu(event, currencyElement) {
        const contextMenu = document.getElementById('currencyContextMenu');
        const currencyCode = currencyElement.dataset.currency;
        
        // Сохраняем ссылку на текущую валюту
        this.contextMenuCurrency = currencyCode;
        
        // Показываем визуальную обратную связь
        currencyElement.classList.add('long-press-active');
        
        // Позиционируем меню
        let x, y;
        if (event.touches && event.touches[0]) {
            // Touch событие
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        } else {
            // Mouse событие
            x = event.clientX;
            y = event.clientY;
        }
        
        // Учитываем границы экрана
        const menuWidth = 160;
        const menuHeight = 80;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        if (x + menuWidth > screenWidth) {
            x = screenWidth - menuWidth - 10;
        }
        if (y + menuHeight > screenHeight) {
            y = screenHeight - menuHeight - 10;
        }
        
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('show');
        
        // Убираем визуальную обратную связь через короткое время
        setTimeout(() => {
            currencyElement.classList.remove('long-press-active');
        }, 200);
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('currencyContextMenu');
        contextMenu.classList.remove('show');
        this.contextMenuCurrency = null;
    }

    async copyCurrencyValue() {
        if (!this.contextMenuCurrency) return;
        
        const value = parseFloat(this.currentValue) || 0;
        const convertedValue = this.convertCurrency(value, this.activeCurrency, this.contextMenuCurrency);
        const formattedValue = this.formatValue(convertedValue);
        
        try {
            await navigator.clipboard.writeText(formattedValue);
            this.showCopySuccess();
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = formattedValue;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopySuccess();
        }
        
        this.hideContextMenu();
    }

    async pasteCurrencyValue() {
        if (!this.contextMenuCurrency) return;
        
        try {
            const clipboardText = await navigator.clipboard.readText();
            this.handlePastedValue(clipboardText);
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('paste');
                this.handlePastedValue(textArea.value);
            } catch (pasteErr) {
                this.showPasteError('Failed to get data from clipboard');
            }
            
            document.body.removeChild(textArea);
        }
        
        this.hideContextMenu();
    }

    handlePastedValue(value) {
        // Очищаем значение от лишних символов
        const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
        
        // Проверяем, что это число
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue) || numValue < 0) {
            this.showPasteError('Pasted value is not a valid number');
            return;
        }
        
        // Устанавливаем новое значение
        this.currentValue = cleanValue;
        this.hasUserInput = true;
        this.updateDisplay();
        
        this.showPasteSuccess();
    }

    showCopySuccess() {
        this.showToast('Value copied to clipboard', 'success');
    }

    showPasteSuccess() {
        this.showToast('Value pasted successfully', 'success');
    }

    showPasteError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Стили для toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 2000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: toastSlideIn 0.3s ease;
        `;
        
        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastSlideIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        // Автоматически убираем через 3 секунды
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
                if (style.parentElement) {
                    style.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ValutCalc();
});

// Service Worker регистрация
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed:', registrationError);
            });
    });
}
