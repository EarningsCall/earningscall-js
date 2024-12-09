import { describe, test } from '@jest/globals';
import { getCompany } from './company';

const symbolsResponseText =
  '1\tABC\tABC Test Company Inc.\t9\t30\n1\tDEF\tDEF Test Company Inc.\t9\t122';

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

  test('get transcript', async () => {
    const company = await getCompany('ABC');

    await expect(company.getTranscript({})).rejects.toThrow(
      'Must specify either event or year and quarter',
    );

    await expect(
      company.getTranscript({ year: 2022, quarter: 0 }),
    ).rejects.toThrow('Invalid quarter. Must be one of: {1,2,3,4}');

    await expect(
      company.getTranscript({ year: 2022, quarter: 1, level: 5 }),
    ).rejects.toThrow('Invalid level. Must be one of: {1,2,3}');

    await expect(
      company.getTranscript({ year: 2022, quarter: 1, level: 0 }),
    ).rejects.toThrow('Invalid level. Must be one of: {1,2,3}');

    await expect(
      company.getTranscript({ year: 1989, quarter: 1, level: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');

    await expect(
      company.getTranscript({ year: 2031, quarter: 1, level: 1 }),
    ).rejects.toThrow('Invalid year. Must be between 1990 and 2030');

    const transcript = await company.getTranscript({ year: 2022, quarter: 1 });

    expect(transcript.event.year).toBe(2022);
    expect(transcript.event.quarter).toBe(1);
    expect(transcript.event.conference_date).toBe('2022-01-01');
    expect(transcript.text).toBe(
      'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call.',
    );
  });

  test('get transcript level 2', async () => {
    const company = await getCompany('ABC');

    const transcript = await company.getTranscript({
      year: 2022,
      quarter: 1,
      level: 2,
    });

    expect(transcript.event.year).toBe(2022);
    expect(transcript.event.quarter).toBe(1);
    expect(transcript.event.conference_date).toBe('2022-01-01');
    expect(transcript.text).toBe(
      "Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call. Today's call is being recorded. Please go ahead. Thank you. Good afternoon, and thank you for joining us. I am the awesome CEO John Smith.",
    );
  });

  test('get transcript level 3', async () => {
    const company = await getCompany('ABC');

    const transcript = await company.getTranscript({
      year: 2022,
      quarter: 1,
      level: 3,
    });

    expect(transcript.event.year).toBe(2022);
    expect(transcript.event.quarter).toBe(1);
    expect(transcript.event.conference_date).toBe('2022-01-01');
    expect(transcript.text).toBe(
      'Good day and welcome to the ABC Test Company Inc. Q1 FY 2022 earnings conference call. Thank you Good afternoon and thank you for joining us I am the awesome CEO John Smith.',
    );
  });
});
