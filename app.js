class ValutCalc {
    constructor() {
        this.exchangeRates = {};
        this.activeCurrency = 'USD';
        this.currentValue = '1';
        this.baseCurrency = 'USD';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadExchangeRates();
        this.updateDisplay();
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
            console.error('Ошибка загрузки курсов:', err);
            
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
        
        // Обновляем все валюты
        document.querySelectorAll('.currency-row').forEach(row => {
            const currency = row.dataset.currency;
            const currencyValue = this.convertCurrency(value, this.activeCurrency, currency);
            const formattedValue = this.formatValue(currencyValue);
            row.querySelector('.currency-value').textContent = formattedValue;
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
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new ValutCalc();
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
