import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 0 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2 },
};

export const DEFAULT_STATIC_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.5,
  JPY: 154.2,
  AUD: 1.55,
  CAD: 1.38,
};

interface FormatOptions {
  currency?: string | null;
  includeSymbol?: boolean;
  showDecimals?: boolean;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  convertPrice: (amountInUsd: number | string | null | undefined, targetCurrency?: string | null) => number;
  convertToUsd: (amountInDisplayCurrency: number | string | null | undefined, fromCurrency?: string | null) => number;
  formatPrice: (amountInUsd: number | string | null | undefined, options?: FormatOptions | boolean) => string;
  getSymbol: (currencyCode?: string | null) => string;
  rates: Record<string, number>;
  ratesLastUpdated: string;
  isFallbackRates: boolean;
  loadingRates: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CACHE_KEY = 'globetrotter_exchange_rates_v2';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('globetrotter_currency');
    return saved && saved in CURRENCIES ? (saved as CurrencyCode) : 'USD';
  });

  const [rates, setRates] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.rates) return parsed.rates;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_STATIC_RATES;
  });

  const [ratesLastUpdated, setRatesLastUpdated] = useState<string>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp) {
          return new Date(parsed.timestamp).toLocaleString();
        }
      } catch (e) {}
    }
    return new Date().toLocaleDateString() + ' (Static Default)';
  });

  const [isFallbackRates, setIsFallbackRates] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.timestamp || 0);
          if (age < CACHE_DURATION_MS && parsed.rates) {
            setRates(parsed.rates);
            setRatesLastUpdated(new Date(parsed.timestamp).toLocaleString());
            return; // Cache is fresh!
          }
        } catch (e) {}
      }

      setLoadingRates(true);
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (response.ok) {
          const data = await response.json();
          if (data && data.rates) {
            const now = Date.now();
            setRates(data.rates);
            const dateStr = new Date(now).toLocaleString();
            setRatesLastUpdated(dateStr);
            setIsFallbackRates(false);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                rates: data.rates,
                timestamp: now,
                lastUpdated: dateStr,
              })
            );
          }
        } else {
          throw new Error('Exchange rate API returned non-200');
        }
      } catch (err) {
        console.warn('Exchange rate API unavailable, using cached / fallback rates:', err);
        setIsFallbackRates(true);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    if (newCurrency in CURRENCIES) {
      setCurrencyState(newCurrency);
      localStorage.setItem('globetrotter_currency', newCurrency);
    }
  }, []);

  const convertPrice = useCallback(
    (amountInUsd: number | string | null | undefined, targetCurrency?: string | null): number => {
      if (amountInUsd === null || amountInUsd === undefined || isNaN(Number(amountInUsd))) return 0;
      const num = Number(amountInUsd);
      const code = (targetCurrency && targetCurrency in CURRENCIES ? targetCurrency : currency) as CurrencyCode;
      const rate = rates[code] || DEFAULT_STATIC_RATES[code] || 1;
      return num * rate;
    },
    [currency, rates]
  );

  const convertToUsd = useCallback(
    (amountInDisplayCurrency: number | string | null | undefined, fromCurrency?: string | null): number => {
      if (amountInDisplayCurrency === null || amountInDisplayCurrency === undefined || isNaN(Number(amountInDisplayCurrency))) return 0;
      const num = Number(amountInDisplayCurrency);
      const code = (fromCurrency && fromCurrency in CURRENCIES ? fromCurrency : currency) as CurrencyCode;
      const rate = rates[code] || DEFAULT_STATIC_RATES[code] || 1;
      if (rate <= 0) return num;
      return Number((num / rate).toFixed(2));
    },
    [currency, rates]
  );

  const getSymbol = useCallback(
    (currencyCode?: string | null): string => {
      const code = (currencyCode && currencyCode in CURRENCIES ? currencyCode : currency) as CurrencyCode;
      return CURRENCIES[code]?.symbol || '$';
    },
    [currency]
  );

  const formatPrice = useCallback(
    (amountInUsd: number | string | null | undefined, options?: FormatOptions | boolean): string => {
      let opt: FormatOptions = {};
      if (typeof options === 'boolean') {
        opt = { includeSymbol: options };
      } else if (options) {
        opt = options;
      }

      const { currency: targetCode, includeSymbol = true, showDecimals } = opt;
      const activeCode = (targetCode && targetCode in CURRENCIES ? targetCode : currency) as CurrencyCode;
      const config = CURRENCIES[activeCode] || CURRENCIES.USD;

      const converted = convertPrice(amountInUsd, activeCode);
      const decimals = showDecimals !== undefined ? (showDecimals ? 2 : 0) : config.decimals;

      const formattedNumber = converted.toLocaleString(config.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      return includeSymbol ? `${config.symbol}${formattedNumber}` : formattedNumber;
    },
    [currency, convertPrice]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyConfig: CURRENCIES[currency],
        convertPrice,
        convertToUsd,
        formatPrice,
        getSymbol,
        rates,
        ratesLastUpdated,
        isFallbackRates,
        loadingRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};