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
  if (index === -1) {
    return 'UNKNOWN';
  }
  try {
    return EXCHANGES_IN_ORDER[index];
  } catch {
    return 'UNKNOWN';
  }
}

export class Symbols {
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

async function loadSymbols(): Promise<Symbols> {
  const symbolsV2 = await getSymbolsV2();
  if (!symbolsV2) {
    throw new Error('Failed to load symbols');
  }
  const symbols = new Symbols();
  symbolsV2
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

export async function getSymbols(): Promise<Symbols> {
  if (!symbols) {
    symbols = await loadSymbols();
  }
  return symbols;
}

export function clearSymbols(): void {
  symbols = null;
}
