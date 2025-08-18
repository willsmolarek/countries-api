import axios, { AxiosError, AxiosResponse } from 'axios';
import { ICountry, ICountrySummary, Region } from './types';

const API_BASE_URL = 'https://restcountries.com/v3.1';
const DEFAULT_TIMEOUT = 10000;
const FIELDS_TO_FETCH = [
  'name',
  'region',
  'capital',
  'population',
  'flags',
  'cca2',
  'cca3'
].join(',');

interface ApiErrorResponse {
  message: string;
  status?: number;
  details?: unknown;
}

export class CountryService {
  private async makeApiRequest<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(url, {
        params: { fields: FIELDS_TO_FETCH },
        timeout: DEFAULT_TIMEOUT,
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.status >= 400) {
        throw this.createApiError(response);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private createApiError(response: AxiosResponse): Error {
    const errorData: ApiErrorResponse = {
      message: response.data?.message || 'API request failed',
      status: response.status,
      details: response.data
    };

    console.error('API Error:', errorData);
    return new Error(`API Error: ${errorData.message} (status: ${errorData.status})`);
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorDetails = axiosError.response?.data || { message: axiosError.message };
      
      console.error('Request failed:', {
        url: axiosError.config?.url,
        status: axiosError.response?.status,
        message: errorDetails.message
      });

      return new Error(`Request failed: ${errorDetails.message}`);
    }

    if (error instanceof Error) {
      console.error('Unexpected error:', error.message);
      return error;
    }

    console.error('Unknown error occurred:', error);
    return new Error('Unknown error occurred');
  }

  private mapToSummary(country: ICountry): ICountrySummary {
    if (!country) {
      throw new Error('Invalid country data');
    }

    return {
      name: country.name?.common || 'Unknown',
      region: country.region || 'Unknown',
      capital: country.capital?.[0] || 'N/A',
      population: country.population || 0,
      flag: country.flags?.png || '',
      alpha2Code: country.cca2 || '',
      alpha3Code: country.cca3 || ''
    };
  }

  public async getAllCountries(): Promise<ICountrySummary[]> {
    const countries = await this.makeApiRequest<ICountry[]>(`${API_BASE_URL}/all`);
    return countries.map(this.mapToSummary);
  }

  public async searchByName(name: string): Promise<ICountrySummary[]> {
    if (!name || name.trim().length === 0) {
      throw new Error('Search term cannot be empty');
    }

    const countries = await this.makeApiRequest<ICountry[]>(`${API_BASE_URL}/name/${encodeURIComponent(name)}`);
    return countries.map(this.mapToSummary);
  }

  public async filterByRegion(region: Region): Promise<ICountrySummary[]> {
    if (!Object.values(Region).includes(region)) {
      throw new Error(`Invalid region. Valid regions are: ${Object.values(Region).join(', ')}`);
    }

    const countries = await this.makeApiRequest<ICountry[]>(`${API_BASE_URL}/region/${region}`);
    return countries.map(this.mapToSummary);
  }
}