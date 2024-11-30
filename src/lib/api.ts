const DOMAIN = 'earningscall.biz';
const API_BASE = `https://v2.api.${DOMAIN}`;

// let earningscall: any = {}; // Assuming earningscall is a global object

function getApiKey(): string {
  // if (earningscall.api_key) {
  //   return earningscall.api_key;
  // }
  return process.env.ECALL_API_KEY || 'demo';
}

function apiKeyParam(): { apikey: string } {
  return { apikey: getApiKey() };
}

function isDemoAccount(): boolean {
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

// function getEarningsCallVersion(): string | null {
//   try {
//     return require('../package.json').version;
//   } catch (error) {
//     return null;
//   }
// }

function getHeaders(): { [key: string]: string } {
  const earningsCallVersion = '0.0.1'; // getEarningsCallVersion();
  return {
    'User-Agent': `EarningsCall TypeScript/${earningsCallVersion}`,
    'X-EarningsCall-Version': earningsCallVersion || '',
  };
}

async function doGet(
  path: string,
  params: Record<string, string> = {}
): Promise<Response> {
  const finalParams = {
    ...apiKeyParam(),
    ...params,
  };
  const queryParams = new URLSearchParams(finalParams).toString();
  const url = `${API_BASE}/${path}?${queryParams}`;
  return fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
}

async function getEvents(exchange: string, symbol: string): Promise<unknown> {
  console.log(`get_events exchange: ${exchange} symbol: ${symbol}`);
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

async function getTranscript(
  exchange: string,
  symbol: string,
  year: number,
  quarter: number,
  level: number | null = null
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

async function getSymbolsV2(): Promise<string | null> {
  const response = await doGet('symbols-v2.txt', {});
  if (response.status !== 200) {
    return null;
  }
  return response.text();
}

async function getSp500CompaniesTxtFile(): Promise<string | null> {
  console.log('get_sp500_companies_txt_file');
  const response = await doGet('symbols/sp500.txt', {});
  if (response.status !== 200) {
    return null;
  }
  return response.text();
}

// async function downloadAudioFile(
//   exchange: string,
//   symbol: string,
//   year: number,
//   quarter: number,
//   fileName?: string
// ): Promise<string | null> {
//   const params = {
//     ...apiKeyParam(),
//     exchange,
//     symbol,
//     year: year.toString(),
//     quarter: quarter.toString(),
//   };
//   const localFilename =
//     fileName || `${exchange}_${symbol}_${year}_${quarter}.mp3`;

//   try {
//     const queryParams = new URLSearchParams(params).toString();
//     const response = await fetch(`${API_BASE}/audio?${queryParams}`, {
//       headers: getHeaders()
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const writer = fs.createWriteStream(localFilename);
//     const buffer = await response.arrayBuffer();
//     const uint8Array = new Uint8Array(buffer);
//     writer.write(uint8Array);

//     return new Promise((resolve, reject) => {
//       writer.on('finish', () => resolve(localFilename));
//       writer.on('error', reject);
//     });
//   } catch (error) {
//     console.error('Error downloading audio file:', error);
//     return null;
//   }
// }

export {
  getApiKey,
  apiKeyParam,
  isDemoAccount,
  getHeaders,
  doGet,
  getEvents,
  getTranscript,
  getSymbolsV2,
  getSp500CompaniesTxtFile,
};
