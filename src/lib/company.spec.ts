import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

import { describe, test } from '@jest/globals';
import {
  clearSymbols,
  getAllCompanies,
  getCompany,
  getSP500Companies,
  GetTranscriptOptions,
  setApiKey,
} from '../index';

const symbolsResponseText =
  '1\tABC\tABC Test Company Inc.\t9\t30\n1\tDEF\tDEF Test Company Inc.\t9\t122';

const demoSymbolsMock = {
  url: 'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo',
  result: {
    ok: true,
    status: 200,
    text: () => Promise.resolve(symbolsResponseText),
    headers: new Headers({}),
  },
};

const eventsResponseJson = {
  company_name: 'Apple Inc.',
  events: [
    {
      year: 2024,
      quarter: 4,
      conference_date: '2024-10-31T17:00:00.000-04:00',
    },
    {
      year: 2024,
      quarter: 3,
      conference_date: '2024-08-01T17:00:00.000-04:00',
    },
    {
      year: 2024,
      quarter: 2,
      conference_date: '2024-05-02T17:00:00.000-04:00',
    },
    {
      year: 2024,
      quarter: 1,
      conference_date: '2024-02-01T17:00:00.000-05:00',
    },
    {
      year: 2023,
      quarter: 4,
      conference_date: '2023-11-03T17:00:00.000-04:00',
    },
    {
      year: 2023,
      quarter: 3,
      conference_date: '2023-08-03T17:00:00.000-04:00',
    },
    {
      year: 2023,
      quarter: 2,
      conference_date: '2023-05-04T14:00:00.000-07:00',
    },
    {
      year: 2023,
      quarter: 1,
      conference_date: '2023-02-02T17:00:00.000-05:00',
    },
  ],
};

const transcriptResponseJson = {
  event: {
    year: 2022,
    quarter: 1,
    conference_date: '2022-01-01',
  },
  text: 'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call.',
};

const transcriptLevel2ResponseJson = {
  event: {
    year: 2022,
    quarter: 1,
    conference_date: '2022-01-01',
  },
  speakers: [
    {
      speaker: 'spk03',
      text: "Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call. Today's call is being recorded. Please go ahead.",
    },
    {
      speaker: 'spk15',
      text: 'Thank you. Good afternoon, and thank you for joining us. I am the awesome CEO John Smith.',
    },
  ],
  speaker_name_map_v2: {
    spk03: {
      name: 'Operator',
      title: 'Host',
    },
    spk15: {
      name: 'John Smith',
      title: 'CEO',
    },
  },
};

const transcriptLevel3ResponseJson = {
  event: {
    year: 2022,
    quarter: 1,
    conference_date: '2022-01-01',
  },
  speakers: [
    {
      speaker: 'spk03',
      words: [
        'Good',
        'day',
        'and',
        'welcome',
        'to',
        'the',
        'ABC',
        'Test',
        'Company',
        'Inc.',
        'Q1',
        'FY',
        '2022',
        'earnings',
        'conference',
        'call.',
      ],
    },
    {
      speaker: 'spk15',
      words: [
        'Thank',
        'you',
        'Good',
        'afternoon',
        'and',
        'thank',
        'you',
        'for',
        'joining',
        'us',
        'I',
        'am',
        'the',
        'awesome',
        'CEO',
        'John',
        'Smith.',
      ],
    },
  ],
};

const level4Response = {
  event: {
    year: 2022,
    quarter: 1,
    conference_date: '2022-01-01',
  },
  prepared_remarks:
    "Good day and welcome to the Apple Q1 FY 2022 earnings conference call. Today's call is being recorded. At this time, for opening remarks and introductions, I would like to turn the call over to Tejas Ghala, Director of Investor Relations and Corporate Finance. Please go ahead. Thank you. Good afternoon, and thank you for joining us. Speaking first today is Apple CEO Tim Cook, and he'll be followed by CFO Luca Maestri. After that, we'll open the call to questions from analysts.",
  questions_and_answers:
    "We'll take our first question from Katie Huberty with Morgan Stanley. Caller, please check your mute function. We're unable to hear you. Hearing no response, we'll take our next question from Wamsi Mohan with Bank of America. Yes, thank you. Your margins have clearly been very impressive. So I have one question each on product and one on services gross margins. On product gross margins, that's clearly benefiting from a very strong mix. So Tim, I'm curious,",
};

