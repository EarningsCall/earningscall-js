import { describe, test } from '@jest/globals';
import { getCompany } from './company';

const symbolsResponseText =
  '1\tABC\tABC Test Company Inc.\t9\t30\n1\tDEF\tDEF Test Company Inc.\t9\t122';

const transcriptResponseText = {
  event: {
    year: 2022,
    quarter: 1,
    conference_date: '2022-01-01',
    conference_url: 'https://example.com/abc-test-company-inc-earnings-call',
  },
  text: 'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call.',
};

beforeAll(() => {
  global.fetch = jest.fn((url: string) => {
    if (url === 'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo') {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(symbolsResponseText),
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => transcriptResponseText,
      });
    }

    return Promise.reject(new Error(`Unhandled request: ${url}`));
  }) as jest.Mock;
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('company', () => {
  test('getCompany', async () => {
    const company = await getCompany('ABC');
    expect(company.name).toBe('ABC Test Company Inc.');
    expect(company.companyInfo.exchange).toBe('NASDAQ');
    expect(company.companyInfo.symbol).toBe('ABC');
    expect(company.companyInfo.sector).toBe('Technology');
    expect(company.companyInfo.industry).toBe('Consumer Electronics');
    expect(company.toString()).toBe('ABC Test Company Inc.');

    const company2 = await getCompany('DEF');
    expect(company2.name).toBe('DEF Test Company Inc.');
    expect(company2.companyInfo.exchange).toBe('NASDAQ');
    expect(company2.companyInfo.symbol).toBe('DEF');
    expect(company2.companyInfo.sector).toBe('Technology');
    expect(company2.companyInfo.industry).toBe('Software - Infrastructure');
    expect(company2.toString()).toBe('DEF Test Company Inc.');
  });

  test('getCompany 2', async () => {
    const company = await getCompany('ABC');

    const transcript = await company.getTranscript(2022, 1);

    expect(transcript.event.year).toBe(2022);
    expect(transcript.event.quarter).toBe(1);
    expect(transcript.event.conference_date).toBe('2022-01-01');
    expect(transcript.text).toBe(
      'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call.',
    );
  });
});

// const symbolsResponseText =
//   '1\tAAPL\tApple Inc.\t9\t30\n1\tMSFT\tMicrosoft Corporation\t9\t122';

// test.before(() => {
//   global.fetch = ((url: string) => {
//     if (url === 'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo') {
//       return {
//         status: 200,
//         text: () => symbolsResponseText,
//       };
//     }
//     // if (url === 'https://v2.api.earningscall.biz/somethingelse?apikey=demo') {
//     //   return Promise.resolve({
//     //     status: 200,
//     //     text: () => symbolsResponseText,
//     //   }) as Response;
//     // }
//     return Promise.reject(new Error(`Unhandled request: ${url}`));
//   }) as typeof global.fetch;
// });

// test.after(() => {
//   delete (global as typeof globalThis).fetch;
// });

// // test('getCompany2', async (t) => {
// //   const company = await getCompany('AAPL');
// //   t.is(company.name, 'Apple Inc.');
// //   t.is(company.companyInfo.exchange, 'NASDAQ');
// //   t.is(company.companyInfo.symbol, 'AAPL');
// //   t.is(company.companyInfo.sector, 'Technology');
// //   t.is(company.companyInfo.industry, 'Consumer Electronics');
// //   t.is(company.toString(), 'Apple Inc.');
// // });
