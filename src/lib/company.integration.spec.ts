import { getCompany } from '../index';

describe('integration', () => {
  test('fetch real company data from demo API', async () => {
    // Use real API endpoint instead of mocks
    const company = await getCompany({ symbol: 'AAPL' });

    // Basic company info validation
    expect(company.name).toContain('Apple');
    expect(company.companyInfo.exchange).toBe('NASDAQ');
    expect(company.companyInfo.symbol).toBe('AAPL');

    // Fetch events
    const events = await company.events();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty('year');
    expect(events[0]).toHaveProperty('quarter');
    expect(events[0]).toHaveProperty('conferenceDate');

    const transcript = await company.getBasicTranscript({
      year: 2024,
      quarter: 1,
    });

    expect(transcript).toBeDefined();
    expect(transcript?.event.year).toBe(2024);
    expect(transcript?.event.quarter).toBe(1);
    expect(transcript?.text).toBeTruthy();
    expect(transcript?.text.slice(0, 100)).toBe(
      "Good day, and welcome to the Apple Q1 Fiscal Year 2024 Earnings Conference Call. Today's call is bei",
    );
  }, 10_000); // Increase timeout since we're making real API calls

  test('fetch non-demo company data from demo API', async () => {
    expect(async () => {
      await getCompany({ symbol: 'NVDA' });
    }).rejects.toThrow(
      '"NVDA" requires an API Key for access. To get your API Key, see: https://earningscall.biz/api-pricing',
    );
  });

  test('fetch speaker groups', async () => {
    const company = await getCompany({ symbol: 'AAPL' });
    const speakerGroups = await company.getSpeakerGroups({
      year: 2024,
      quarter: 1,
    });
    expect(speakerGroups).toBeDefined();
    expect(speakerGroups?.speakers.length).toBe(61);
    const allSpeakersAndTitles = speakerGroups?.speakers.map(
      (speaker) =>
        `${speaker.speakerInfo?.name} (${speaker.speakerInfo?.title})`,
    );
    expect(allSpeakersAndTitles?.slice(0, 4)).toEqual([
      'Operator (Conference Call Host)',
      'Suhasini Chandramouli (Director of Investor Relations)',
      'Tim Cook (CEO)',
      'Luca Maestri (CFO)',
    ]);
  });

  test('fetch word level timestamps', async () => {
    const company = await getCompany({ symbol: 'AAPL' });
    const transcript = await company.getWordLevelTimestamps({
      year: 2024,
      quarter: 1,
    });
    expect(transcript).toBeDefined();
    expect(transcript?.speakers.length).toBeGreaterThan(0);
    expect(transcript?.speakers[0].words.length).toBeGreaterThan(0);
    expect(transcript?.speakers[0].startTimes.length).toBeGreaterThan(0);
    expect(transcript?.speakers[0].words.slice(0, 10)).toEqual([
      'Good',
      'day,',
      'and',
      'welcome',
      'to',
      'the',
      'Apple',
      'Q1',
      'Fiscal',
      'Year',
    ]);
    expect(transcript?.speakers[0].startTimes.slice(0, 10)).toEqual([
      0.526, 0.726, 1.167, 1.307, 1.748, 1.888, 2.068, 2.469, 3.029, 3.991,
    ]);
  });

  test('fetch questions and answers transcript', async () => {
    const company = await getCompany({ symbol: 'AAPL' });
    const transcript = await company.getQuestionAndAnswerTranscript({
      year: 2024,
      quarter: 1,
    });
    expect(transcript).toBeDefined();
    expect(transcript?.preparedRemarks.length).toBeGreaterThan(0);
    expect(transcript?.questionsAndAnswers.length).toBeGreaterThan(0);
    expect(transcript?.preparedRemarks.slice(0, 100)).toBe(
      "Good day, and welcome to the Apple Q1 Fiscal Year 2024 Earnings Conference Call. Today's call is bei",
    );
    expect(transcript?.questionsAndAnswers.slice(0, 100)).toBe(
      "We'll go ahead and take our first question from Eric Woodring with Morgan Stanley. Please go ahead. ",
    );
  });
});
