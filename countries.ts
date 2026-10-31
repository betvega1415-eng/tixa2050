export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  callingCode: string;
  currency: string;
  currencySymbol: string;
  rateToUsd: number; // 1 USD = X Local Currency
  phonePlaceholder: string;
}

export type CountryData = CountryInfo;

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    callingCode: '+880',
    currency: 'BDT',
    currencySymbol: '৳',
    rateToUsd: 121.50,
    phonePlaceholder: '01712-345678'
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    callingCode: '+1',
    currency: 'USD',
    currencySymbol: '$',
    rateToUsd: 1.00,
    phonePlaceholder: '(555) 123-4567'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    callingCode: '+44',
    currency: 'GBP',
    currencySymbol: '£',
    rateToUsd: 0.79,
    phonePlaceholder: '7911 123456'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    callingCode: '+971',
    currency: 'AED',
    currencySymbol: 'د.إ',
    rateToUsd: 3.67,
    phonePlaceholder: '50 123 4567'
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    callingCode: '+91',
    currency: 'INR',
    currencySymbol: '₹',
    rateToUsd: 86.80,
    phonePlaceholder: '98765 43210'
  },
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    callingCode: '+92',
    currency: 'PKR',
    currencySymbol: '₨',
    rateToUsd: 278.50,
    phonePlaceholder: '300 1234567'
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    callingCode: '+966',
    currency: 'SAR',
    currencySymbol: '﷼',
    rateToUsd: 3.75,
    phonePlaceholder: '50 123 4567'
  },
  {
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    callingCode: '+974',
    currency: 'QAR',
    currencySymbol: 'QR',
    rateToUsd: 3.64,
    phonePlaceholder: '3312 3456'
  },
  {
    code: 'KW',
    name: 'Kuwait',
    flag: '🇰🇼',
    callingCode: '+965',
    currency: 'KWD',
    currencySymbol: 'KD',
    rateToUsd: 0.31,
    phonePlaceholder: '9123 4567'
  },
  {
    code: 'OM',
    name: 'Oman',
    flag: '🇴🇲',
    callingCode: '+968',
    currency: 'OMR',
    currencySymbol: 'OR',
    rateToUsd: 0.385,
    phonePlaceholder: '9123 4567'
  },
  {
    code: 'BH',
    name: 'Bahrain',
    flag: '🇧🇭',
    callingCode: '+973',
    currency: 'BHD',
    currencySymbol: 'BD',
    rateToUsd: 0.376,
    phonePlaceholder: '3600 1234'
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    callingCode: '+49',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUsd: 0.92,
    phonePlaceholder: '151 12345678'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    callingCode: '+33',
    currency: 'EUR',
    currencySymbol: '€',
    rateToUsd: 0.92,
    phonePlaceholder: '6 12 34 56 78'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    callingCode: '+1',
    currency: 'CAD',
    currencySymbol: 'C$',
    rateToUsd: 1.38,
    phonePlaceholder: '(416) 123-4567'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    callingCode: '+61',
    currency: 'AUD',
    currencySymbol: 'A$',
    rateToUsd: 1.54,
    phonePlaceholder: '412 345 678'
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    callingCode: '+65',
    currency: 'SGD',
    currencySymbol: 'S$',
    rateToUsd: 1.34,
    phonePlaceholder: '8123 4567'
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    callingCode: '+60',
    currency: 'MYR',
    currencySymbol: 'RM',
    rateToUsd: 4.45,
    phonePlaceholder: '12-345 6789'
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    callingCode: '+62',
    currency: 'IDR',
    currencySymbol: 'Rp',
    rateToUsd: 15900.00,
    phonePlaceholder: '812-3456-7890'
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    callingCode: '+81',
    currency: 'JPY',
    currencySymbol: '¥',
    rateToUsd: 155.20,
    phonePlaceholder: '90-1234-5678'
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    callingCode: '+82',
    currency: 'KRW',
    currencySymbol: '₩',
    rateToUsd: 1390.00,
    phonePlaceholder: '10-1234-5678'
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    callingCode: '+86',
    currency: 'CNY',
    currencySymbol: '¥',
    rateToUsd: 7.25,
    phonePlaceholder: '138 1234 5678'
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    callingCode: '+90',
    currency: 'TRY',
    currencySymbol: '₺',
    rateToUsd: 34.20,
    phonePlaceholder: '532 123 4567'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    callingCode: '+234',
    currency: 'NGN',
    currencySymbol: '₦',
    rateToUsd: 1520.00,
    phonePlaceholder: '802 123 4567'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    callingCode: '+27',
    currency: 'ZAR',
    currencySymbol: 'R',
    rateToUsd: 18.20,
    phonePlaceholder: '82 123 4567'
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    callingCode: '+254',
    currency: 'KES',
    currencySymbol: 'KSh',
    rateToUsd: 129.50,
    phonePlaceholder: '712 345678'
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    callingCode: '+20',
    currency: 'EGP',
    currencySymbol: 'E£',
    rateToUsd: 49.20,
    phonePlaceholder: '100 123 4567'
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    callingCode: '+55',
    currency: 'BRL',
    currencySymbol: 'R$',
    rateToUsd: 5.60,
    phonePlaceholder: '(11) 98765-4321'
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    callingCode: '+52',
    currency: 'MXN',
    currencySymbol: 'Mex$',
    rateToUsd: 20.10,
    phonePlaceholder: '55 1234 5678'
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    callingCode: '+41',
    currency: 'CHF',
    currencySymbol: 'CHF',
    rateToUsd: 0.89,
    phonePlaceholder: '79 123 45 67'
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    callingCode: '+66',
    currency: 'THB',
    currencySymbol: '฿',
    rateToUsd: 34.80,
    phonePlaceholder: '81 234 5678'
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    callingCode: '+84',
    currency: 'VND',
    currencySymbol: '₫',
    rateToUsd: 25400.00,
    phonePlaceholder: '91 234 5678'
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    callingCode: '+63',
    currency: 'PHP',
    currencySymbol: '₱',
    rateToUsd: 58.50,
    phonePlaceholder: '917 123 4567'
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    callingCode: '+7',
    currency: 'RUB',
    currencySymbol: '₽',
    rateToUsd: 97.50,
    phonePlaceholder: '912 345-67-89'
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    callingCode: '+64',
    currency: 'NZD',
    currencySymbol: 'NZ$',
    rateToUsd: 1.68,
    phonePlaceholder: '21 123 4567'
  }
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Bangladesh as default example requested

export function getCountryByCode(code: string): CountryInfo {
  return COUNTRIES.find(c => c.code === code) || DEFAULT_COUNTRY;
}

export function formatFiatAmount(amountUsd: number, countryCode: string = 'BD'): string {
  const country = getCountryByCode(countryCode);
  const localVal = amountUsd * country.rateToUsd;
  return `${country.currencySymbol} ${localVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${country.currency}`;
}
