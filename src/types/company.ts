import { EarningsEvent } from './event';

/**
 * Represents information about a company including its exchange listing,
 * symbol, name, and classification details.
 */
export type CompanyInfo = {
  exchange: string;
  symbol: string;
  name?: string;
  security_name?: string;
  sector?: string;
  industry?: string;
};

/**
 * Options for retrieving a company.
 */
export interface GetCompanyOptions {
  symbol: string;
  exchange?: string;
}

export interface DownloadAudioFileOptions {
  year: number;
  quarter: number;
  outputFilePath?: string;
}

export interface DownloadAudioFileResponse {
  outputFilePath?: string;
  contentLength?: number;
  contentType?: string;
  lastModified?: Date;
}

export interface GetTranscriptOptions {
  year: number;
  quarter: number;
}

export interface GetTranscriptFromEventOptions {
  event: EarningsEvent;
}
