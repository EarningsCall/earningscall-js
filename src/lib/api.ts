import fs from 'fs';
import { LIB_VERSION } from './version';
import {
  BadRequestError,
  InsufficientApiAccessError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnexpectedError,
} from './errors';
import { GetAudioFileResponse } from '../types';

const DOMAIN = 'earningscall.biz';
const API_BASE = `https://v2.api.${DOMAIN}`;

let _apiKey: string | undefined;

export function setApiKey(apiKey: string | undefined): void {
  _apiKey = apiKey;
}

export function getApiKey(): string {
  if (_apiKey !== undefined) {
    return _apiKey;
  }
  return (
    process.env.ECALL_API_KEY || process.env.EARNINGSCALL_API_KEY || 'demo'
  );
}

export function apiKeyParam(): { apikey: string } {
  return { apikey: getApiKey() };
}

export function isDemoAccount(): boolean {
  return getApiKey() === 'demo';
}

function getHeaders(): { [key: string]: string } {
  const earningsCallVersion = LIB_VERSION;
  return {
    'User-Agent': `EarningsCall TypeScript/${earningsCallVersion}`,
    'X-EarningsCall-Version': earningsCallVersion,
  };
}

export function handleErrorStatusCodes(response: Response) {
  if (response.status === 401) {
    throw new UnauthorizedError(response);
  }
  if (response.status === 404) {
    throw new NotFoundError(response);
  }
  if (response.status === 403) {
    throw new InsufficientApiAccessError(
      'Insufficient API access rights',
      response,
    );
  }
  if (response.status === 429) {
    throw new TooManyRequestsError(response);
  }
  if (response.status === 400) {
    throw new BadRequestError(response);
  }
  if (response.status === 500) {
    throw new InternalServerError(response);
  }
  if (response.status !== 200) {
    throw new UnexpectedError(
      `HTTP error status: ${response.status}`,
      response,
    );
  }
}

export async function doGet(
  path: string,
  params: Record<string, string>,
): Promise<Response> {
  const finalParams = {
    ...apiKeyParam(),
    ...params,
  };
  const url = new URL(`${API_BASE}/${path}`);
  Object.entries(finalParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  handleErrorStatusCodes(response);
  return response;
}

export async function getEvents(
  exchange: string,
  symbol: string,
): Promise<unknown> {
  const params = {
    exchange,
    symbol,
  };
  const response = await doGet('events', params);
  return response.json();
}

export async function getTranscript(
  exchange: string,
  symbol: string,
  year: number,
  quarter: number,
  level: number,
): Promise<unknown> {
  const params = {
    ...apiKeyParam(),
    exchange,
    symbol,
    year: year.toString(),
    quarter: quarter.toString(),
    level: (level || 1).toString(),
  };
  const response = await doGet('transcript', params);
  return response.json();
}

export async function getSymbolsV2(): Promise<Response> {
  const response = await doGet('symbols-v2.txt', {});
  return response;
}

export async function getSp500CompaniesTxtFile(): Promise<string> {
  const response = await doGet('symbols/sp500.txt', {});
  return response.text();
}

export async function downloadAudioFile(
  exchange: string,
  symbol: string,
  year: number,
  quarter: number,
  outputFilePath?: string,
): Promise<GetAudioFileResponse> {
  const params = {
    ...apiKeyParam(),
    exchange,
    symbol,
    year: year.toString(),
    quarter: quarter.toString(),
  };
  const localFilename =
    outputFilePath || `${exchange}_${symbol}_${year}_${quarter}.mp3`;
  const url = new URL(`${API_BASE}/audio`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  handleErrorStatusCodes(response);
  const responseHeaders = response.headers;
  const contentLength = Number(responseHeaders.get('Content-Length'));
  const contentType = responseHeaders.get('Content-Type');
  const lastModified = new Date(responseHeaders.get('Last-Modified') || '');

  const writer = fs.createWriteStream(localFilename);
  const buffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  writer.write(uint8Array);

  const result: GetAudioFileResponse = {
    outputFilePath: localFilename,
    contentLength,
    contentType: contentType || undefined,
    lastModified,
  };

  return new Promise((resolve, reject) => {
    writer.end(() => resolve(result));
    writer.on('error', reject);
  });
}
