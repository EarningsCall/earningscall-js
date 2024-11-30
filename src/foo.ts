import log from 'loglevel';

import { getSymbols } from './lib/symbols';

log.setLevel('info');

log.info('foo');

log.info('Hello world!');

getSymbols().then((symbols) => {
  log.info(symbols);
});
