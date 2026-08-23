import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
};

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 86.5,
  EUR: 0.92,
  GBP: 0.79,
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  convertPrice: (amountInUsd: number | string | null | undefined) => number;
  formatPrice: (amountInUsd: number | string | null | undefined, includeSymbol?: boolean) => string;
  rates: Record<string, number>;
  loadingRates: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('globetrotter_currency');
    return (saved && saved in CURRENCIES) ? (saved as CurrencyCode) : 'USD';
  });

  const [rates, setRates] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('globetrotter_rates');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_RATES;
      }
    }
    return DEFAULT_RATES;
  });

  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (response.ok) {
          const data = await response.json();
          if (data && data.rates) {
            setRates(data.rates);
            localStorage.setItem('globetrotter_rates', JSON.stringify(data.rates));
          }
        }
      } catch (err) {
        console.warn('Using cached/default exchange rates:', err);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, []);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('globetrotter_currency', newCurrency);
  };

  const convertPrice = (amountInUsd: number | string | null | undefined): number => {
    if (amountInUsd === null || amountInUsd === undefined || isNaN(Number(amountInUsd))) return 0;
    const num = Number(amountInUsd);
    const rate = rates[currency] || DEFAULT_RATES[currency] || 1;
    return num * rate;
  };

  const formatPrice = (amountInUsd: number | string | null | undefined, includeSymbol = true): string => {
    const converted = convertPrice(amountInUsd);
    const symbol = CURRENCIES[currency].symbol;

    // Formatting based on currency
    const formatted = converted.toLocaleString('en-US', {
      minimumFractionDigits: currency === 'INR' ? 0 : 2,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    });

    return includeSymbol ? `${symbol}${formatted}` : formatted;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyConfig: CURRENCIES[currency],
        convertPrice,
        formatPrice,
        rates,
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