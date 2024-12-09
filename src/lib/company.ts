import log from 'loglevel';

import { CompanyInfo } from '../types/company.d';
import { EarningsEvent } from '../types/event.d';
import { Transcript } from '../types/transcript.d';
import { getTranscript } from './api';
import { InsufficientApiAccessError } from './errors';

import { EXCHANGES_IN_ORDER, loadSymbols } from './symbols';

// const log = Logger.getLogger(__filename);

// function isDemoAccount(): boolean {
//   // Implementation depends on your authentication system
//   return false; // placeholder
// }

export class Company {
  readonly companyInfo: CompanyInfo;
  readonly name?: string;
  // private readonly events_?: EarningsEvent[];

  constructor(companyInfo: CompanyInfo) {
    this.companyInfo = companyInfo;
    this.name = companyInfo.name;
    // this.events_ = undefined;
  }

  toString(): string {
    return String(this.name);
  }

  //   private getEvents(): EarningsEvent[] {
  //     if (!this.companyInfo.exchange || !this.companyInfo.symbol) {
  //       return [];
  //     }
  //     const rawResponse = api.getEvents(this.companyInfo.exchange, this.companyInfo.symbol);
  //     if (!rawResponse) {
  //       return [];
  //     }
  //     return rawResponse.events.map(event => EarningsEvent.fromDict(event));
  //   }

  //   events(): EarningsEvent[] {
  //     if (!this.events_) {
  //       this.events_ = this.getEvents();
  //     }
  //     return this.events_;
  //   }

  async getTranscript(
    year?: number,
    quarter?: number,
    event?: EarningsEvent,
  ): Promise<Transcript | undefined> {
    log.info(`Downloading audio file for ${this.companyInfo.symbol} ${event}`);

    if (!this.companyInfo.exchange || !this.companyInfo.symbol) {
      return undefined;
    }

    if ((!year || !quarter) && event) {
      year = event.year;
      quarter = event.quarter;
    }

    if (!year || !quarter) {
      throw new Error('Must specify either event or year and quarter');
    }

    if (quarter < 1 || quarter > 4) {
      throw new Error('Invalid level. Must be one of: {1,2,3,4}');
    }

    try {
      const resp = await getTranscript(
        this.companyInfo.exchange,
        this.companyInfo.symbol,
        year,
        quarter,
        1,
      );
      const blah: Transcript = resp as Transcript;
      return blah;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return undefined;
      }
      if (error.response?.status === 403) {
        const planName = error.response.headers['X-Plan-Name'];
        const errorMessage =
          `Your plan (${planName}) does not include Audio Files. ` +
          'Upgrade your plan here: https://earningscall.biz/api-pricing';
        log.error(errorMessage);
        throw new InsufficientApiAccessError(errorMessage);
      }
      throw error;
    }
  }
}

export async function getCompany(symbol: string) {
  const companyInfo = await lookupCompany({ symbol });
  if (!companyInfo) {
    throw new Error(`Company not found: ${symbol}`);
  }
  return new Company(companyInfo);
}

export interface lookupCompanyOptions {
  symbol: string;
  exchange?: string;
}

export async function lookupCompany(
  options: lookupCompanyOptions,
): Promise<CompanyInfo | null> {
  const { exchange, symbol } = options;
  const symbols = await loadSymbols();
  if (exchange) {
    return symbols.get(exchange.toUpperCase(), symbol.toUpperCase()) || null;
  }

  for (const exchange of EXCHANGES_IN_ORDER) {
    const info = symbols.get(exchange, symbol.toUpperCase());
    if (info) {
      return info;
    }
  }
  return null;

  // if (isDemoAccount() && !symbolInfo) {
  //   throw new InsufficientApiAccessError(
  //     `"${symbol}" requires an API Key for access. To get your API Key, ` +
  //       'see: https://earningscall.biz/api-pricing'
  //   );
  // }

  // return symbolInfo || null;
}
