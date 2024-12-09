import { CompanyInfo } from '../types/company';
import { getSymbolsV2 } from './api';
import {
  indexToIndustry,
  indexToSector,
  industryToIndex,
  sectorToIndex,
} from './sectors';

// WARNING: Add new indexes to the *END* of this list
export const EXCHANGES_IN_ORDER = [
  'NYSE',
  'NASDAQ',
  'AMEX',
  'TSX',
  'TSXV',
  'OTC',
  'LSE',
  'CBOE',
];

export function exchangeToIndex(exchange?: string): number {
  if (!exchange) {
    return -1;
  }
  try {
    return EXCHANGES_IN_ORDER.indexOf(exchange);
  } catch {
    return -1;
  }
}

export function indexToExchange(index: number): string {
  if (index === -1) {
    return 'UNKNOWN';
  }
  try {
    return EXCHANGES_IN_ORDER[index];
  } catch {
    return 'UNKNOWN';
  }
}

export const securityTypePattern: { [key: string]: RegExp } = {
  NASDAQ: / - .*$/,
  NYSE: / (Common Stock|Warrants)$/,
  AMEX: / (Common Stock|Warrants)$/,
};

type CompanyInfoData = {
  exchange?: string;
  symbol?: string;
  name?: string;
  securityName?: string;
  sector?: string;
  industry?: string;
};

export function createCompanyInfo(data: CompanyInfoData = {}): CompanyInfo & {
  toString: () => string;
  toJSON: () => string;
  toTxtRow: () => string[];
  toTxtV2Row: () => string[];
  exchangeSymbol: () => string;
} {
  return {
    ...data,
    toString: () => `(${data.exchange}: ${data.symbol} - ${data.name})`,
    toJSON: () => JSON.stringify(data),
    toTxtRow: () => [
      String(exchangeToIndex(data.exchange)),
      data.symbol || '',
      data.name || '',
    ],
    toTxtV2Row: () => [
      String(exchangeToIndex(data.exchange || '')),
      data.symbol || '',
      data.name || '',
      String(sectorToIndex(data.sector || '')),
      String(industryToIndex(data.industry || '')),
    ],
    exchangeSymbol: () => `${data.exchange}_${data.symbol}`,
  };
}

type SymbolsData = {
  exchanges: Set<string>;
  byName: Map<string, CompanyInfo>;
  byExchangeAndSym: Map<string, CompanyInfo>;
  size: number;
};

type SymbolsMethods = {
  add: (sym: CompanyInfo) => void;
  getAll: () => IterableIterator<CompanyInfo>;
  get: (exchange: string, symbol: string) => CompanyInfo | undefined;
  getExchangeSymbol: (exchangeSymbol: string) => CompanyInfo | undefined;
  lookupCompany: (symbol: string) => CompanyInfo | null;

  removeExchangeSymbol: (exchangeSymbol: string) => void;
  // withoutSecurityNames: () => any[];

  toDicts: () => any[];
  toJSON: (removeSecurityNames?: boolean) => string;
  toTxtV2: () => string;
  [Symbol.iterator]: () => IterableIterator<CompanyInfo>;
};

export type Symbols = SymbolsData & SymbolsMethods;

export function createSymbols(): Symbols {
  const exchanges = new Set<string>();
  const byName = new Map<string, CompanyInfo>();
  const byExchangeAndSym = new Map<string, CompanyInfo>();

  const add = (companyInfo: CompanyInfo) => {
    exchanges.add(companyInfo.exchange || '');
    const exchangeSymbol = `${companyInfo.exchange}_${companyInfo.symbol}`;
    byExchangeAndSym.set(exchangeSymbol, companyInfo);
    byName.set(companyInfo.name || '', companyInfo);
  };

  const getExchangeSymbol = (exchangeSymbol: string) => {
    const symbol = byExchangeAndSym.get(exchangeSymbol.toUpperCase());
    // if (!symbol) throw new Error(`Symbol not found: ${exchangeSymbol}`);
    return symbol;
  };

  const get = (exchange: string, symbol: string) =>
    getExchangeSymbol(`${exchange}_${symbol}`);

  return {
    exchanges,
    byName,
    byExchangeAndSym,
    add,
    getAll: function* () {
      yield* byExchangeAndSym.values();
    },
    getExchangeSymbol,
    get,
    lookupCompany: (symbol: string) =>
      EXCHANGES_IN_ORDER.reduce<CompanyInfo | null>((found, exchange) => {
        if (found) return found;
        try {
          const _symbol = get(exchange, symbol);
          return _symbol || null;
        } catch {
          return null;
        }
      }, null),
    removeExchangeSymbol: (exchangeSymbol: string) => {
      byExchangeAndSym.delete(exchangeSymbol.toUpperCase());
    },
    // withoutSecurityNames: () => [],
    toDicts: () => Array.from(byExchangeAndSym.values()),
    toJSON: (removeSecurityNames = false) =>
      JSON.stringify(removeSecurityNames ? [] : []),
    toTxtV2: () => '',
    get size() {
      return byExchangeAndSym.size;
    },
    [Symbol.iterator]: function* () {
      yield* byExchangeAndSym.values();
    },
  };
}

let symbols: Symbols | null = null;

export async function loadSymbols(): Promise<Symbols> {
  const symbolsV2 = await getSymbolsV2();
  if (!symbolsV2) {
    throw new Error('Failed to load symbols');
  }
  const symbols = createSymbols();
  symbolsV2
    .split('\n')
    .filter((line) => line.trim())
    .forEach((line) => {
      const [exchangeIndex, symbol, name, sectorIndex, industryIndex] =
        line.split('\t');
      const companyInfo = createCompanyInfo({
        exchange: indexToExchange(parseInt(exchangeIndex)),
        symbol,
        name,
        sector: indexToSector(parseInt(sectorIndex)),
        industry: indexToIndustry(parseInt(industryIndex)),
      });
      symbols.add(companyInfo);
    });
  return symbols;
}

export async function getSymbols(): Promise<Symbols> {
  if (!symbols) {
    symbols = await loadSymbols();
  }
  return symbols;
}

export function clearSymbols(): void {
  symbols = null;
}
