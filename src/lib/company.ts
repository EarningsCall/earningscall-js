import {
  CompanyInfo,
  DownloadAudioFileOptions,
  DownloadAudioFileResponse,
  GetCompanyOptions,
  GetTranscriptFromEventOptions,
  GetTranscriptOptions,
} from '../types/company';
import { EarningsEvent, EventsResponse } from '../types/event';
import {
  BasicTranscript,
  SpeakerGroups,
  WordLevelTimestampsTranscript,
  QuestionAndAnswersTranscript,
} from '../types/transcript';
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

  /**
   * Get the events for the company.  Useful for getting the earnings events for a company.
   *
   * @returns A promise that resolves to an array of EarningsEvent objects.
   */
  private async getEvents(): Promise<EarningsEvent[]> {
    const rawResponse = await getEvents(
      this.companyInfo.exchange,
      this.companyInfo.symbol,
    );
    const responseAsRecord = rawResponse as Record<string, unknown>;
    const camelCasedObject = camelCaseKeys(responseAsRecord, { deep: true });
    const eventsResponse = camelCasedObject as EventsResponse;
    this.events_ = eventsResponse.events;
    return this.events_;
  }

  async events(): Promise<EarningsEvent[]> {
    return await this.getEvents();
  }

  validateTranscriptOptions(options: GetTranscriptOptions) {
    const { year, quarter } = options;

    if (year === undefined || quarter === undefined) {
      throw new Error('Must specify either event or year and quarter');
    }

    if (year < 1990 || year > 2030) {
      throw new Error('Invalid year. Must be between 1990 and 2030');
    }

    if (![1, 2, 3, 4].includes(quarter)) {
      throw new Error('Invalid quarter. Must be one of: {1,2,3,4}');
    }
  }

  getOptions(
    options: GetTranscriptOptions | GetTranscriptFromEventOptions,
  ): GetTranscriptOptions {
    if ((options as GetTranscriptFromEventOptions).event !== undefined) {
      const event = (options as GetTranscriptFromEventOptions).event;
      const { year, quarter } = event;
      return { year, quarter };
    }
    const { year, quarter } = options as GetTranscriptOptions;
    return { year, quarter };
  }

  /**
   * Retrieve a single transcript for this company.  This is the basic transcript with no speaker groups.
   *
   * @param options - The options for getting a transcript.
   * @returns A promise that resolves to a Transcript object or undefined if not found.
   */
  async getBasicTranscript(
    options: GetTranscriptOptions | GetTranscriptFromEventOptions,
  ): Promise<BasicTranscript | undefined> {
    const transcriptOptions: GetTranscriptOptions = this.getOptions(options);
    this.validateTranscriptOptions(transcriptOptions);
    const { year, quarter } = transcriptOptions;

    try {
      const response = await getTranscript(
        this.companyInfo.exchange,
        this.companyInfo.symbol,
        year,
        quarter,
        1,
      );
      const responseAsRecord = response as Record<string, unknown>;
      const camelCasedObject = camelCaseKeys(responseAsRecord, { deep: true });
      const transcript = camelCasedObject as BasicTranscript;
      return transcript;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return undefined; // Transcript not found
      }
      throw error;
    }
  }

  handleEnhancedTranscriptDataError(error: unknown) {
    if (error instanceof InsufficientApiAccessError) {
      const planName = error.response.headers.get('X-Plan-Name');
      throw new InsufficientApiAccessError(
        `Your plan (${planName}) does not include Enhanced Transcript Data. Upgrade your plan here: https://earningscall.biz/api-pricing`,
        error.response,
      );
    }
  }

  /**
   * Retrieve a single transcript for this company with speaker groups.
   *
   * Requires an Enhanced Transcript Data plan.
   *
   * @param options - The options for getting a transcript.
   * @returns A promise that resolves to a Transcript object or undefined if not found.
   */
  async getSpeakerGroups(
    options: GetTranscriptOptions | GetTranscriptFromEventOptions,
  ): Promise<SpeakerGroups | undefined> {
    const transcriptOptions: GetTranscriptOptions = this.getOptions(options);
    this.validateTranscriptOptions(transcriptOptions);
    const { year, quarter } = transcriptOptions;

    try {
      const response = await getTranscript(
        this.companyInfo.exchange,
        this.companyInfo.symbol,
        year,
        quarter,
        2,
      );

      const responseAsRecord = response as Record<string, unknown>;
      const camelCasedObject = camelCaseKeys(responseAsRecord, { deep: true });
      const transcript = camelCasedObject as SpeakerGroups;
      if (transcript.speakerNameMapV2) {
        for (const speaker of transcript.speakers) {
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
      this.handleEnhancedTranscriptDataError(error);
      throw error;
    }
  }

  /**
   * Retrieve a single transcript for this company with word level timestamps.
   *
   * Requires an Enhanced Transcript Data plan.
   *
   * @param options - The options for getting a transcript.
   * @returns A promise that resolves to a TranscriptV3 object or undefined if not found.
   */
  async getWordLevelTimestamps(
    options: GetTranscriptOptions | GetTranscriptFromEventOptions,
  ): Promise<WordLevelTimestampsTranscript | undefined> {
    const transcriptOptions: GetTranscriptOptions = this.getOptions(options);
    this.validateTranscriptOptions(transcriptOptions);
    const { year, quarter } = transcriptOptions;
    try {
      const response = await getTranscript(
        this.companyInfo.exchange,
        this.companyInfo.symbol,
        year,
        quarter,
        3,
      );
      const responseAsRecord = response as Record<string, unknown>;
      const camelCasedObject = camelCaseKeys(responseAsRecord, { deep: true });
      const transcript = camelCasedObject as WordLevelTimestampsTranscript;
      return transcript;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return undefined; // Transcript not found
      }
      this.handleEnhancedTranscriptDataError(error);
      throw error;
    }
  }

  /**
   * Retrieve a single transcript for this company with question and answer transcripts.
   *
   * Requires an Enhanced Transcript Data plan.
   *
   * @param options - The options for getting a transcript.
   * @returns A promise that resolves to a TranscriptV4 object or undefined if not found.
   */
  async getQuestionAndAnswerTranscript(
    options: GetTranscriptOptions | GetTranscriptFromEventOptions,
  ): Promise<QuestionAndAnswersTranscript | undefined> {
    const transcriptOptions: GetTranscriptOptions = this.getOptions(options);
    this.validateTranscriptOptions(transcriptOptions);
    const { year, quarter } = transcriptOptions;
    try {
      const response = await getTranscript(
        this.companyInfo.exchange,
        this.companyInfo.symbol,
        year,
        quarter,
        4,
      );
      const responseAsRecord = response as Record<string, unknown>;
      const camelCasedObject = camelCaseKeys(responseAsRecord, { deep: true });
      const transcript = camelCasedObject as QuestionAndAnswersTranscript;
      return transcript;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return undefined; // Transcript not found
      }
      this.handleEnhancedTranscriptDataError(error);
      throw error;
    }
  }

  /**
   * Downloads a single audio file for this company to disk.
   *
   * @param options - The options for getting an audio file.
   * @returns A promise that resolves to a GetAudioFileResponse object.
   */
  async downloadAudioFile(
    options: DownloadAudioFileOptions,
  ): Promise<DownloadAudioFileResponse | undefined> {
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
        return undefined;
      }
      throw error;
    }
  }
}

