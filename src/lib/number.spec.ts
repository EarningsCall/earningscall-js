import { describe, expect, test } from '@jest/globals';
import { double, power } from './number';

describe('number', () => {
  test('double', () => {
    expect(double(2)).toBe(4);
  });

  test('power', () => {
    expect(power(2, 4)).toBe(16);
  });
});
