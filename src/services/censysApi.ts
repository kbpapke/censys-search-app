// This module handles the communication with the Censys API
import axios from 'axios';
import { censysConfig } from '@/config/env';
import sampleData from '@/data/sampleData.json';

export interface CensysService {
  port: number;
  service_name?: string;
  transport_protocol?: string;
  certificate?: string;
}

export interface CensysLocation {
  continent?: string;
  country?: string;
  country_code?: string;
  postal_code?: string;
  timezone?: string;
  coordinates?: {
    latitude?: string | number;
    longitude?: string | number;
  };
  registered_country?: string;
  registered_country_code?: string;
}

export interface CensysAutonomousSystem {
  asn?: number;
  description?: string;
  bgp_prefix?: string;
  name?: string;
  country_code?: string;
}

export interface CensysHost {
  ip: string;
  name?: string;
  services: CensysService[];
  location?: CensysLocation;
  autonomous_system?: CensysAutonomousSystem;
}

export interface CensysSearchParams {
  query: string;
  page?: number;
  per_page?: number;
  apiId?: string;
  secretKey?: string;
  virtual_hosts?: 'EXCLUDE' | 'INCLUDE' | 'ONLY';
  sort?: string;
  fields?: string[];
  useSampleData?: boolean;
}

export interface CensysSearchResult {
  code: number;
  status: string;
  result: {
    query: string;
    total: number;
    hits: CensysHost[];
  };
  links?: {
    next?: string | null;
    prev?: string | null;
  };
}

// Default query to load at startup
export const DEFAULT_QUERY = 'services.service_name: HTTP';
// Format sample data with provided query parameters
const formatSampleData = (query = DEFAULT_QUERY, page = 1, per_page = 10): CensysSearchResult => {
  // Use type assertion with unknown first to avoid direct casting errors
  const sampleResult = JSON.parse(JSON.stringify(sampleData)) as unknown as CensysSearchResult;
  
  // Update the sample data with the current query
  sampleResult.result.query = query;
  
  // Create pagination links
  sampleResult.links = {
    prev: page > 1 ? `/api/v2/hosts/search?q=${encodeURIComponent(query)}&page=${page-1}&per_page=${per_page}` : null,
    next: page * per_page < sampleResult.result.total ? `/api/v2/hosts/search?q=${encodeURIComponent(query)}&page=${page+1}&per_page=${per_page}` : null
  };
  
  return sampleResult;
};

export const searchHosts = async ({
  query = DEFAULT_QUERY,
  page = 1,
  per_page = 10,
  apiId,
  secretKey,
  virtual_hosts = 'EXCLUDE',
  sort,
  fields,
  useSampleData = false
}: CensysSearchParams): Promise<CensysSearchResult> => {
  // Skip logging to avoid build issues
  
  // If using sample data is explicitly requested, return it immediately
  if (useSampleData) {
    return formatSampleData(query, page, per_page);
  }
  
  // Use passed credentials first, fall back to config
  const finalApiId = apiId || censysConfig.API_ID;
  const finalSecretKey = secretKey || censysConfig.SECRET_KEY;
  
  if (!finalApiId || !finalSecretKey) {
    throw new Error('Censys API credentials are not configured. Please set NEXT_PUBLIC_CENSYS_API_ID and NEXT_PUBLIC_CENSYS_SECRET_KEY in your environment variables.');
  }

  try {
    // Ensure query is properly formatted before sending to API
    const formattedQuery = query.trim();
    
    const response = await axios.get('https://search.censys.io/api/v2/hosts/search', {
      params: {
        q: formattedQuery,
        per_page,
        page,
        ...(virtual_hosts && { virtual_hosts }),
        ...(sort && { sort }),
        ...(fields && fields.length > 0 && { fields: fields.join(',') })
      },
      auth: {
        username: finalApiId,
        password: finalSecretKey,
      }
    });

    // Make sure response.data contains links property, even if API doesn't return it
    if (!response.data.links) {
      response.data.links = {
        prev: page > 1 ? `/api/v2/hosts/search?q=${encodeURIComponent(formattedQuery)}&page=${page-1}&per_page=${per_page}` : null,
        next: response.data.result.total > page * per_page ? `/api/v2/hosts/search?q=${encodeURIComponent(formattedQuery)}&page=${page+1}&per_page=${per_page}` : null
      };
    }

    return response.data;
  } catch (error) {
    console.error('Error searching Censys API:', error);
    
    // Handle specific API errors
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 422) {
        console.error('Invalid query parameters:', errorData);
        throw new Error(`Invalid query parameters: ${errorData?.error || 'Please check your search query format'}`);
      } else if (status === 401) {
        throw new Error('Invalid Censys API credentials. Please check your API ID and Secret Key.');
      } else if (status === 403) {
        throw new Error('Your Censys API credentials do not have permission to perform this search.');
      } else if (status === 429) {
        throw new Error('Censys API rate limit exceeded. Please try again later.');
      }
      
      // Generic API error with response data
      if (errorData?.error) {
        throw new Error(`Censys API Error (${status}): ${errorData.error}`);
      }
    }
    
    // No more fallback to sample data - just throw the error
    throw error;
  }
};
