import {
  clearSymbols,
  getSymbols,
  indexToExchange,
  loadSymbols,
} from './symbols';

const symbolsResponseText =
  '1\tABC\tABC Test Company Inc.\t9\t30\n1\tDEF\tDEF Test Company Inc.\t9\t122';

beforeAll(() => {
  global.fetch = jest.fn((url: URL) => {
    if (
      url.toString() ===
      'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo'
    ) {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(symbolsResponseText),
        headers: new Headers({
          'Content-Length': '100',
          'Content-Type': 'application/json',
          'Last-Modified': '2024-01-01T00:00:00.000Z',
          'Cache-Control': 'max-age=3600, expires=2024-01-01T01:00:00.000Z',
        }),
      });
    }

    return Promise.reject(new Error(`Unhandled request: ${url}`));
  }) as jest.Mock;
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  clearSymbols();
});

describe('symbols', () => {
  it('should convert index to exchange', () => {
    expect(indexToExchange(0)).toBe('NYSE');
  });

  it('should fail to convert invalid index', () => {
    expect(indexToExchange(-1)).toBe('UNKNOWN');
    expect(indexToExchange(99999)).toBe('UNKNOWN');
  });

  it('should load symbols', async () => {
    const symbols = await loadSymbols();
    expect(symbols.get('NASDAQ', 'ABC')).toBeDefined();
    expect(symbols.get('NASDAQ', 'DEF')).toBeDefined();
  });

  it('should work without response headers', async () => {
    global.fetch = jest.fn((url: URL) => {
      if (
        url.toString() ===
        'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo'
      ) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(symbolsResponseText),
          headers: new Headers({}),
        });
      }

      return Promise.reject(new Error(`Unhandled request: ${url}`));
    }) as jest.Mock;

    const symbols = await loadSymbols();
    expect(symbols.get('NASDAQ', 'ABC')).toBeDefined();
    expect(symbols.get('NASDAQ', 'DEF')).toBeDefined();
  });

  it('should cache symbols until expiration date then reload them', async () => {
    var numberOfSymbolsCalls = 0;
    global.fetch = jest.fn((url: URL) => {
      if (
        url.toString() ===
        'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo'
      ) {
        numberOfSymbolsCalls++;
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(symbolsResponseText),
          headers: new Headers({
            // Cause the symbols to expire in 1 second
            'Cache-Control': 'max-age=1',
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled request: ${url}`));
    }) as jest.Mock;

    const symbols = await getSymbols();
    expect(symbols.get('NASDAQ', 'ABC')).toBeDefined();
    expect(symbols.get('NASDAQ', 'DEF')).toBeDefined();
    expect(numberOfSymbolsCalls).toBe(1);
    const symbols2 = await getSymbols();
    expect(symbols2.get('NASDAQ', 'ABC')).toBeDefined();
    expect(symbols2.get('NASDAQ', 'DEF')).toBeDefined();
    expect(numberOfSymbolsCalls).toBe(1);
    // Sleep for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const symbols3 = await getSymbols();
    expect(numberOfSymbolsCalls).toBe(2);
    expect(symbols3.get('NASDAQ', 'ABC')).toBeDefined();
    expect(symbols3.get('NASDAQ', 'DEF')).toBeDefined();
  });

  it('should handle http throttle error', async () => {
    var numberOfSymbolsCalls = 0;
    global.fetch = jest.fn((url: URL) => {
      if (
        url.toString() ===
        'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo'
      ) {
        numberOfSymbolsCalls++;
        return Promise.resolve({
          ok: false,
          status: 429,
        });
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    }) as jest.Mock;

    expect(getSymbols()).rejects.toThrow('Too many requests');
  });

  it('should handle http internal server error', async () => {
    var numberOfSymbolsCalls = 0;
    global.fetch = jest.fn((url: URL) => {
      if (
        url.toString() ===
        'https://v2.api.earningscall.biz/symbols-v2.txt?apikey=demo'
      ) {
        numberOfSymbolsCalls++;
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    }) as jest.Mock;

    expect(getSymbols()).rejects.toThrow('Internal server error');
  });
});
