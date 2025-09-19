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
        this.availableCurrencies = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'AZN': 'Azerbaijani Manat',
            'RUB': 'Russian Ruble'
        };
        
        this.init();
    }

    async init() {
        console.log('ValutCalc initializing...');
        this.loadTheme();
        this.loadSelectedCurrencies();
        this.setupEventListeners();
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
    }

    async loadExchangeRates() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        
        try {
            // Пробуем загрузить из кэша
            const cachedRates = this.getCachedRates();
            if (cachedRates && this.isCacheValid(cachedRates.timestamp)) {
                this.exchangeRates = cachedRates.rates;
                loading.classList.add('hidden');
                return;
            }

            // Загружаем с API
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            this.exchangeRates = data.rates;

            // Сохраняем в кэш
            this.cacheRates(this.exchangeRates);
            
            loading.classList.add('hidden');
        } catch (err) {
            console.error('Error loading exchange rates:', err);
            
            // Пробуем использовать кэшированные данные
            const cachedRates = this.getCachedRates();
            if (cachedRates) {
                this.exchangeRates = cachedRates.rates;
                error.style.display = 'block';
                setTimeout(() => {
                    error.style.display = 'none';
                }, 5000);
            } else {
                // Fallback курсы (примерные)
                this.exchangeRates = {
                    USD: 1,
                    EUR: 0.85,
                    AZN: 1.7
                };
                error.style.display = 'block';
                error.textContent = 'Используются примерные курсы. Проверьте подключение к интернету.';
            }
            
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
            console.warn('Не удалось сохранить курсы в кэш:', err);
        }
    }

    isCacheValid(timestamp) {
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа
        return Date.now() - timestamp < CACHE_DURATION;
    }

    setActiveCurrency(currency) {
        this.activeCurrency = currency;
        
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
        // Если текущее значение "1" (по умолчанию), заменяем его на новую цифру
        if (this.currentValue === '1') {
            this.currentValue = digit;
        } else if (this.currentValue === '0') {
            this.currentValue = digit;
        } else {
            this.currentValue += digit;
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
        
        // Форматируем с 4 знаками после запятой
        return value.toFixed(4).replace(/\.?0+$/, '') || '0';
    }

    loadTheme() {
        // Загружаем сохраненную тему из localStorage
        const savedTheme = localStorage.getItem('valutcalc_theme');
        if (savedTheme === 'light') {
            this.isDarkTheme = false;
            document.body.classList.add('light-theme');
        } else {
            this.isDarkTheme = true;
            document.body.classList.remove('light-theme');
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        
        if (this.isDarkTheme) {
            document.body.classList.remove('light-theme');
            localStorage.setItem('valutcalc_theme', 'dark');
        } else {
            document.body.classList.add('light-theme');
            localStorage.setItem('valutcalc_theme', 'light');
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
                console.log('Ошибка проверки обновлений:', error);
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
                <span>Доступно обновление приложения</span>
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
        
        // Обновляем состояние кнопок
        this.updateSettingsButtons();
        
        // Устанавливаем текущую тему
        const currentTheme = this.isDarkTheme ? 'dark' : 'light';
        document.querySelector(`input[name="theme"][value="${currentTheme}"]`).checked = true;
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'none';
    }

    updateSettingsButtons() {
        const installBtn = document.getElementById('installBtn');
        const updateBtn = document.getElementById('updateBtnSettings');
        
        // Всегда показываем кнопку установки если приложение не установлено
        if (!this.isInstalled) {
            installBtn.style.display = 'flex';
            if (this.canInstall) {
                installBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Install App
                `;
            } else {
                installBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Install App (via browser menu)
                `;
            }
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
                console.log('PWA установлено');
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
                    <h4>Установка на iPhone/iPad:</h4>
                    <ol>
                        <li>Нажмите кнопку "Поделиться" в Safari</li>
                        <li>Выберите "На экран Домой"</li>
                        <li>Нажмите "Добавить"</li>
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
                <h3 style="margin: 0 0 16px 0; color: #ff6b35;">Инструкции по установке</h3>
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
                ">Понятно</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    changeTheme(theme) {
        if (theme === 'light') {
            this.isDarkTheme = false;
            document.body.classList.add('light-theme');
            localStorage.setItem('valutcalc_theme', 'light');
        } else {
            this.isDarkTheme = true;
            document.body.classList.remove('light-theme');
            localStorage.setItem('valutcalc_theme', 'dark');
        }
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
            Обновление...
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
                Ошибка
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
            console.log('PWA можно установить');
        });

        // Обработка события appinstalled
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.canInstall = false;
            this.deferredPrompt = null;
            console.log('PWA установлено');
        });

        // Проверяем, установлено ли приложение
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
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
        this.updateCurrencySettingsDisplay();
    }

    closeCurrencySettings() {
        const modal = document.getElementById('currencySettingsModal');
        modal.style.display = 'none';
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
        const currencyNames = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'AZN': 'Azerbaijani Manat',
            'RUB': 'Russian Ruble'
        };
        return currencyNames[code] || code;
    }

    removeCurrency(currencyCode) {
        if (this.selectedCurrencies.length <= 1) {
            alert('You must have at least one currency selected.');
            return;
        }

        this.selectedCurrencies = this.selectedCurrencies.filter(code => code !== currencyCode);
        this.saveSelectedCurrencies();
        this.updateCurrencySettingsDisplay();
        this.updateDisplay();
    }

    addCurrency(currencyCode) {
        if (this.selectedCurrencies.length >= 5) {
            alert('You can select maximum 5 currencies. Please remove one currency first.');
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
            } else {
                // Перетаскиваем вверх - позиция остается той же
                newTargetIndex = targetIndex;
            }
            
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
                console.log('SW зарегистрирован:', registration);
            })
            .catch(registrationError => {
                console.log('SW регистрация не удалась:', registrationError);
            });
    });
}
