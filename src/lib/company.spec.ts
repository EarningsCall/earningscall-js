import { describe, test } from '@jest/globals';
import {
  clearSymbols,
  getAllCompanies,
  getCompany,
  getSP500Companies,
  setApiKey,
} from '../index';

const symbolsResponseText =
  '1\tABC\tABC Test Company Inc.\t9\t30\n1\tDEF\tDEF Test Company Inc.\t9\t122';

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
      'https://v2.api.earningscall.biz/events?apikey=demo&exchange=NASDAQ&symbol=ABC'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => eventsResponseJson,
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=My+Custom+API+Key'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(symbolsResponseText),
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=My+Custom+API+Key&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => transcriptResponseJson,
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => transcriptResponseJson,
      });
    }
    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=2'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => transcriptLevel2ResponseJson,
      });
    }
    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=3'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => transcriptLevel3ResponseJson,
      });
    }
    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=4'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => level4Response,
      });
    }

    if (
      url === 'https://v2.api.earningscall.biz/symbols/sp500.txt?apikey=demo'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(sp500CompaniesTxtFile),
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=CUSTOM_API_KEY&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=1'
    ) {
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/transcript?apikey=BASIC_PLAN_API_KEY&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1&level=4'
    ) {
      return Promise.resolve({
        ok: false,
        status: 403,
        headers: {
          get: (key: string) => {
            if (key.toLowerCase() === 'x-plan-name') {
              return 'basic';
            }
            return undefined;
          },
        },
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=INVALID_API_KEY'
    ) {
      return Promise.resolve({
        ok: false,
        status: 401,
      });
    }

    if (
      url ===
      'https://v2.api.earningscall.biz/audio?apikey=demo&exchange=NASDAQ&symbol=ABC&year=2022&quarter=1'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new Uint8Array([0, 0, 0, 0, 0])),
      });
    }

    return Promise.reject(new Error(`Unhandled request: ${url}`));
  }) as jest.Mock;
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  setApiKey(undefined);
  clearSymbols();
});

