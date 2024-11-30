import test from 'ava';

// import { getCompany } from './company.js';

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

test('getCompany', async (t) => {
  t.pass();
  // const company = await getCompany('AAPL');
  // t.is(company.name, 'Apple Inc.');
  // t.is(company.companyInfo.exchange, 'NASDAQ');
  // t.is(company.companyInfo.symbol, 'AAPL');
  // t.is(company.companyInfo.sector, 'Technology');
  // t.is(company.companyInfo.industry, 'Consumer Electronics');
  // t.is(company.toString(), 'Apple Inc.');
});

// // test('getCompany2', async (t) => {
// //   const company = await getCompany('AAPL');
// //   t.is(company.name, 'Apple Inc.');
// //   t.is(company.companyInfo.exchange, 'NASDAQ');
// //   t.is(company.companyInfo.symbol, 'AAPL');
// //   t.is(company.companyInfo.sector, 'Technology');
// //   t.is(company.companyInfo.industry, 'Consumer Electronics');
// //   t.is(company.toString(), 'Apple Inc.');
// // });
