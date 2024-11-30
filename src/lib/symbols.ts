import log from 'loglevel';

import { getSymbolsV2 } from './api';
import {
  indexToIndustry,
  indexToSector,
  industryToIndex,
  sectorToIndex,
} from './sectors';

// WARNING: Add new indexes to the *END* of this list
const EXCHANGES_IN_ORDER = [
  'NYSE',
  'NASDAQ',
  'AMEX',
  'TSX',
  'TSXV',
  'OTC',
  'LSE',
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

type CompanyInfo = {
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
      String(exchangeToIndex(data.exchange)),
      data.symbol || '',
      data.name || '',
      String(sectorToIndex(data.sector)),
      String(industryToIndex(data.industry)),
    ],
    exchangeSymbol: () => `${data.exchange}_${data.symbol}`,
  };
}

type SymbolsData = {
  exchanges: Set<string>;
  byName: Map<string, Set<CompanyInfo>>;
  byExchangeAndSym: Map<string, CompanyInfo>;
  size: number;
};

type SymbolsMethods = {
  // eslint-disable-next-line functional/no-return-void
  add: (sym: CompanyInfo) => void;
  getAll: () => IterableIterator<CompanyInfo>;
  get: (exchange: string, symbol: string) => CompanyInfo;
  getExchangeSymbol: (exchangeSymbol: string) => CompanyInfo;
  lookupCompany: (symbol: string) => CompanyInfo | null;
  // eslint-disable-next-line functional/no-return-void
  removeExchangeSymbol: (exchangeSymbol: string) => void;
  // withoutSecurityNames: () => any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toDicts: () => any[];
  toJSON: (removeSecurityNames?: boolean) => string;
  toTxtV2: () => string;
  [Symbol.iterator]: () => IterableIterator<CompanyInfo>;
};

type Symbols = SymbolsData & SymbolsMethods;

export function createSymbols(): Symbols {
  const exchanges = new Set<string>();
  const byName = new Map<string, Set<CompanyInfo>>();
  const byExchangeAndSym = new Map<string, CompanyInfo>();

  const add = (sym: CompanyInfo) => {
    log.info(sym);
    // byExchangeAndSym.set(sym.exchangeSymbol(), sym);
    // byName.set(sym.name, sym);
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

// eslint-disable-next-line functional/no-let
let symbols: Symbols | null = null;

export async function loadSymbols(): Promise<Symbols> {
  log.debug('Loading symbols');
  const symbolsV2 = await getSymbolsV2();
  // if (!symbolsV2) {
  //   throw new Error('Failed to load symbols');
  // }
  const symbols = createSymbols();
  return symbolsV2
    .split('\n')
    .filter((line) => line.trim())
    .reduce((acc, line) => {
      const [exchangeIndex, symbol, name, sectorIndex, industryIndex] =
        line.split('\t');
      acc.add(
        createCompanyInfo({
          exchange: indexToExchange(parseInt(exchangeIndex)),
          symbol,
          name,
          sector: indexToSector(parseInt(sectorIndex)),
          industry: indexToIndustry(parseInt(industryIndex)),
        })
      );
      return acc;
    }, symbols);
}

export async function getSymbols(): Promise<Symbols> {
  if (!symbols) {
    symbols = await loadSymbols();
  }
  return symbols;
}

// eslint-disable-next-line functional/no-return-void
export function clearSymbols(): void {
  symbols = null;
  log.info('Symbols cleared');
}

export { CompanyInfo, Symbols };