describe('company', () => {
  test('getCompany non demo account throws InsufficientApiAccessError', async () => {
    await expect(getCompany({ symbol: 'XYZ' })).rejects.toThrow(
      '"XYZ" requires an API Key for access. To get your API Key, see: https://earningscall.biz/api-pricing',
    );
  });

  test('getCompany with invalid api key throws NotFoundError', async () => {
    setApiKey('INVALID_API_KEY');
    await expect(getCompany({ symbol: 'ABC' })).rejects.toThrow('Unauthorized');
  });

  test('getCompany', async () => {
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

  test('get events', async () => {
    const company = await getCompany({ symbol: 'ABC' });
    const events = await company.events();
    expect(events.length).toEqual(8);
    expect(events[0].year).toEqual(2024);
    expect(events[0].quarter).toEqual(4);
    expect(events[0].conferenceDate).toEqual('2024-10-31T17:00:00.000-04:00');
  });

  test('get transcript is missing', async () => {
    const company = await getCompany({ symbol: 'ABC' });
    setApiKey('CUSTOM_API_KEY');
    const transcript = await company.getTranscript({ year: 2022, quarter: 1 });
    expect(transcript).toBeUndefined();
  });

  test('get enhanced transcript not authorized', async () => {
    const company = await getCompany({ symbol: 'ABC' });
    setApiKey('BASIC_PLAN_API_KEY');
    await expect(
      company.getTranscript({
        year: 2022,
        quarter: 1,
        level: 4,
      }),
    ).rejects.toThrow(
      'Your plan (basic) does not include Enhanced Transcript Data. Upgrade your plan here: https://earningscall.biz/api-pricing',
    );
  });

  test('get transcript', async () => {
    const company = await getCompany({ symbol: 'ABC' });

    await expect(company.getTranscript({})).rejects.toThrow(
      'Must specify either event or year and quarter',
    );

    await expect(
      company.getTranscript({ year: 2022, quarter: 0 }),
    ).rejects.toThrow('Invalid quarter. Must be one of: {1,2,3,4}');

    await expect(
      company.getTranscript({ year: 2022, quarter: 1, level: 5 }),
    ).rejects.toThrow('Invalid level. Must be one of: {1,2,3,4}');

    await expect(
      company.getTranscript({ year: 2022, quarter: 1, level: 0 }),
    ).rejects.toThrow('Invalid level. Must be one of: {1,2,3,4}');

    await expect(
      company.getTranscript({ year: 1989, quarter: 1, level: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');

    await expect(
      company.getTranscript({ year: 2031, quarter: 1, level: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');

    const transcript = await company.getTranscript({ year: 2022, quarter: 1 });

    expect(transcript?.event?.year).toBe(2022);
    expect(transcript?.event?.quarter).toBe(1);
    expect(transcript?.event?.conferenceDate).toBe('2022-01-01');
    expect(transcript?.text).toBe(
      'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call.',
    );
  });

  test('get transcript with api key', async () => {
    setApiKey('My Custom API Key');
    const company = await getCompany({ symbol: 'ABC' });
    const transcript = await company.getTranscript({ year: 2022, quarter: 1 });
    expect(transcript?.event.year).toBe(2022);
    expect(transcript?.event.quarter).toBe(1);
  });

  test('get transcript level 2', async () => {
    const company = await getCompany({ symbol: 'ABC' });

    const transcript = await company.getTranscript({
      year: 2022,
      quarter: 1,
      level: 2,
    });

    expect(transcript?.event?.year).toBe(2022);
    expect(transcript?.event?.quarter).toBe(1);
    expect(transcript?.event?.conferenceDate).toBe('2022-01-01');
    expect(transcript?.text).toBe(
      "Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call. Today's call is being recorded. Please go ahead. Thank you. Good afternoon, and thank you for joining us. I am the awesome CEO John Smith.",
    );
    expect(transcript?.speakers?.[0]?.speakerInfo?.name).toBe('Operator');
    expect(transcript?.speakers?.[0]?.speakerInfo?.title).toBe('Host');
    expect(transcript?.speakers?.[1]?.speakerInfo?.name).toBe('John Smith');
    expect(transcript?.speakers?.[1]?.speakerInfo?.title).toBe('CEO');
  });

  test('get transcript level 3', async () => {
    const company = await getCompany({ symbol: 'ABC' });

    const transcript = await company.getTranscript({
      year: 2022,
      quarter: 1,
      level: 3,
    });

    expect(transcript?.event?.year).toBe(2022);
    expect(transcript?.event?.quarter).toBe(1);
    expect(transcript?.event?.conferenceDate).toBe('2022-01-01');
    expect(transcript?.text).toBe(
      'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call. Thank you Good afternoon and thank you for joining us I am the awesome CEO John Smith.',
    );
  });

  test('get transcript level 4', async () => {
    const company = await getCompany({ symbol: 'ABC' });

    const transcript = await company.getTranscript({
      year: 2022,
      quarter: 1,
      level: 4,
    });

    expect(transcript?.event?.year).toBe(2022);
    expect(transcript?.event?.quarter).toBe(1);
    expect(transcript?.event?.conferenceDate).toBe('2022-01-01');
    expect(transcript?.preparedRemarks).toBe(
      "Good day and welcome to the Apple Q1 FY 2022 earnings conference call. Today's call is being recorded. At this time, for opening remarks and introductions, I would like to turn the call over to Tejas Ghala, Director of Investor Relations and Corporate Finance. Please go ahead. Thank you. Good afternoon, and thank you for joining us. Speaking first today is Apple CEO Tim Cook, and he'll be followed by CFO Luca Maestri. After that, we'll open the call to questions from analysts.",
    );
    expect(transcript?.questionsAndAnswers).toBe(
      "We'll take our first question from Katie Huberty with Morgan Stanley. Caller, please check your mute function. We're unable to hear you. Hearing no response, we'll take our next question from Wamsi Mohan with Bank of America. Yes, thank you. Your margins have clearly been very impressive. So I have one question each on product and one on services gross margins. On product gross margins, that's clearly benefiting from a very strong mix. So Tim, I'm curious,",
    );
  });

  test('getAllCompanies', async () => {
    const companies = await getAllCompanies();
    expect(companies.length).toBe(2);
    const names = companies.map((company) => company.companyInfo.name);
    expect(names).toContain('ABC Test Company Inc.');
    expect(names).toContain('DEF Test Company Inc.');
  });

  test('getSP500Companies', async () => {
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

  test('getAudioFile', async () => {
    const company = await getCompany({ symbol: 'ABC' });
    const audioFile = await company.getAudioFile({ year: 2022, quarter: 1 });
    expect(audioFile).toBeDefined();
  });
});
