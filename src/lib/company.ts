import { CompanyInfo, GetCompanyOptions } from '../types/company.d';
import { EarningsEvent, EventsResponse } from '../types/event.d';
import { Transcript } from '../types/transcript.d';
import { getTranscript, getEvents, getSp500CompaniesTxtFile } from './api';
import { InsufficientApiAccessError } from './errors';

import { EXCHANGES_IN_ORDER, loadSymbols } from './symbols';

// function isDemoAccount(): boolean {
//   // Implementation depends on your authentication system
//   return false; // placeholder
// }

interface GetTranscriptOptions {
  year?: number;
  quarter?: number;
  event?: EarningsEvent;
  level?: number;
}

export class Company {
  readonly companyInfo: CompanyInfo;
  readonly name?: string;
  private events_?: EarningsEvent[];

  constructor(companyInfo: CompanyInfo) {
    this.companyInfo = companyInfo;
    this.name = companyInfo.name;
    this.events_ = undefined;
  }

  toString(): string {
    return String(this.name);
  }

  private async getEvents(): Promise<EarningsEvent[]> {
    if (!this.companyInfo.exchange || !this.companyInfo.symbol) {
      return [];
    }
    const rawResponse = await getEvents(
      this.companyInfo.exchange,
      this.companyInfo.symbol,
    );
    if (!rawResponse) {
      return [];
    }
    const eventsResponse = rawResponse as EventsResponse;
    this.events_ = eventsResponse.events;
    return this.events_;
  }

  async events(): Promise<EarningsEvent[]> {
    return await this.getEvents();
  }

  async getTranscript(
    options: GetTranscriptOptions,
  ): Promise<Transcript | undefined> {
    if (!this.companyInfo.exchange || !this.companyInfo.symbol) {
      return undefined;
    }

    const { event } = options;

    const year = options.year || event?.year;
    const quarter =
      options.quarter === undefined ? event?.quarter : options.quarter;
    const level = options.level === undefined ? 1 : options.level;

    if (year === undefined || quarter === undefined) {
      throw new Error('Must specify either event or year and quarter');
    }

    if (year < 1990 || year > 2030) {
      throw new Error('Invalid year. Must be between 1990 and 2030');
    }

    if (![1, 2, 3, 4].includes(quarter)) {
      throw new Error('Invalid quarter. Must be one of: {1,2,3,4}');
    }

    if (![1, 2, 3, 4].includes(level)) {
      throw new Error('Invalid level. Must be one of: {1,2,3,4}');
    }

    try {
      const response = await getTranscript(
        this.companyInfo.exchange,
        this.companyInfo.symbol,
        year,
        quarter,
        level,
      );
      const transcript: Transcript = response as Transcript;
      if (level === 3) {
        transcript.speakers.forEach((speaker) => {
          speaker.text = speaker.words?.join(' ') || '';
        });
      }
      if (level >= 2 && level <= 3) {
        transcript.text = transcript.speakers.map((spk) => spk.text).join(' ');
      }
      if (transcript.speaker_name_map_v2) {
        for (const speaker of transcript.speakers) {
          const speakerLabel = speaker.speaker;
          if (transcript.speaker_name_map_v2[speakerLabel]) {
            speaker.speaker_info = transcript.speaker_name_map_v2[speakerLabel];
          }
        }
      }
      return transcript;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return undefined;
      }
      if (error.response?.status === 403) {
        const planName = error.response.headers['X-Plan-Name'];
        const errorMessage =
          `Your plan (${planName}) does not include Audio Files. ` +
          'Upgrade your plan here: https://earningscall.biz/api-pricing';
        throw new InsufficientApiAccessError(errorMessage);
      }
      throw error;
    }
  }
}

export async function getCompany(options: GetCompanyOptions): Promise<Company> {
  const companyInfo = await lookupCompany(options);
  if (!companyInfo) {
    throw new Error(`Symbol not found: ${options.symbol}`);
  }
  return new Company(companyInfo);
}

export async function lookupCompany(
  options: GetCompanyOptions,
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

export async function getAllCompaniesInfos(): Promise<CompanyInfo[]> {
  const symbols = await loadSymbols();
  return Array.from(symbols.getAll());
}

export async function getAllCompanies(): Promise<Company[]> {
  const infos = await getAllCompaniesInfos();
  return infos.map((info) => new Company(info));
}

export async function getSP500Companies(): Promise<Company[]> {
  const sp500CompaniesTxtFile = await getSp500CompaniesTxtFile();
  if (!sp500CompaniesTxtFile) {
    return [];
  }
  const symbols = sp500CompaniesTxtFile.split('\n').map((line) => line.trim());
  const companies = await Promise.all(
    symbols.map((symbol) => getCompany({ symbol })),
  );
  return companies;
}
