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
        this.currentLanguage = 'en'; // Текущий язык: 'en' или 'ru'
        this.currencySearchQuery = ''; // Поисковый запрос для валют
        this.isExiting = false; // Флаг выхода из приложения
        this.ignoreNextPopstate = false; // Флаг игнорирования следующего popstate (для программного закрытия)

        // Система переводов
        this.translations = {
            en: {
                // Main interface
                'settings': 'Settings',
                'language': 'Language',
                'selectLanguage': 'Select Language',
                'application': 'Application',
                'refreshRates': 'Refresh Exchange Rates',
                'lastUpdated': 'Last updated:',
                'theme': 'Theme',
                'dark': 'Dark',
                'light': 'Light',
                'green': 'Green',
                'blue': 'Blue',
                'purple': 'Purple',
                'red': 'Red',
                'about': 'About',
                'version': 'ValutCalc v1.0.5',
                'welcomeTip': 'Tip: Tap any currency to start converting',
                'description': 'Currency converter with PWA support',
                'installApp': 'Install App',
                'updateApp': 'Update App',
                'checkUpdates': 'Check for updates',
                'currencySettings': 'Currency Settings',
                'currentCurrencies': 'Current Currencies',
                'availableCurrencies': 'Available Currencies',
                'addCurrency': 'Add',
                'removeCurrency': 'Remove Currency',
                'supportDeveloper': 'Support Developer',
                'donateDescription': 'Thank you for using ValutCalc! If you find this app useful, consider supporting its development. Every contribution helps improve the app and add new features.',
                'koFi': 'Ko-fi',
                'paypal': 'PayPal',
                'bitcoin': 'Bitcoin',
                'bitcoinCopied': 'Bitcoin address copied to clipboard!',
                'buyMeCoffee': 'Buy me a coffee',
                'sendMoney': 'Send money',
                'cryptoDonation': 'Crypto donation',
                'searchCurrencies': 'Search currencies...',
                'searchResults': 'results found',
                'onlyNumbers': 'Only numbers can be pasted',
                'noCurrencySelected': 'No currency selected for pasting',
                'updateError': 'Update error:',
                'loading': 'Loading...',
                'error': 'Error',
                'success': 'Success',
                'cancel': 'Cancel',
                'ok': 'OK',
                'close': 'Close',
                'thankYou': 'Thank you for your support!',
                'exitConfirm': 'Exit ValutCalc?',
                'yes': 'Yes',
                'no': 'No'
            },
            ru: {
                // Main interface
                'settings': 'Настройки',
                'language': 'Язык',
                'selectLanguage': 'Выберите язык',
                'application': 'Приложение',
                'refreshRates': 'Обновить курсы валют',
                'lastUpdated': 'Последнее обновление:',
                'theme': 'Тема',
                'dark': 'Тёмная',
                'light': 'Светлая',
                'green': 'Зелёная',
                'blue': 'Синяя',
                'purple': 'Фиолетовая',
                'red': 'Красная',
                'about': 'О программе',
                'version': 'ValutCalc v1.0.5',
                'welcomeTip': 'Совет: Нажмите на валюту для пересчета',
                'description': 'Конвертер валют с поддержкой PWA',
                'installApp': 'Установить приложение',
                'updateApp': 'Обновить приложение',
                'checkUpdates': 'Проверить обновления',
                'currencySettings': 'Настройки валют',
                'currentCurrencies': 'Текущие валюты',
                'availableCurrencies': 'Доступные валюты',
                'addCurrency': 'Добавить',
                'removeCurrency': 'Удалить валюту',
                'supportDeveloper': 'Поддержать разработчика',
                'donateDescription': 'Спасибо за использование ValutCalc! Если приложение вам полезно, рассмотрите возможность поддержки его разработки. Каждый вклад помогает улучшить приложение и добавить новые функции.',
                'koFi': 'Ko-fi',
                'paypal': 'PayPal',
                'bitcoin': 'Bitcoin',
                'bitcoinCopied': 'Bitcoin адрес скопирован в буфер обмена!',
                'buyMeCoffee': 'Купи мне кофе',
                'sendMoney': 'Отправить деньги',
                'cryptoDonation': 'Криптодонат',
                'searchCurrencies': 'Поиск валют...',
                'searchResults': 'найдено результатов',
                'onlyNumbers': 'Можно вставить только число',
                'noCurrencySelected': 'Не выбрана валюта для вставки',
                'updateError': 'Ошибка обновления:',
                'loading': 'Загрузка...',
                'error': 'Ошибка',
                'success': 'Успешно',
                'cancel': 'Отмена',
                'ok': 'ОК',
                'close': 'Закрыть',
                'thankYou': '🙏 Спасибо за поддержку!',
                'exitConfirm': 'Выйти из приложения?',
                'yes': 'Да',
                'no': 'Нет'
            }
        };
        this.availableCurrencies = {
            // Major currencies
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound Sterling',
            'JPY': 'Japanese Yen',
            'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar',
            'CHF': 'Swiss Franc',
            'CNY': 'Chinese Yuan',
            'SEK': 'Swedish Krona',
            'NZD': 'New Zealand Dollar',
            'NOK': 'Norwegian Krone',
            'KRW': 'South Korean Won',
            'SGD': 'Singapore Dollar',
            'HKD': 'Hong Kong Dollar',
            'DKK': 'Danish Krone',
            'PLN': 'Polish Zloty',
            'CZK': 'Czech Koruna',
            'HUF': 'Hungarian Forint',

            // Asian currencies
            'INR': 'Indian Rupee',
            'THB': 'Thai Baht',
            'MYR': 'Malaysian Ringgit',
            'IDR': 'Indonesian Rupiah',
            'PHP': 'Philippine Peso',
            'VND': 'Vietnamese Dong',
            'TWD': 'New Taiwan Dollar',
            'PKR': 'Pakistani Rupee',
            'LKR': 'Sri Lankan Rupee',
            'BDT': 'Bangladeshi Taka',
            'NPR': 'Nepalese Rupee',
            'MMK': 'Myanmar Kyat',
            'KHR': 'Cambodian Riel',
            'LAK': 'Lao Kip',
            'MOP': 'Macanese Pataca',
            'BND': 'Brunei Dollar',

            // Middle East & Africa
            'AED': 'UAE Dirham',
            'SAR': 'Saudi Riyal',
            'QAR': 'Qatari Riyal',
            'KWD': 'Kuwaiti Dinar',
            'BHD': 'Bahraini Dinar',
            'OMR': 'Omani Rial',
            'JOD': 'Jordanian Dinar',
            'LBP': 'Lebanese Pound',
            'EGP': 'Egyptian Pound',
            'TRY': 'Turkish Lira',
            'ILS': 'Israeli Shekel',
            'IRR': 'Iranian Rial',
            'AFN': 'Afghan Afghani',
            'IQD': 'Iraqi Dinar',
            'SYP': 'Syrian Pound',
            'YER': 'Yemeni Rial',

            // African currencies
            'ZAR': 'South African Rand',
            'MAD': 'Moroccan Dirham',
            'TND': 'Tunisian Dinar',
            'DZD': 'Algerian Dinar',
            'LYD': 'Libyan Dinar',
            'EGP': 'Egyptian Pound',
            'ETB': 'Ethiopian Birr',
            'KES': 'Kenyan Shilling',
            'TZS': 'Tanzanian Shilling',
            'UGX': 'Ugandan Shilling',
            'RWF': 'Rwandan Franc',
            'BIF': 'Burundian Franc',
            'DJF': 'Djiboutian Franc',
            'SOS': 'Somali Shilling',
            'XOF': 'West African CFA Franc',
            'XAF': 'Central African CFA Franc',
            'GHS': 'Ghanaian Cedi',
            'NGN': 'Nigerian Naira',
            'XOF': 'West African CFA Franc',
            'GMD': 'Gambian Dalasi',
            'GNF': 'Guinean Franc',
            'LRD': 'Liberian Dollar',
            'SLL': 'Sierra Leonean Leone',
            'CVE': 'Cape Verdean Escudo',
            'STN': 'São Tomé and Príncipe Dobra',
            'MRU': 'Mauritanian Ouguiya',
            'SHP': 'Saint Helena Pound',
            'FKP': 'Falkland Islands Pound',

            // Europe
            'RON': 'Romanian Leu',
            'BGN': 'Bulgarian Lev',
            'HRK': 'Croatian Kuna',
            'RSD': 'Serbian Dinar',
            'BAM': 'Bosnia-Herzegovina Convertible Mark',
            'MKD': 'Macedonian Denar',
            'ALL': 'Albanian Lek',
            'MDL': 'Moldovan Leu',
            'UAH': 'Ukrainian Hryvnia',
            'BYN': 'Belarusian Ruble',
            'RUB': 'Russian Ruble',
            'GEL': 'Georgian Lari',
            'AMD': 'Armenian Dram',
            'AZN': 'Azerbaijani Manat',
            'KZT': 'Kazakhstani Tenge',
            'KGS': 'Kyrgyzstani Som',
            'UZS': 'Uzbekistani Som',
            'TJS': 'Tajikistani Somoni',
            'TMT': 'Turkmenistani Manat',

            // Americas
            'BRL': 'Brazilian Real',
            'ARS': 'Argentine Peso',
            'CLP': 'Chilean Peso',
            'COP': 'Colombian Peso',
            'PEN': 'Peruvian Sol',
            'UYU': 'Uruguayan Peso',
            'PYG': 'Paraguayan Guarani',
            'BOB': 'Bolivian Boliviano',
            'VES': 'Venezuelan Bolívar',
            'GYD': 'Guyanese Dollar',
            'SRD': 'Surinamese Dollar',
            'MXN': 'Mexican Peso',
            'GTQ': 'Guatemalan Quetzal',
            'BZD': 'Belize Dollar',
            'SVC': 'Salvadoran Colón',
            'HNL': 'Honduran Lempira',
            'NIO': 'Nicaraguan Córdoba',
            'CRC': 'Costa Rican Colón',
            'PAB': 'Panamanian Balboa',
            'JMD': 'Jamaican Dollar',
            'HTG': 'Haitian Gourde',
            'DOP': 'Dominican Peso',
            'CUP': 'Cuban Peso',
            'BBD': 'Barbadian Dollar',
            'TTD': 'Trinidad & Tobago Dollar',
            'XCD': 'East Caribbean Dollar',
            'AWG': 'Aruban Florin',
            'ANG': 'Netherlands Antillean Guilder',
            'KYD': 'Cayman Islands Dollar',
            'BMD': 'Bermudian Dollar',
            'BSD': 'Bahamian Dollar',

            // Oceania
            'FJD': 'Fijian Dollar',
            'PGK': 'Papua New Guinean Kina',
            'SBD': 'Solomon Islands Dollar',
            'VUV': 'Vanuatu Vatu',
            'WST': 'Samoan Tala',
            'TOP': 'Tongan Paʻanga',
            'TVD': 'Tuvaluan Dollar',
            'KID': 'Kiribati Dollar',
            'NRU': 'Nauruan Dollar',
            'MOP': 'Macanese Pataca',

            // Special currencies
            'XDR': 'Special Drawing Rights',
            'XAG': 'Silver Ounce',
            'XAU': 'Gold Ounce',
            'XPD': 'Palladium Ounce',
            'XPT': 'Platinum Ounce'
        };

        this.init();
    }

    async init() {
        console.log('ValutCalc initializing...');

        // Загружаем сохраненный язык
        this.loadLanguage();

        // Принудительно очищаем кеш Service Worker
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                    console.log('Service Worker unregistered');
                }
            } catch (error) {
                console.log('No Service Worker to unregister');
            }
        }

        // Очищаем кеш браузера для принудительной загрузки новой версии
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('Browser cache cleared');
            } catch (error) {
                console.log('No cache to clear');
            }
        }

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

        // Глобальный обработчик для отслеживания активного поля ввода
        let activeInputElement = null;

        document.addEventListener('focusin', (e) => {
            if (e.target && e.target.id === 'currencySearch') {
                activeInputElement = e.target;
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target && e.target.id === 'currencySearch') {
                activeInputElement = null;
            }
        });

        // Глобальный обработчик клавиш для активного поля поиска валют
        document.addEventListener('keydown', (e) => {
            if (activeInputElement && document.activeElement === activeInputElement) {
                const currentValue = activeInputElement.value || '';

                // Обрабатываем backspace
                if (e.key === 'Backspace') {
                    const newValue = currentValue.slice(0, -1);
                    activeInputElement.value = newValue;
                    activeInputElement.setAttribute('value', newValue);
                    app.handleCurrencySearch(newValue);

                    // Показываем/скрываем кнопку очистки
                    const clearBtn = document.getElementById('searchClearBtn');
                    if (clearBtn) {
                        clearBtn.style.display = newValue ? 'flex' : 'none';
                    }
                }
                // Обрабатываем печатные символы
                else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    const newValue = currentValue + e.key;
                    activeInputElement.value = newValue;
                    activeInputElement.setAttribute('value', newValue);
                    app.handleCurrencySearch(newValue);

                    // Показываем кнопку очистки
                    const clearBtn = document.getElementById('searchClearBtn');
                    if (clearBtn) {
                        clearBtn.style.display = 'flex';
                    }
                }
            }
        });




        // Скрываем модальное окно выхода при загрузке (на всякий случай)
        const exitModal = document.getElementById('exitModal');
        if (exitModal) exitModal.style.display = 'none';

        // History API initial state
        history.pushState({ screen: 'main' }, '');
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

        // Модальное окно поддержки
        document.getElementById('supportArea').addEventListener('click', () => {
            this.openSupportModal();
        });

        document.getElementById('supportModalClose').addEventListener('click', () => {
            this.closeSupportModal();
        });

        // Кнопка выбора языка
        document.getElementById('languageBtn').addEventListener('click', () => {
            this.openLanguageModal();
        });

        document.getElementById('languageModalClose').addEventListener('click', () => {
            this.closeLanguageModal();
        });

        // Выбор языка
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                this.setLanguage(lang);
                this.closeLanguageModal();
            });
        });

        // Закрытие контекстного меню при клике вне его
        document.addEventListener('click', (e) => {
            const contextMenu = document.getElementById('currencyContextMenu');
            if (contextMenu && !contextMenu.contains(e.target) && !e.target.closest('.currency-row')) {
                this.hideContextMenu();
            }
        });

        // Поиск валют - простой рабочий код
        const currencySearch = document.getElementById('currencySearch');
        const searchClearBtn = document.getElementById('searchClearBtn');

        if (currencySearch) {
            // Убираем возможные блокировки
            currencySearch.disabled = false;
            currencySearch.readonly = false;

            // Простой обработчик ввода
            currencySearch.addEventListener('input', (e) => {
                const value = e.target.value || '';
                this.handleCurrencySearch(value);

                // Показываем/скрываем кнопку очистки
                const searchClearBtn = document.getElementById('searchClearBtn');
                if (searchClearBtn) {
                    searchClearBtn.style.display = value ? 'flex' : 'none';
                }
            });

            // Обработчик фокуса для дополнительной инициализации
            currencySearch.addEventListener('focus', () => {
                const value = currencySearch.value || '';
                const searchClearBtn = document.getElementById('searchClearBtn');
                if (searchClearBtn) {
                    searchClearBtn.style.display = value ? 'flex' : 'none';
                }
            });
        }

        if (searchClearBtn) {
            console.log('Adding click handler to searchClearBtn');
            searchClearBtn.addEventListener('click', (e) => {
                console.log('Search clear button clicked!');
                e.preventDefault();
                e.stopPropagation();
                this.clearCurrencySearch();
            });
        } else {
            console.error('searchClearBtn not found!');
        }

        // Exit Modal Buttons
        const exitYesBtn = document.getElementById('exitYesBtn');
        const exitNoBtn = document.getElementById('exitNoBtn');

        if (exitYesBtn) {
            exitYesBtn.addEventListener('click', () => {
                // Устанавливаем флаг выхода, чтобы предотвратить повторное открытие модального окна
                this.isExiting = true;

                // Если пользователь нажал "Да", пытаемся закрыть приложение
                if (navigator.app && navigator.app.exitApp) {
                    navigator.app.exitApp();
                } else {
                    // Стратегия для браузера:
                    // 1. Пробуем window.close() (обычно работает только для окон, открытых скриптом)
                    try {
                        window.close();
                    } catch (e) {
                        console.log('Cannot close window via script');
                    }

                    // 2. Возвращаемся глубоко назад в истории, надеясь закрыть PWA/вкладку
                    // Мы находимся в 'exit-confirm'. Перед этим был 'main'.
                    // Возврат на 2 шага назад должен вывести нас из нашего приложения
                    history.go(-2);

                    // Если мы все еще здесь (пользователь в браузере с длинной историей),
                    // и history.go(-2) просто перекинул нас назад, но не закрыл вкладку...
                    // Или если go(-2) не сработал как ожидалось (например если истории нет).

                    // Fallback, если exit не сработал и мы все еще в приложении:
                    // Сбрасываем флаг и возвращаем пользователя в приложение, чтобы не было фриза
                    this.isExiting = false;
                    this.closeExitModal();

                    // Важно: восстанавливаем стейт main, так же как кнопка No, 
                    // чтобы кнопка Назад снова работала
                    history.pushState({ screen: 'main' }, '');
                }
            });
        }

        if (exitNoBtn) {
            exitNoBtn.addEventListener('click', () => {
                this.closeExitModal();
                // Вместо history.back(), который может оставить нас с пустым стеком,
                // мы явно пушим состояние main, чтобы следующий Back сработал корректно
                history.pushState({ screen: 'main' }, '');
            });
        }
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
                    GBP: 0.75,
                    JPY: 150,
                    AUD: 1.50,
                    CAD: 1.35,
                    CHF: 0.90,
                    CNY: 7.20,
                    SEK: 10.50,
                    NZD: 1.60,
                    NOK: 10.80,
                    KRW: 1300,
                    SGD: 1.35,
                    HKD: 7.80,
                    DKK: 6.30,
                    PLN: 4.00,
                    CZK: 22.50,
                    HUF: 350,
                    INR: 83.50,
                    THB: 35.50,
                    MYR: 4.70,
                    IDR: 15500,
                    PHP: 56.50,
                    VND: 24000,
                    TWD: 31.50,
                    PKR: 280,
                    BDT: 110,
                    AED: 3.67,
                    SAR: 3.75,
                    QAR: 3.64,
                    KWD: 0.31,
                    BHD: 0.38,
                    OMR: 0.38,
                    JOD: 0.71,
                    ILS: 3.70,
                    TRY: 30.0,
                    ZAR: 18.50,
                    EGP: 31.0,
                    MAD: 10.20,
                    NGN: 820,
                    KES: 150,
                    GHS: 12.50,
                    RON: 4.50,
                    BGN: 1.66,
                    HRK: 6.40,
                    RSD: 100,
                    UAH: 37.0,
                    BYN: 3.2,
                    RUB: 95.0,
                    GEL: 2.65,
                    AMD: 390,
                    AZN: 1.7,
                    KZT: 450,
                    UZS: 12000,
                    BRL: 5.20,
                    ARS: 850,
                    CLP: 920,
                    COP: 4200,
                    PEN: 3.75,
                    MXN: 17.50,
                    XAU: 0.0005,  // Gold
                    XAG: 0.04,    // Silver
                    XDR: 0.75     // SDR
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

        // Определяем режим отображения
        const isCompactMode = this.selectedCurrencies.length > 8;

        if (isCompactMode) {
            currencySection.classList.add('compact-mode');
        } else {
            currencySection.classList.remove('compact-mode');
        }

        this.selectedCurrencies.forEach(currencyCode => {
            const currencyName = this.getCurrencyName(currencyCode);
            const isActive = currencyCode === this.activeCurrency;

            const currencyRow = document.createElement('div');
            currencyRow.className = `currency-row ${isActive ? 'active' : ''}`;
            currencyRow.dataset.currency = currencyCode;

            if (isCompactMode) {
                // Компактный режим: только аббревиатура и цифры
                currencyRow.innerHTML = `
                    <div class="currency-code-compact">${currencyCode}</div>
                    <div class="currency-value">0</div>
                `;
            } else {
                // Обычный режим: полное название и аббревиатура
                currencyRow.innerHTML = `
                    <div class="currency-info">
                        <div class="currency-name">${currencyName}</div>
                        <div class="currency-code">${currencyCode}</div>
                    </div>
                    <div class="currency-value">0</div>
                `;
            }

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

        // Добавляем в стек навигации и History API
        this.navigationStack.push(this.currentScreen);
        this.currentScreen = 'settings';
        history.pushState({ screen: 'settings' }, '');

        // Принудительно переводим все элементы при открытии настроек
        setTimeout(() => {
            this.translateInterface();
            this.translateAllElements();
        }, 50);

        // Обновляем состояние кнопок
        this.updateSettingsButtons();

        // Обновляем информацию о последнем обновлении курсов
        this.updateLastUpdateTime();

        // Устанавливаем текущую тему
        const currentTheme = this.isDarkTheme ? 'dark' : 'light';
        document.querySelector(`input[name="theme"][value="${currentTheme}"]`).checked = true;
    }

    closeSettings() {
        // Явно закрываем UI и обновляем currentScreen
        this._closeSettingsUI();

        // Ставим флаг, чтобы popstate event listener проигнорировал следующее событие
        // (которое мы вызовем через history.back())
        this.ignoreNextPopstate = true;

        // Синхронизируем историю браузера
        history.back();
    }

    // Метод для фактического закрытия UI (вызывается из handleBackButton)
    _closeSettingsUI() {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';

        // Возвращаемся к предыдущему экрану логически
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
            // Очищаем кеш браузера перед обновлением
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('Cache cleared before update');
            }

            // Принудительно обновляем Service Worker
            await this.serviceWorkerRegistration.update();

            // Если есть ожидающий Service Worker, активируем его
            if (this.serviceWorkerRegistration.waiting) {
                this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

            // Перезагружаем страницу для применения обновления
            setTimeout(() => {
                window.location.reload(true); // Принудительная перезагрузка
            }, 1000);

        } catch (error) {
            console.error('Update error:', error);
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

        // Добавляем в стек навигации и History API
        this.navigationStack.push(this.currentScreen);
        this.currentScreen = 'currency-settings';
        history.pushState({ screen: 'currency-settings' }, '');

        this.updateCurrencySettingsDisplay();

        // Убеждаемся что поле поиска пустое
        const searchInputElement = document.getElementById('currencySearch');
        if (searchInputElement) {
            searchInputElement.value = '';
            searchInputElement.setAttribute('value', '');

            // Сбрасываем поисковый запрос
            this.currencySearchQuery = '';

            // Обновляем UI поиска (скрываем кнопку очистки)
            this.updateSearchUI();
        }

        // Автофокус на поле поиска после небольшого таймаута
        setTimeout(() => {
            const searchInput = document.getElementById('currencySearch');
            if (searchInput) {
                // Убираем возможные блокировки
                searchInput.disabled = false;
                searchInput.readonly = false;
                searchInput.removeAttribute('readonly');
                searchInput.removeAttribute('disabled');

                // Убеждаемся что поле пустое при фокусе
                searchInput.value = '';

                // Добавляем обработчики событий для поля поиска
                searchInput.addEventListener('input', (e) => {
                    const value = e.target.value || '';
                    app.handleCurrencySearch(value);

                    // Показываем/скрываем кнопку очистки
                    const searchClearBtn = document.getElementById('searchClearBtn');
                    if (searchClearBtn) {
                        searchClearBtn.style.display = value ? 'flex' : 'none';
                    }
                });

                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        app.clearCurrencySearch();
                    }
                });

                searchInput.focus();
                console.log('Search input focused');

                // Инициализируем кнопку очистки с небольшой задержкой
                setTimeout(() => {
                    const searchClearBtn = document.getElementById('searchClearBtn');
                    if (searchClearBtn) {
                        console.log('Initializing searchClearBtn');
                        searchClearBtn.style.display = 'none';

                        // Убеждаемся что кнопка кликабельна
                        searchClearBtn.style.pointerEvents = 'auto';
                        searchClearBtn.style.cursor = 'pointer';
                    } else {
                        console.error('searchClearBtn not found during initialization!');
                    }
                }, 100);
            }
        }, 300);

        // Переводим интерфейс модального окна
        setTimeout(() => {
            this.translateInterface();
            this.translateAllElements();
        }, 50);
    }

    closeCurrencySettings() {
        // Явно закрываем UI и обновляем currentScreen
        this._closeCurrencySettingsUI();

        // Ставим флаг для игнорирования popstate
        this.ignoreNextPopstate = true;

        // Синхронизируем историю
        history.back();
    }

    // Метод для фактического закрытия UI
    _closeCurrencySettingsUI() {
        const modal = document.getElementById('currencySettingsModal');
        if (modal) modal.style.display = 'none';

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

        // Получаем отфильтрованные валюты
        const filteredCurrencies = this.getFilteredCurrencies();

        // Сортируем валюты по алфавиту (по названию)
        const sortedCurrencies = filteredCurrencies.sort((a, b) => a[1].localeCompare(b[1]));

        sortedCurrencies.forEach(([code, name]) => {
            const currencyItem = document.createElement('div');
            currencyItem.className = 'currency-item';

            // Подсвечиваем найденные фрагменты
            const highlightedName = this.highlightSearchTerm(name, this.currencySearchQuery);
            const highlightedCode = this.highlightSearchTerm(code, this.currencySearchQuery);

            currencyItem.innerHTML = `
                <div class="currency-item-info">
                    <span class="currency-item-name">${highlightedName}</span>
                    <span class="currency-item-code">${highlightedCode}</span>
                </div>
                <div class="currency-item-actions">
                    <button class="add-currency-btn" data-currency="${code}">${this.t('addCurrency')}</button>
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
        });
    }

    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;

        // Создаем более точный поиск с учетом границ слов
        const words = searchTerm.split(' ');
        let highlightedText = text;

        words.forEach(word => {
            if (word.length > 0) {
                // Подсвечиваем совпадения в начале слов и в любом месте
                const regex = new RegExp(`(\\b${word})|(${word})`, 'gi');
                highlightedText = highlightedText.replace(regex, (match, wordStart) => {
                    return wordStart ? `<mark class="search-highlight">${wordStart}</mark>` : `<mark class="search-highlight-secondary">${match}</mark>`;
                });
            }
        });

        return highlightedText;
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
        // Убрали ограничение на количество валют
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
        // Обработка popstate для браузера и Android "Back"
        window.addEventListener('popstate', (event) => {
            // Если выставлен флаг игнорирования (например, при клике на крестик), сбрасываем его и выходим
            if (this.ignoreNextPopstate) {
                this.ignoreNextPopstate = false;
                return;
            }

            // Если мы в процессе выхода, игнорируем изменения истории (чтобы не открыть модалку снова)
            if (this.isExiting) return;

            // Если state null, значит мы вернулись в какое-то неопределенное состояние, считаем main
            const state = event.state || { screen: 'main' };

            // Если мы были на каком-то экране и нажали Назад, 
            // мы должны закрыть этот экран.

            this.handleBackButton(state.screen);
        });

        // Обработка клавиши Escape для тестирования на десктопе
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                // Эмулируем нажатие назад
                if (this.currentScreen !== 'main') {
                    history.back();
                } else {
                    // Если мы на главной, Escape вызывает модалку выхода
                    this.openExitModal();
                }
            }
        });
    }


    handleBackButton(targetScreen) {
        // Определяем текущий экран (откуда уходим)
        const previousScreen = this.currentScreen;

        // Логика закрытия UI в зависимости от того, ГДЕ мы были
        if (previousScreen === 'currency-settings') {
            this._closeCurrencySettingsUI();
        } else if (previousScreen === 'settings') {
            this._closeSettingsUI();
        } else if (previousScreen === 'exit-confirm') {
            this._closeExitModalUI();
        } else if (previousScreen === 'main') {
            // Если мы на главной и нажали назад (событие popstate сработало, значит мы ушли "до" main)
            // Но мы пушили 'main' в init.
            // Если мы здесь, значит стек истории пуст или мы вышли за его пределы?
            // На самом деле, если мы на main, мы должны показать exit modal.
            // Но чтобы показать его и поддержать кнопку "Назад" в нем, мы должны запушить стейт.
            this.openExitModal();
        }
    }

    openExitModal() {
        if (this.currentScreen === 'exit-confirm') return;

        const modal = document.getElementById('exitModal');
        if (modal) {
            modal.style.display = 'flex';
            // Анимация
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });

            // Перевод
            this.translateInterface();
        }

        this.currentScreen = 'exit-confirm';
        // Пушим состояние выхода, чтобы кнопка "Назад" закрыла его
        history.pushState({ screen: 'exit-confirm' }, '');
    }

    closeExitModal() {
        this._closeExitModalUI();
    }

    _closeExitModalUI() {
        const modal = document.getElementById('exitModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        this.currentScreen = 'main';
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
        // Копируем без пробелов для удобства вставки
        const copyValue = convertedValue.toFixed(2);

        try {
            await navigator.clipboard.writeText(copyValue);
            this.showCopySuccess();
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = copyValue;
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
        // Убираем все пробелы и очищаем от лишних символов
        const cleanValue = value.replace(/\s/g, '').replace(/[^\d.,]/g, '').replace(',', '.');

        // Проверяем, что это число
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue) || numValue < 0) {
            this.showPasteError(this.t('onlyNumbers'));
            return;
        }

        // Проверяем, что есть валюта для вставки
        if (!this.contextMenuCurrency) {
            this.showPasteError(this.t('noCurrencySelected'));
            return;
        }

        // Активируем валюту, в которую вставляем
        this.setActiveCurrency(this.contextMenuCurrency);

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

    openSupportModal() {
        const modal = document.getElementById('supportModal');
        if (modal) {
            modal.style.display = 'flex';
            // Переводим интерфейс модального окна
            this.translateInterface();
            // Добавляем анимацию появления
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    }

    closeSupportModal() {
        const modal = document.getElementById('supportModal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // Методы для работы с языками
    loadLanguage() {
        const savedLanguage = localStorage.getItem('valutcalc_language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
            this.currentLanguage = savedLanguage;
        }
        this.updateLanguageDisplay();
        this.translateInterface();
    }

    saveLanguage(language) {
        localStorage.setItem('valutcalc_language', language);
    }

    setLanguage(language) {
        if (language !== this.currentLanguage) {
            this.currentLanguage = language;
            this.saveLanguage(language);
            this.updateLanguageDisplay();

            // Принудительно переводим все элементы
            setTimeout(() => {
                this.translateInterface();
                this.translateAllElements();
            }, 100);
        }
    }

    updateLanguageDisplay() {
        const languageBtn = document.getElementById('languageBtn');
        if (!languageBtn) return;

        const flag = languageBtn.querySelector('.language-flag');
        const code = languageBtn.querySelector('.language-code');

        if (flag && code) {
            // Показываем только аббревиатуру языка, как в модальном окне
            const expectedCode = this.currentLanguage === 'ru' ? 'RU' : 'EN';

            // Принудительно очищаем и устанавливаем новые значения
            flag.textContent = '';
            code.textContent = '';

            // Устанавливаем только код языка
            code.textContent = expectedCode;
        }

        // Обновляем выбранный язык в модальном окне
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('selected');
            }
        });
    }

    translateInterface() {
        // Переводим элементы интерфейса
        const elements = {
            'refreshRatesBtn': 'refreshRates',
            'lastUpdateLabel': 'lastUpdated',
            'themeLabel': 'theme',
            'aboutLabel': 'about',
            'installBtn': 'installApp',
            'updateBtnSettings': 'updateApp',
            'currencySettingsBtn': 'currencySettings',
            'addCurrencyBtn': 'addCurrency',
            'supportText': 'supportDeveloper',
            'donateDescription': 'donateDescription',
            'koFiBtn': 'koFi',
            'paypalBtn': 'paypal',
            'bitcoinBtn': 'bitcoin',
            'usageTip': 'welcomeTip'
        };

        for (const [elementId, translationKey] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                if (element.tagName === 'BUTTON') {
                    // Для кнопок ищем span или переводим весь текст
                    const span = element.querySelector('span');
                    if (span) {
                        span.textContent = this.translations[this.currentLanguage][translationKey];
                    } else {
                        // Если нет span, переводим весь текст кнопки
                        element.textContent = this.translations[this.currentLanguage][translationKey];
                    }
                } else {
                    // Для обычных элементов
                    element.textContent = this.translations[this.currentLanguage][translationKey];
                }
            }
        }

        // Переводим элементы с data-translate атрибутами
        const translateElements = document.querySelectorAll('[data-translate]');
        translateElements.forEach(element => {
            const translationKey = element.getAttribute('data-translate');
            if (this.translations[this.currentLanguage][translationKey]) {
                element.textContent = this.translations[this.currentLanguage][translationKey];
            }
        });

        // Переводим placeholder'ы
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(element => {
            const translationKey = element.getAttribute('data-translate-placeholder');
            if (this.translations[this.currentLanguage][translationKey]) {
                element.placeholder = this.translations[this.currentLanguage][translationKey];
            }
        });

        // Переводим кнопки без span (Install App, Check for updates)
        const installBtn = document.getElementById('installBtn');
        if (installBtn && installBtn.textContent.includes('Install')) {
            installBtn.textContent = this.translations[this.currentLanguage]['installApp'];
        }

        const updateBtn = document.getElementById('updateBtnSettings');
        if (updateBtn && updateBtn.textContent.includes('Update')) {
            updateBtn.textContent = this.translations[this.currentLanguage]['updateApp'];
        }

        // Переводим заголовки секций
        const sectionHeaders = document.querySelectorAll('.settings-section h3');
        sectionHeaders.forEach(header => {
            const text = header.textContent.trim();
            if (text === 'Application' || text === 'Приложение') {
                header.textContent = this.translations[this.currentLanguage]['application'];
            } else if (text === 'Theme' || text === 'Тема') {
                header.textContent = this.translations[this.currentLanguage]['theme'];
            } else if (text === 'About' || text === 'О программе') {
                header.textContent = this.translations[this.currentLanguage]['about'];
            } else if (text === 'Exchange Rates' || text === 'Курсы валют') {
                header.textContent = this.translations[this.currentLanguage]['refreshRates'];
            }
        });

        // Переводим заголовки секций в настройках валют
        const currencySettingsSections = document.querySelectorAll('.currency-settings-section h3');
        currencySettingsSections.forEach((header, index) => {
            const text = header.textContent.trim();
            if (text === 'Current Currencies' || text === 'Текущие валюты') {
                header.textContent = this.translations[this.currentLanguage]['currentCurrencies'];
            } else if (text === 'Available Currencies' || text === 'Доступные валюты') {
                header.textContent = this.translations[this.currentLanguage]['availableCurrencies'];
            }
        });

        // Переводим опции тем
        const themeOptions = document.querySelectorAll('.theme-option span:last-child');
        themeOptions.forEach(option => {
            const text = option.textContent.trim();
            if (text === 'Dark' || text === 'Тёмная') {
                option.textContent = this.translations[this.currentLanguage]['dark'];
            } else if (text === 'Light' || text === 'Светлая') {
                option.textContent = this.translations[this.currentLanguage]['light'];
            } else if (text === 'Green' || text === 'Зелёная') {
                option.textContent = this.translations[this.currentLanguage]['green'];
            } else if (text === 'Blue' || text === 'Синяя') {
                option.textContent = this.translations[this.currentLanguage]['blue'];
            } else if (text === 'Purple' || text === 'Фиолетовая') {
                option.textContent = this.translations[this.currentLanguage]['purple'];
            } else if (text === 'Red' || text === 'Красная') {
                option.textContent = this.translations[this.currentLanguage]['red'];
            }
        });

        // Переводим заголовок модального окна языка
        const languageModalTitle = document.querySelector('.language-modal-header h2');
        if (languageModalTitle) {
            languageModalTitle.textContent = this.translations[this.currentLanguage]['selectLanguage'];
        }

        // Переводим модальное окно настроек валют
        const currencySettingsTitle = document.querySelector('.currency-settings-header h2');
        if (currencySettingsTitle) {
            currencySettingsTitle.textContent = this.translations[this.currentLanguage]['currencySettings'];
        }


        // Переводим кнопки "Add" в настройках валют
        const addButtons = document.querySelectorAll('.add-currency-btn');
        addButtons.forEach(button => {
            button.textContent = this.translations[this.currentLanguage]['addCurrency'];
        });

        // Переводим модальное окно поддержки
        const supportFooter = document.querySelector('.support-footer p');
        if (supportFooter) {
            supportFooter.textContent = this.translations[this.currentLanguage]['thankYou'];
        }

        const cryptoSubtitle = document.querySelector('.support-subtitle');
        if (cryptoSubtitle && cryptoSubtitle.textContent.includes('Crypto')) {
            cryptoSubtitle.textContent = this.translations[this.currentLanguage]['cryptoDonation'];
        }
    }

    openLanguageModal() {
        const modal = document.getElementById('languageModal');
        modal.classList.add('show');

        // Переводим интерфейс модального окна
        setTimeout(() => {
            this.translateInterface();
            this.translateAllElements();
        }, 50);
    }

    closeLanguageModal() {
        const modal = document.getElementById('languageModal');
        modal.classList.remove('show');
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }


    // Методы для поиска валют
    handleCurrencySearch(query) {
        // Исправляем undefined значение
        const searchQuery = query !== undefined ? query : '';
        console.log('Handling currency search:', searchQuery);

        if (typeof searchQuery === 'string') {
            this.currencySearchQuery = searchQuery.toLowerCase().trim();
        } else {
            this.currencySearchQuery = '';
        }

        this.updateAvailableCurrenciesList();
        this.updateSearchUI();

        // Автопрокрутка к результатам поиска если есть запрос
        if (this.currencySearchQuery && this.currencySearchQuery.length > 0) {
            const availableList = document.getElementById('availableCurrenciesList');
            if (availableList && availableList.children.length > 0) {
                availableList.scrollTop = 0; // Прокручиваем к началу списка
            }
        }
    }

    clearCurrencySearch() {
        console.log('ClearCurrencySearch called');
        const searchInput = document.getElementById('currencySearch');
        if (searchInput) {
            console.log('Search input found, clearing...');
            // Очищаем значение поля
            searchInput.value = '';
            searchInput.setAttribute('value', '');

            // Очищаем поисковый запрос
            this.currencySearchQuery = '';

            // Обновляем списки валют
            this.updateAvailableCurrenciesList();
            this.updateSearchUI();

            console.log('Currency search cleared successfully');
        } else {
            console.error('Search input not found!');
        }
    }

    updateSearchUI() {
        console.log('updateSearchUI called, query:', this.currencySearchQuery);
        const searchClearBtn = document.getElementById('searchClearBtn');
        const searchResultsCount = document.getElementById('searchResultsCount');

        // Управляем кнопкой очистки поиска
        if (searchClearBtn) {
            console.log('searchClearBtn found in updateSearchUI');
            if (this.currencySearchQuery && this.currencySearchQuery.length > 0) {
                console.log('Showing search clear button');
                searchClearBtn.style.display = 'flex';
                searchClearBtn.style.opacity = '1';
                searchClearBtn.style.pointerEvents = 'auto';
                searchClearBtn.style.zIndex = '999';
            } else {
                console.log('Hiding search clear button');
                searchClearBtn.style.display = 'none';
                searchClearBtn.style.opacity = '0';
                searchClearBtn.style.pointerEvents = 'none';
            }
        } else {
            console.error('searchClearBtn not found in updateSearchUI!');
        }

        // Управляем счетчиком результатов поиска
        if (searchResultsCount) {
            if (this.currencySearchQuery && this.currencySearchQuery.length > 0) {
                const filteredCurrencies = this.getFilteredCurrencies();
                searchResultsCount.textContent = `${filteredCurrencies.length} ${this.t('searchResults')}`;
                searchResultsCount.style.display = 'block';
            } else {
                searchResultsCount.style.display = 'none';
            }
        }
    }

    getFilteredCurrencies() {
        if (!this.currencySearchQuery) {
            return Object.entries(this.availableCurrencies)
                .filter(([code, name]) => !this.selectedCurrencies.includes(code))
                .sort((a, b) => a[1].localeCompare(b[1])); // Сортировка по алфавиту
        }

        return Object.entries(this.availableCurrencies)
            .filter(([code, name]) => {
                if (this.selectedCurrencies.includes(code)) return false;

                const searchQuery = this.currencySearchQuery;
                const codeMatch = code.toLowerCase().includes(searchQuery);
                const nameMatch = name.toLowerCase().includes(searchQuery);

                // Приоритет точным совпадениям в начале слова
                const startsWithCode = code.toLowerCase().startsWith(searchQuery);
                const startsWithName = name.toLowerCase().indexOf(' ' + searchQuery) === -1 &&
                    name.toLowerCase().startsWith(searchQuery);

                return codeMatch || nameMatch || startsWithCode || startsWithName;
            })
            .sort((a, b) => {
                const aCode = a[0].toLowerCase();
                const bCode = b[0].toLowerCase();
                const aName = a[1].toLowerCase();
                const bName = b[1].toLowerCase();
                const query = this.currencySearchQuery;

                // Сначала показываем точные совпадения в начале
                const aStartsWith = aCode.startsWith(query) || aName.startsWith(query);
                const bStartsWith = bCode.startsWith(query) || bName.startsWith(query);

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;

                // Затем по алфавиту
                return aName.localeCompare(bName);
            });
    }

    translateAllElements() {
        // Переводим все заголовки h3
        const h3Elements = document.querySelectorAll('h3');
        h3Elements.forEach(element => {
            const text = element.textContent.trim();
            switch (text) {
                case 'Application':
                case 'Приложение':
                    element.textContent = this.t('application');
                    break;
                case 'Theme':
                case 'Тема':
                    element.textContent = this.t('theme');
                    break;
                case 'About':
                case 'О программе':
                    element.textContent = this.t('about');
                    break;
                case 'Exchange Rates':
                case 'Курсы валют':
                    element.textContent = this.t('refreshRates');
                    break;
                case 'Current Currencies':
                case 'Текущие валюты':
                    element.textContent = this.t('currentCurrencies');
                    break;
                case 'Available Currencies':
                case 'Доступные валюты':
                    element.textContent = this.t('availableCurrencies');
                    break;
            }
        });

        // Переводим все заголовки h2
        const h2Elements = document.querySelectorAll('h2');
        h2Elements.forEach(element => {
            const text = element.textContent.trim();
            switch (text) {
                case 'Settings':
                case 'Настройки':
                    element.textContent = this.t('settings');
                    break;
                case 'Currency Settings':
                case 'Настройки валют':
                    element.textContent = this.t('currencySettings');
                    break;
                case 'Select Language':
                case 'Выберите язык':
                    element.textContent = this.t('selectLanguage');
                    break;
                case 'Exit ValutCalc?':
                case 'Выйти из приложения?':
                    element.textContent = this.t('exitConfirm');
                    break;
            }
        });

        // Переводим все кнопки
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            const text = button.textContent.trim();
            const span = button.querySelector('span');

            switch (text) {
                case 'Install App':
                case 'Установить приложение':
                    if (span) span.textContent = this.t('installApp');
                    else button.textContent = this.t('installApp');
                    break;
                case 'Check for updates':
                case 'Проверить обновления':
                    if (span) span.textContent = this.t('checkUpdates');
                    else button.textContent = this.t('checkUpdates');
                    break;
                case 'Update App':
                case 'Обновить приложение':
                    if (span) span.textContent = this.t('updateApp');
                    else button.textContent = this.t('updateApp');
                    break;
                case 'Currency Settings':
                case 'Настройки валют':
                    if (span) span.textContent = this.t('currencySettings');
                    else button.textContent = this.t('currencySettings');
                    break;
                case 'Refresh Exchange Rates':
                case 'Обновить курсы валют':
                    if (span) span.textContent = this.t('refreshRates');
                    else button.textContent = this.t('refreshRates');
                    break;
                case 'Add':
                case 'Добавить валюту':
                    button.textContent = this.t('addCurrency');
                    break;
                case 'Yes':
                case 'Да':
                    button.textContent = this.t('yes');
                    break;
                case 'No':
                case 'Нет':
                    button.textContent = this.t('no');
                    break;
            }
        });

        // Переводим другие элементы
        const spans = document.querySelectorAll('span');
        spans.forEach(span => {
            const text = span.textContent.trim();
            if (text === 'Last updated:' || text === 'Последнее обновление:') {
                span.textContent = this.t('lastUpdated');
            }
        });

        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            const text = p.textContent.trim();
            if (text.includes('Thank you for your support!') || text.includes('🙏 Спасибо за поддержку!')) {
                p.textContent = this.t('thankYou');
            }
        });
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ValutCalc();
});

// Service Worker регистрация - временно отключено для отладки
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ValutCalc: SW registered successfully');
                if (typeof app !== 'undefined') {
                    app.serviceWorkerRegistration = registration;
                }
            })
            .catch(error => {
                console.error('ValutCalc: SW registration failed:', error);
            });
    });
}
