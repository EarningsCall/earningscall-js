import {
  indexToIndustry,
  indexToSector,
  industryToIndex,
  sectorToIndex,
} from './sectors';

describe('sectors', () => {
  it('should convert sector to index', () => {
    expect(sectorToIndex('Technology')).toBe(9);
  });
  it('should convert index to sector', () => {
    expect(indexToSector(9)).toBe('Technology');
  });
  it('should convert index to industry', () => {
    expect(indexToIndustry(9)).toBe('Auto & Truck Dealerships');
  });
  it('should convert industry to index', () => {
    expect(industryToIndex('Software - Infrastructure')).toBe(122);
  });
  it('should convert index to industry', () => {
    expect(indexToIndustry(122)).toBe('Software - Infrastructure');
  });
  it('should fail to convert invalid sector', () => {
    expect(sectorToIndex('Invalid Sector')).toBe(-1);
  });
  it('should fail to convert invalid industry', () => {
    expect(industryToIndex('Invalid Industry')).toBe(-1);
  });

  it('should fail to convert invalid index', () => {
    expect(indexToSector(-1)).toBe('Unknown');
    expect(indexToIndustry(-1)).toBe('Unknown');
    expect(indexToSector(99999)).toBe('Unknown');
    expect(indexToIndustry(99999)).toBe('Unknown');
    expect(sectorToIndex('Unknown')).toBe(-1);
    expect(industryToIndex('Unknown')).toBe(-1);
  });
});