const sp500CompaniesTxtFile = 'ABC\nDEF';
const sp500CompaniesWithNonexistentSymbolsTxtFile =
  'ABC\nDEF\nDOESNOTEXIST\nDOESNOTEXIST2';

const setMockApiResponses = (mockApiResponses: any) => {
  global.fetch = jest.fn((url: URL) => {
    for (const mockApiResponse of mockApiResponses) {
      if (url.toString() === mockApiResponse.url) {
        return mockApiResponse.result;
      }
    }
    return Promise.reject(new Error(`Unhandled request: ${url}`));
  }) as jest.Mock;
};

beforeAll(() => {});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  setApiKey(undefined);
  clearSymbols();
});

describe('company', () => {
  test('getCompany non demo account throws InsufficientApiAccessError', async () => {
    setMockApiResponses([demoSymbolsMock]);
    await expect(getCompany({ symbol: 'XYZ' })).rejects.toThrow(
      '"XYZ" requires an API Key for access. To get your API Key, see: https://earningscall.biz/api-pricing',
    );
  });

  test('getCompany with invalid api key throws NotFoundError', async () => {
    setMockApiResponses([
      {
        url: 'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=INVALID_API_KEY',
        result: {
          ok: false,
          status: 401,
          headers: new Headers({}),
        },
      },
    ]);
    setApiKey('INVALID_API_KEY');
    await expect(getCompany({ symbol: 'ABC' })).rejects.toThrow('Unauthorized');
  });

  test('getCompany', async () => {
    setMockApiResponses([demoSymbolsMock]);
    const company = await getCompany({ symbol: 'ABC' });
    expect(company.name).toBe('ABC Test Company Inc.');
    expect(company.companyInfo.exchange).toBe('NASDAQ');
    expect(company.companyInfo.symbol).toBe('ABC');
    expect(company.companyInfo.sector).toBe('Technology');
    expect(company.companyInfo.industry).toBe('Consumer Electronics');
    expect(company.toString()).toBe('ABC Test Company Inc.');

    const company2 = await getCompany({ symbol: 'DEF' });
    expect(company2.name).toBe('DEF Test Company Inc.');
    expect(company2.companyInfo.exchange).toBe('NASDAQ');
    expect(company2.companyInfo.symbol).toBe('DEF');
    expect(company2.companyInfo.sector).toBe('Technology');
    expect(company2.companyInfo.industry).toBe('Software - Infrastructure');
    expect(company2.toString()).toBe('DEF Test Company Inc.');
  });

  test('getCompany by symbol and exchange', async () => {
    setMockApiResponses([demoSymbolsMock]);
    const company = await getCompany({ symbol: 'ABC', exchange: 'NASDAQ' });
    expect(company.name).toBe('ABC Test Company Inc.');
    expect(company.companyInfo.exchange).toBe('NASDAQ');
    expect(company.companyInfo.symbol).toBe('ABC');
  });

  test('get events', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/events?apikey=demo&exchange=NASDAQ&symbol=ABC',
        result: {
          ok: true,
          status: 200,
          json: () => eventsResponseJson,
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const events = await company.events();
    expect(events.length).toEqual(8);
    expect(events[0].year).toEqual(2024);
    expect(events[0].quarter).toEqual(4);
    expect(events[0].conferenceDate).toEqual('2024-10-31T17:00:00.000-04:00');
  });

  test('get transcript wrong api key', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=WRONG_API_KEY&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1',
        result: {
          ok: false,
          status: 401,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    setApiKey('WRONG_API_KEY');
    await expect(company.getBasicTranscript({ year: 2022, quarter: 1 })).rejects.toThrow(
      'Unauthorized',
    );
  });

  test('get transcript is missing', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1',
        result: {
          ok: true,
          status: 404,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const transcript = await company.getBasicTranscript({
      year: 2022,
      quarter: 1,
    });
    expect(transcript).toBeUndefined();
  });

  test('get speaker groups http 429 too many requests', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=2',
        result: {
          ok: false,
          status: 429,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    await expect(company.getSpeakerGroups({ year: 2022, quarter: 1 })).rejects.toThrow(
      'Too many requests',
    );
  });

  test('get speaker groups not found', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=2',
        result: {
          ok: true,
          status: 404,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const transcript = await company.getSpeakerGroups({
      year: 2022,
      quarter: 1,
    });
    expect(transcript).toBeUndefined();
  });

  test('get speaker groups not authorized', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=2',
        result: {
          ok: false,
          status: 403,
          headers: new Headers({
            'x-plan-name': 'basic',
          }),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    await expect(
      company.getSpeakerGroups({ year: 2022, quarter: 1 }),
    ).rejects.toThrow(
      'Your plan (basic) does not include Enhanced Transcript Data. Upgrade your plan here: https://earningscall.biz/api-pricing',
    );
  });

  test('get transcript by passing event', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1',
        result: {
          ok: true,
          status: 200,
          json: () => transcriptResponseJson,
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const transcript = await company.getBasicTranscript({
      event: { year: 2022, quarter: 1, conferenceDate: '2022-01-01' },
    });
    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.event.conferenceDate).toBe('2022-01-01');
  });

  test('get word level timestamps not found', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=3',
        result: {
          ok: true,
          status: 404,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const transcript = await company.getWordLevelTimestamps({
      year: 2022,
      quarter: 1,
    });
    expect(transcript).toBeUndefined();
  });

  test('get word level timestamps not authorized', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=3',
        result: {
          ok: false,
          status: 403,
          headers: new Headers({
            'x-plan-name': 'basic',
          }),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    await expect(
      company.getWordLevelTimestamps({ year: 2022, quarter: 1 }),
    ).rejects.toThrow(
      'Your plan (basic) does not include Enhanced Transcript Data. Upgrade your plan here: https://earningscall.biz/api-pricing',
    );
  });

  test('get question and answer not authorized', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=BASIC_PLAN_API_KEY&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=4',
        result: {
          ok: false,
          status: 403,
          headers: new Headers({
            'x-plan-name': 'basic',
          }),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    setApiKey('BASIC_PLAN_API_KEY');
    await expect(
      company.getQuestionAndAnswerTranscript({
        year: 2022,
        quarter: 1,
      }),
    ).rejects.toThrow(
      'Your plan (basic) does not include Enhanced Transcript Data. Upgrade your plan here: https://earningscall.biz/api-pricing',
    );
  });

  test('get basic transcript validates parameters', async () => {
    setMockApiResponses([demoSymbolsMock]);
    const company = await getCompany({ symbol: 'ABC' });
    const options = {
      year: undefined,
      quarter: undefined,
    } as unknown as GetTranscriptOptions;

    await expect(company.getBasicTranscript(options)).rejects.toThrow(
      'Must specify either event or year and quarter',
    );

    await expect(
      company.getBasicTranscript({ year: 2022, quarter: 0 }),
    ).rejects.toThrow('Invalid quarter. Must be one of: {1,2,3,4}');

    await expect(
      company.getBasicTranscript({ year: 1989, quarter: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');

    await expect(
      company.getBasicTranscript({ year: 2031, quarter: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');
  });

  test('get basic transcript success', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1',
        result: {
          ok: true,
          status: 200,
          json: () => transcriptResponseJson,
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const options = {
      year: undefined,
      quarter: undefined,
    } as unknown as GetTranscriptOptions;

    await expect(company.getBasicTranscript(options)).rejects.toThrow(
      'Must specify either event or year and quarter',
    );

    await expect(
      company.getBasicTranscript({ year: 2022, quarter: 0 }),
    ).rejects.toThrow('Invalid quarter. Must be one of: {1,2,3,4}');

    await expect(
      company.getBasicTranscript({ year: 1989, quarter: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');

    await expect(
      company.getBasicTranscript({ year: 2031, quarter: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');

    const transcript = await company.getBasicTranscript({
      year: 2022,
      quarter: 1,
    });

    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.event.conferenceDate).toBe('2022-01-01');
    expect(transcript?.text).toBe(
      'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call.',
    );
  });

  test('get transcript with custom api key', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=My+Custom+API+Key',
        result: {
          ok: true,
          status: 200,
          text: () => Promise.resolve(symbolsResponseText),
          headers: new Headers({}),
        },
      },
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=My+Custom+API+Key&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1',
        result: {
          ok: true,
          status: 200,
          json: () => transcriptResponseJson,
        },
      },
    ]);
    setApiKey('My Custom API Key');
    const company = await getCompany({ symbol: 'ABC' });
    const transcript = await company.getBasicTranscript({
      year: 2022,
      quarter: 1,
    });
    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.event.conferenceDate).toBe('2022-01-01');
  });

  test('get transcript level 2', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=2',
        result: {
          ok: true,
          status: 200,
          json: () => transcriptLevel2ResponseJson,
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });

    const transcript = await company.getSpeakerGroups({
      year: 2022,
      quarter: 1,
    });

    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.event.conferenceDate).toBe('2022-01-01');
    expect(transcript?.speakers[0].speakerInfo?.name).toBe('Operator');
    expect(transcript?.speakers[0].speakerInfo?.title).toBe('Host');
    expect(transcript?.speakers[0].text).toBe(
      "Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call. Today's call is being recorded. Please go ahead.",
    );
    expect(transcript?.speakers[1].speakerInfo?.name).toBe('John Smith');
    expect(transcript?.speakers[1].speakerInfo?.title).toBe('CEO');
    expect(transcript?.speakers[1].text).toBe(
      'Thank you. Good afternoon, and thank you for joining us. I am the awesome CEO John Smith.',
    );
  });

  test('get transcript level 2 not found', async () => {
    const company = await getCompany({ symbol: 'ABC' });

    const transcript = await company.getSpeakerGroups({
      year: 2022,
      quarter: 1,
    });

    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.event.conferenceDate).toBe('2022-01-01');
    expect(transcript?.speakers[0].speakerInfo?.name).toBe('Operator');
    expect(transcript?.speakers[0].speakerInfo?.title).toBe('Host');
    expect(transcript?.speakers[1].speakerInfo?.name).toBe('John Smith');
    expect(transcript?.speakers[1].speakerInfo?.title).toBe('CEO');
  });


  test('get transcript level 3 http 429 too many requests', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=3',
        result: {
          ok: false,
          status: 429,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    await expect(
      company.getWordLevelTimestamps({ year: 2022, quarter: 1 }),
    ).rejects.toThrow('Too many requests');
  });

  test('get transcript level 3', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=3',
        result: {
          ok: true,
          status: 200,
          json: () => transcriptLevel3ResponseJson,
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });

    const transcript = await company.getWordLevelTimestamps({
      year: 2022,
      quarter: 1,
    });

    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.event.conferenceDate).toBe('2022-01-01');
    expect(transcript?.speakers[0].words).toEqual([
      'Good',
      'day',
      'and',
      'welcome',
      'to',
      'the',
      'ABC',
      'Test',
      'Company',
      'Inc.',
      'Q1',
      'FY',
      '2022',
      'earnings',
      'conference',
      'call.',
    ]);
    expect(transcript?.speakers[1].words).toEqual([
      'Thank',
      'you',
      'Good',
      'afternoon',
      'and',
      'thank',
      'you',
      'for',
      'joining',
      'us',
      'I',
      'am',
      'the',
      'awesome',
      'CEO',
      'John',
      'Smith.',
    ]);
  });

  test('get question and answer not found', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=4',
        result: {
          ok: true,
          status: 404,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const transcript = await company.getQuestionAndAnswerTranscript({
      year: 2022,
      quarter: 1,
    });
    expect(transcript).toBeUndefined();
  });

  test('get question and answer http 429 too many requests', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=4',
        result: {
          ok: false,
          status: 429,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    await expect(
      company.getQuestionAndAnswerTranscript({ year: 2022, quarter: 1 }),
    ).rejects.toThrow('Too many requests');
  });

  test('get question and answer level 4', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=4',
        result: {
          ok: true,
          status: 200,
          json: () => level4Response,
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });

    const transcript = await company.getQuestionAndAnswerTranscript({
      year: 2022,
      quarter: 1,
    });

    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.event.conferenceDate).toBe('2022-01-01');
    expect(transcript?.preparedRemarks).toBe(
      "Good day and welcome to the Apple Q1 FY 2022 earnings conference call. Today's call is being recorded. At this time, for opening remarks and introductions, I would like to turn the call over to Tejas Ghala, Director of Investor Relations and Corporate Finance. Please go ahead. Thank you. Good afternoon, and thank you for joining us. Speaking first today is Apple CEO Tim Cook, and he'll be followed by CFO Luca Maestri. After that, we'll open the call to questions from analysts.",
    );
    expect(transcript?.questionsAndAnswers).toBe(
      "We'll take our first question from Katie Huberty with Morgan Stanley. Caller, please check your mute function. We're unable to hear you. Hearing no response, we'll take our next question from Wamsi Mohan with Bank of America. Yes, thank you. Your margins have clearly been very impressive. So I have one question each on product and one on services gross margins. On product gross margins, that's clearly benefiting from a very strong mix. So Tim, I'm curious,",
    );
  });

  test('getAllCompanies', async () => {
    setMockApiResponses([demoSymbolsMock]);
    const companies = await getAllCompanies();
    expect(companies.length).toBe(2);
    const names = companies.map((company) => company.companyInfo.name);
    expect(names).toContain('ABC Test Company Inc.');
    expect(names).toContain('DEF Test Company Inc.');
  });

  test('getSP500Companies', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/symbols/sp500.txt?apikey=demo',
        result: {
          ok: true,
          status: 200,
          text: () => Promise.resolve(sp500CompaniesTxtFile),
        },
      },
    ]);
    const companies = await getSP500Companies();
    expect(companies.length).toBe(2);
  });

  test('getSP500Companies with nonexistent symbols', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/symbols/sp500.txt?apikey=demo',
        result: {
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(sp500CompaniesWithNonexistentSymbolsTxtFile),
        },
      },
    ]);
    const companies = await getSP500Companies();
    expect(companies.length).toBe(2);
  });

  test("casting type with missing value doesn't throw runtime error", () => {
    type ExampleTestTypeWithOptionalAndNonOptionalParams = {
      exchange?: string;
      symbol: string;
    };
    const rawData = {
      exchange: 'NASDAQ',
    };
    const convertedData =
      rawData as ExampleTestTypeWithOptionalAndNonOptionalParams;
    expect(convertedData.exchange).toBe('NASDAQ');
    expect(convertedData.symbol).toBeUndefined();
  });

  test('getAudioFile http 404 not found', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/audio?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1',
        result: {
          ok: false,
          status: 404,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const result = await company.downloadAudioFile({ year: 2022, quarter: 1 });
    expect(result).toBeUndefined();
  });

  test('getAudioFile http 429 too many requests', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/audio?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1',
        result: {
          ok: false,
          status: 429,
          headers: new Headers({}),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    await expect(
      company.downloadAudioFile({ year: 2022, quarter: 1 }),
    ).rejects.toThrow('Too many requests');
  });

  test('getAudioFile with outputFilePath specified', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/audio?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1',
        result: {
          ok: true,
          status: 200,
          arrayBuffer: () => Promise.resolve(new Uint8Array([0, 0, 0, 0, 0])),
          headers: new Headers({
            'content-length': '100',
            'content-type': 'audio/mpeg',
            'last-modified': '2024-01-01T00:00:00.000Z',
          }),
        },
      },
    ]);
    const tempFilePath = path.join(
      os.tmpdir(),
      `ABC_2022_q1-${Date.now()}.mp3`,
    );
    const company = await getCompany({ symbol: 'ABC' });
    const audioFile = await company.downloadAudioFile({
      year: 2022,
      quarter: 1,
      outputFilePath: tempFilePath,
    });
    expect(audioFile?.contentLength).toBe(100);
    expect(audioFile?.contentType).toBe('audio/mpeg');
    expect(audioFile?.lastModified).toBeDefined();
    expect(audioFile?.outputFilePath).toBe(tempFilePath);
    expect(fs.existsSync(tempFilePath)).toBe(true);
    fs.unlinkSync(tempFilePath);
  });

  test('getAudioFile without outputFilePath specified', async () => {
    setMockApiResponses([
      demoSymbolsMock,
      {
        url: 'https://v2.api.earningscall.biz/audio?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1',
        result: {
          ok: true,
          status: 200,
          arrayBuffer: () => Promise.resolve(new Uint8Array([0, 0, 0, 0, 0])),
          headers: new Headers({
            'content-length': '100',
            'content-type': 'audio/mpeg',
            'last-modified': '2024-01-01T00:00:00.000Z',
          }),
        },
      },
    ]);
    const company = await getCompany({ symbol: 'ABC' });
    const audioFile = await company.downloadAudioFile({
      year: 2022,
      quarter: 1,
    });
    expect(audioFile?.contentLength).toBe(100);
    expect(audioFile?.contentType).toBe('audio/mpeg');
    expect(audioFile?.lastModified).toBeDefined();
    expect(audioFile?.outputFilePath).toBeDefined();
    expect(fs.existsSync(audioFile?.outputFilePath!)).toBe(true);
    fs.unlinkSync(audioFile?.outputFilePath!);
  });
});
