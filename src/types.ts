export enum Region {
    Africa = 'Africa',
    Americas = 'Americas',
    Asia = 'Asia',
    Europe = 'Europe',
    Oceania = 'Oceania'
  }
  
  export interface ICountry {
    name: {
      common: string;
      official: string;
    };
    region: Region;
    capital: string[];
    population: number;
    flags: {
      png: string;
      svg: string;
    };
    cca2: string;
    cca3: string;
  }
  
  export interface ICountrySummary {
    name: string;
    region: Region;
    capital: string;
    population: number;
    flag: string;
    alpha2Code: string;
    alpha3Code: string;
  }