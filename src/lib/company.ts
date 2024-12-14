import {
  CompanyInfo,
  GetAudioFileOptions,
  GetAudioFileResponse,
  GetCompanyOptions,
} from '../types/company';
import { EarningsEvent, EventsResponse } from '../types/event';
import { Transcript } from '../types/transcript';
import {
  getTranscript,
  getEvents,
  getSp500CompaniesTxtFile,
  downloadAudioFile,
  isDemoAccount,
} from './api';
import { camelCaseKeys } from './camel-case';
import {
  InsufficientApiAccessError,
  MissingApiKeyError,
  NotFoundError,
} from './errors';

import { EXCHANGES_IN_ORDER, getSymbols } from './symbols';

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
    const responseAsRecord = rawResponse as Record<string, unknown>;
    const snakeCasedObject = camelCaseKeys(responseAsRecord, { deep: true });
    const eventsResponse = snakeCasedObject as EventsResponse;
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

      const responseAsRecord = response as Record<string, unknown>;
      const snakeCasedObject = camelCaseKeys(responseAsRecord, { deep: true });
      const transcript = snakeCasedObject as Transcript;
      if (level === 3) {
        transcript.speakers?.forEach((speaker) => {
          speaker.text = speaker.words?.join(' ') || '';
        });
      }
      if (level >= 2 && level <= 3) {
        transcript.text =
          transcript.speakers?.map((spk) => spk.text).join(' ') || '';
      }
      if (level === 4) {
        transcript.text = `${transcript.preparedRemarks} ${transcript.questionsAndAnswers}`;
      }
      if (transcript.speakerNameMapV2) {
        for (const speaker of transcript.speakers || []) {
          const speakerLabel = speaker.speaker;
          if (transcript.speakerNameMapV2[speakerLabel]) {
            speaker.speakerInfo = transcript.speakerNameMapV2[speakerLabel];
          }
        }
      }
      return transcript;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return undefined; // Transcript not found
      }
      if (error instanceof InsufficientApiAccessError) {
        const planName = error.response.headers.get('X-Plan-Name');
        throw new InsufficientApiAccessError(
          `Your plan (${planName}) does not include Enhanced Transcript Data. Upgrade your plan here: https://earningscall.biz/api-pricing`,
          error.response,
        );
      }
      throw error;
    }
  }

  async getAudioFile(
    options: GetAudioFileOptions,
  ): Promise<GetAudioFileResponse> {
    const { year, quarter, outputFilePath } = options;
    try {
      const response = await downloadAudioFile(
        this.companyInfo.exchange,
        this.companyInfo.symbol,
        year,
        quarter,
        outputFilePath,
      );
      return response;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return {}; // Audio file not found
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
  const symbols = await getSymbols();
  if (exchange) {
    return symbols.get(exchange.toUpperCase(), symbol.toUpperCase()) || null;
  }

  for (const exchange of EXCHANGES_IN_ORDER) {
    const info = symbols.get(exchange, symbol.toUpperCase());
    if (info) {
      return info;
    }
  }

  if (isDemoAccount()) {
    throw new MissingApiKeyError(
      `"${symbol}" requires an API Key for access. To get your API Key, ` +
        'see: https://earningscall.biz/api-pricing',
    );
  }

  return null;
}

export async function getAllCompaniesInfos(): Promise<CompanyInfo[]> {
  const symbols = await getSymbols();
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
