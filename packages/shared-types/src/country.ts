/**
 * Country types and enumerations for GCC region
 * @module country
 */

/**
 * GCC countries enumeration
 */
export enum Country {
  /** Saudi Arabia */
  SA = 'SA',
  /** United Arab Emirates */
  AE = 'AE',
  /** Kuwait */
  KW = 'KW',
  /** Qatar */
  QA = 'QA',
  /** Bahrain */
  BH = 'BH',
  /** Oman */
  OM = 'OM',
}

/**
 * Country metadata including name and region information
 */
export interface CountryMetadata {
  /** ISO 3166-1 alpha-2 country code */
  code: Country;
  /** Full country name */
  name: string;
  /** Geographic region */
  region: string;
}

/**
 * Country-specific configuration
 */
export interface CountryConfig {
  /** Country code */
  country: Country;
  /** Population in millions */
  population: number;
  /** Capital city */
  capital: string;
  /** Currency code (e.g., SAR, AED) */
  currency: string;
}
