import { CompanyInfo } from '../types/company';
import { getSymbolsV2 } from './api';
import { indexToIndustry, indexToSector } from './sectors';

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

export function indexToExchange(index: number): string {
  if (index < 0 || index >= EXCHANGES_IN_ORDER.length) {
    return 'UNKNOWN';
  }
  return EXCHANGES_IN_ORDER[index];
}

export class Symbols {
  expiresDate: Date | null = null;
  lastModified: Date | null = null;
  cacheControlExpires: string | null = null;

  private exchanges = new Set<string>();
  private byName = new Map<string, CompanyInfo>();
  private byExchangeAndSym = new Map<string, CompanyInfo>();

  add = (companyInfo: CompanyInfo) => {
    this.exchanges.add(companyInfo.exchange || '');
    const exchangeSymbol = `${companyInfo.exchange}_${companyInfo.symbol}`;
    this.byExchangeAndSym.set(exchangeSymbol, companyInfo);
    this.byName.set(companyInfo.name || '', companyInfo);
  };

  getExchangeSymbol = (exchangeSymbol: string) => {
    const symbol = this.byExchangeAndSym.get(exchangeSymbol.toUpperCase());
    // if (!symbol) throw new Error(`Symbol not found: ${exchangeSymbol}`);
    return symbol;
  };

  get = (exchange: string, symbol: string) =>
    this.getExchangeSymbol(`${exchange}_${symbol}`);

  getAll = function* (this: Symbols) {
    yield* this.byExchangeAndSym.values();
  };
}

let symbols: Symbols | null = null;

/**
 * Loads the symbols from the API and returns a Symbols object.
 *
 * @returns {Promise<Symbols>} The Symbols object.
 */
export async function loadSymbols(): Promise<Symbols> {
  const symbolsV2Response = await getSymbolsV2();
  const responseHeaders = symbolsV2Response.headers;
  const lastModified = new Date(responseHeaders.get('Last-Modified') || '');
  const cacheControl = responseHeaders.get('Cache-Control');
  const cacheControlMaxAge = cacheControl?.match(/max-age=(\d+)/)?.[1];
  const cacheControlExpires = cacheControl?.match(/expires=(\d+)/)?.[1];
  // By default, we cache the symbols for 1 day
  // Otherwise, we use the Cache-Control header to determine the expiration date (max-age)
  const expiresDate = new Date(
    Date.now() + parseInt(cacheControlMaxAge || '86400') * 1000,
  );
  const symbolsV2Text = await symbolsV2Response.text();
  const symbols = new Symbols();
  symbols.expiresDate = expiresDate;
  symbols.lastModified = lastModified;
  symbols.cacheControlExpires = cacheControlExpires || null;
  symbolsV2Text
    .split('\n')
    .filter((line) => line.trim())
    .forEach((line) => {
      const [exchangeIndex, symbol, name, sectorIndex, industryIndex] =
        line.split('\t');
      const companyInfo = {
        exchange: indexToExchange(parseInt(exchangeIndex)),
        symbol,
        name,
        sector: indexToSector(parseInt(sectorIndex)),
        industry: indexToIndustry(parseInt(industryIndex)),
      };
      symbols.add(companyInfo);
    });
  return symbols;
}

/**
 * Returns the symbols object. If the symbols object is not loaded, it will load it.
 *
 * @returns {Promise<Symbols>} The Symbols object.
 */
export async function getSymbols(): Promise<Symbols> {
  if (!symbols) {
    symbols = await loadSymbols();
  }
  if (symbols.expiresDate && symbols.expiresDate < new Date()) {
    symbols = await loadSymbols();
  }
  return symbols;
}

/**
 * Clears the symbols object.
 *
 * Forces a reload of the symbols from the API next time getSymbols is called.
 */
export function clearSymbols(): void {
  symbols = null;
}
