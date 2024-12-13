import { indexToExchange } from './symbols';

describe('symbols', () => {
  it('should convert index to exchange', () => {
    expect(indexToExchange(0)).toBe('NYSE');
  });

  it('should fail to convert invalid index', () => {
    expect(indexToExchange(-1)).toBe('UNKNOWN');
    expect(indexToExchange(99999)).toBe('UNKNOWN');
  });
});
