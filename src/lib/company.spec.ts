import test from 'ava';

import { getCompany } from './company';

test('getCompany', async (t) => {
  const company = await getCompany('AAPL');
  t.is(company.name, 'Apple Inc.');
});
