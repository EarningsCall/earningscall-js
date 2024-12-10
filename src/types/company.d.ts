/**
 * Represents information about a company including its exchange listing,
 * symbol, name, and classification details.
 */
export type CompanyInfo = {
  exchange?: string;
  symbol?: string;
  name?: string;
  security_name?: string;
  sector?: string;
  industry?: string;
};

/**
 * Methods that can be implemented for CompanyInfo objects
 */
export interface CompanyInfoMethods {
  /**
   * Returns a string representation of the company in format "(exchange: symbol - name)"
   */
  toString(): string;

  /**
   * Converts the company info to a JSON string
   */
  toJson(): string;

  /**
   * Converts company info to an array format for text output
   */
  toTxtRow(): string[];

  /**
   * Converts company info to an extended array format including sector and industry
   */
  toTxtV2Row(): string[];

  /**
   * Returns the combined exchange and symbol as a string
   */
  exchangeSymbol(): string;
}

export interface GetCompanyOptions {
  symbol: string;
  exchange?: string;
}
