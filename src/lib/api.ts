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
  return process.env.ECALL_API_KEY || 'demo';
}

export function apiKeyParam(): { apikey: string } {
  return { apikey: getApiKey() };
}

export function isDemoAccount(): boolean {
  return getApiKey() === 'demo';
}

// function cacheSession() {
//   const cache = setupCache({
//     maxAge: 15 * 60 * 1000,
//     exclude: { query: false },
//     store: {
//       set: async (key, value) => {
//         // Implement cache storage
//       },
//       get: async (key) => {
//         // Implement cache retrieval
//       },
//       remove: async (key) => {
//         // Implement cache removal
//       },
//       clear: async () => {
//         // Implement cache clearing
//       },
//     },
//   });

//   return axios.create({
//     adapter: cache.adapter,
//   });
// }

// function cachedUrls(): string[] {
//   // Implement cached URLs retrieval
//   return [];
// }

// function purgeCache(): void {
//   // Implement cache purging
// }

function getHeaders(): { [key: string]: string } {
  const earningsCallVersion = LIB_VERSION;
  return {
    'User-Agent': `EarningsCall TypeScript/${earningsCallVersion}`,
    'X-EarningsCall-Version': earningsCallVersion || '',
  };
}

export async function doGet(
  path: string,
  params: Record<string, string> = {},
): Promise<Response> {
  const finalParams = {
    ...apiKeyParam(),
    ...params,
  };
  const queryParams = new URLSearchParams(finalParams).toString();
  const url = `${API_BASE}/${path}?${queryParams}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (response.status === 401) {
    throw new UnauthorizedError('Unauthorized', response);
  }
  if (response.status === 404) {
    throw new NotFoundError('Not found', response);
  }
  if (response.status === 403) {
    throw new InsufficientApiAccessError('Insufficient API access', response);
  }
  if (response.status === 429) {
    throw new TooManyRequestsError('Too many requests', response);
  }
  if (response.status === 400) {
    throw new BadRequestError('Bad request', response);
  }
  if (response.status === 500) {
    throw new InternalServerError('Internal server error', response);
  }
  if (response.status !== 200) {
    throw new UnexpectedError(
      `HTTP error! status: ${response.status}`,
      response,
    );
  }
  return response;
}

export async function getEvents(
  exchange: string,
  symbol: string,
): Promise<unknown> {
  // console.log(`get_events exchange: ${exchange} symbol: ${symbol}`);
  const params = {
    exchange,
    symbol,
  };
  const response = await doGet('events', params);
  if (response.status !== 200) {
    return null;
  }
  return response.json();
}

export async function getTranscript(
  exchange: string,
  symbol: string,
  year: number,
  quarter: number,
  level: number | null = null,
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

export async function getSymbolsV2(): Promise<string | null> {
  const response = await doGet('symbols-v2.txt', {});
  if (response.status !== 200) {
    return null;
  }
  return response.text();
}

export async function getSp500CompaniesTxtFile(): Promise<string | null> {
  // console.log('get_sp500_companies_txt_file');
  const response = await doGet('symbols/sp500.txt', {});
  if (response.status !== 200) {
    return null;
  }
  return response.text();
}

export async function downloadAudioFile(
  exchange: string,
  symbol: string,
  year: number,
  quarter: number,
  fileName?: string,
): Promise<string | null> {
  const params = {
    ...apiKeyParam(),
    exchange,
    symbol,
    year: year.toString(),
    quarter: quarter.toString(),
  };
  const localFilename =
    fileName || `${exchange}_${symbol}_${year}_${quarter}.mp3`;

  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/audio?${queryParams}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const writer = fs.createWriteStream(localFilename);
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    writer.write(uint8Array);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(localFilename));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading audio file:', error);
    return null;
  }
}