/**
 * Get a company by symbol and optionally, exchange.
 *
 * @param options - The options for getting a company.
 * @returns A promise that resolves to a Company object.
 */
export async function getCompany(options: GetCompanyOptions): Promise<Company> {
  const companyInfo = await lookupCompany(options);
  if (!companyInfo) {
    throw new Error(`Symbol not found: ${options.symbol}`);
  }
  return new Company(companyInfo);
}

export async function lookupCompany(
  options: GetCompanyOptions,
): Promise<CompanyInfo | undefined> {
  const { exchange, symbol } = options;
  const symbols = await getSymbols();
  if (exchange) {
    return symbols.get(exchange.toUpperCase(), symbol.toUpperCase());
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

  return undefined;
}

export async function getAllCompaniesInfos(): Promise<CompanyInfo[]> {
  const symbols = await getSymbols();
  return Array.from(symbols.getAll());
}

/**
 * Get all companies.
 *
 * @returns A promise that resolves to an array of Company objects.
 */
export async function getAllCompanies(): Promise<Company[]> {
  const infos = await getAllCompaniesInfos();
  return infos.map((info) => new Company(info));
}

/**
 * Get all S&P 500 companies.
 *
 * @returns A promise that resolves to an array of Company objects.
 */
export async function getSP500Companies(): Promise<Company[]> {
  const sp500CompaniesTxtFile = await getSp500CompaniesTxtFile();
  const symbols = sp500CompaniesTxtFile.split('\n').map((line) => line.trim());
  const companyPromises = symbols.map(async (symbol) => {
    try {
      return await getCompany({ symbol });
    } catch (error) {
      return null;
    }
  });
  const results = await Promise.all(companyPromises);
  // Filter out null values and explicitly type as Company[]
  return results.filter((company): company is Company => company !== null);
}
