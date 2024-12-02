/* eslint-disable functional/immutable-data */
import test from 'ava';

import { getCompany } from './company';

const symbolsResponseText = '1\tAAPL\tApple Inc.\t9\t30\n1\tMSFT\tMicrosoft Corporation\t9\t122';

test.before(() => {
  global.fetch = (url) => {
    if (url === 'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo') {
      return Promise.resolve({
        status: 200,
        text: () => symbolsResponseText,
      }) as any;
    }
    if (url === 'https://v2.api.earningscall.biz/somethingelse?apikey=demo') {
      return Promise.resolve({
        status: 200,
        text: () => symbolsResponseText,
      }) as any;
    }
    return Promise.reject(new Error(`Unhandled request: ${url}`));
  };
});

test.after(() => {
  delete (global as any).fetch;
});

test('getCompany', async (t) => {
  const company = await getCompany('AAPL');
  t.is(company.name, 'Apple Inc.');
  t.is(company.companyInfo.exchange, 'NASDAQ');
  t.is(company.companyInfo.symbol, 'AAPL');
  t.is(company.companyInfo.sector, 'Technology');
  t.is(company.companyInfo.industry, 'Consumer Electronics');
  t.is(company.toString(), 'Apple Inc.');
});


test('getCompany2', async (t) => {
  const company = await getCompany('AAPL');
  t.is(company.name, 'Apple Inc.');
  t.is(company.companyInfo.exchange, 'NASDAQ');
  t.is(company.companyInfo.symbol, 'AAPL');
  t.is(company.companyInfo.sector, 'Technology');
  t.is(company.companyInfo.industry, 'Consumer Electronics');
  t.is(company.toString(), 'Apple Inc.');
});
