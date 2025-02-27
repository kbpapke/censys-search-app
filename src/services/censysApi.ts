// This module handles the communication with the Censys API
import axios from 'axios';
import { censysConfig } from '@/config/env';
import sampleData from '@/data/sampleData.json';
import base64 from 'base-64';

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
  cursor?: string | null;
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
    duration?: number;
    hits: CensysHost[];
    links: {
      next?: string;
      prev?: string;
    };
  };
}

// Default query to load at startup
export const DEFAULT_QUERY = 'services.service_name: HTTP';

// Format query field to ensure correct syntax
export const formatQueryField = (query: string): string => {
  let formattedQuery = query.trim();
  
  // Fix known field name issues (singular to plural)
  formattedQuery = formattedQuery.replace(/\bservice\.([a-zA-Z_.]+)/g, 'services.$1');
  
  // Handle country names with spaces - if we detect location.country: followed by a non-quoted string with spaces
  if (formattedQuery.includes('location.country:')) {
    // If the country name isn't already in quotes and contains spaces, add quotes
    formattedQuery = formattedQuery.replace(/location\.country:\s+([^"][^:]*\s+[^:]*[^"])/g, 'location.country: "$1"');
  }
  
  return formattedQuery;
};

// Generate a mock cursor for pagination in sample data
const generateMockCursor = (direction: 'next' | 'prev', query: string, currentIndex = 0): string => {
  // Create a simple mock JWT structure with pagination info in payload
  const mockHeader = { alg: 'EdDSA' };
  const mockPayload = { 
    direction,
    q: query,
    index: direction === 'next' ? currentIndex + 1 : Math.max(0, currentIndex - 1)
  };

  const header = base64.encode(JSON.stringify(mockHeader));
  const payload = base64.encode(JSON.stringify(mockPayload));
  
  return `${header}.${payload}.SampleSignature`;
};

// Helper function to extract a subset of sample data for a specific page
export const formatSampleData = (query: string, per_page: number = 10, cursor: string | null = null): CensysSearchResult => {
  console.log('[API DEBUG] Formatting sample data with cursor:', cursor);
  
  // Parse and decode cursor to determine page index (in a real implementation, this would be done differently)
  let currentIndex = 0;
  if (cursor) {
    try {
      // In a real implementation, this would properly decode the cursor
      // Here we're just doing a simple mock parse
      const cursorParts = cursor.split('_');
      if (cursorParts.length > 1) {
        currentIndex = parseInt(cursorParts[1], 10);
      }
    } catch (e) {
      console.error('Error parsing cursor:', e);
    }
  }
  
  // Clone the original data
  const sampleResult = JSON.parse(JSON.stringify(sampleData)) as CensysSearchResult;
  
  // Adjust the result based on the cursor/page
  const start = currentIndex * per_page;
  const end = start + per_page;
  
  // Get all hits from the sample data
  const allHits = [...sampleResult.result.hits];
  
  // Slice to get the page we want
  sampleResult.result.hits = allHits.slice(start, end);
  
  // Add pagination links
  const hasPrev = currentIndex > 0;
  const hasNext = (currentIndex + 1) * per_page < sampleResult.result.total;
  
  sampleResult.result.links = {
    prev: hasPrev ? generateMockCursor('prev', query, currentIndex) : '',
    next: hasNext ? generateMockCursor('next', query, currentIndex) : ''
  };
  
  console.log('[API DEBUG] Generated sample data with links:', sampleResult.result.links);
  
  return sampleResult;
};

// Helper to decode cursor and extract page information
export const extractCursorInfo = (cursor: string | null): {page?: number, direction?: string} => {
  if (!cursor) return {};
  
  try {
    const parts = cursor.split('.');
    if (parts.length > 1) {
      const payload = JSON.parse(base64.decode(parts[1]));
      console.log('[API DEBUG] Extracted cursor info:', JSON.stringify(payload));
      return {
        page: payload.page,
        direction: payload.reversed ? 'backward' : 'forward'
      };
    }
  } catch (err) {
    console.log('[API DEBUG] Could not decode cursor payload (likely not JWT format)');
  }
  
  return {};
};

export const searchHosts = async ({
  query = DEFAULT_QUERY,
  cursor,
  per_page = 10,
  apiId,
  secretKey,
  virtual_hosts = 'EXCLUDE',
  sort,
  fields,
  useSampleData = false
}: CensysSearchParams): Promise<CensysSearchResult> => {
  console.log('Searching with credentials:', Boolean(apiId), Boolean(secretKey));
  console.log('Pagination params:', { cursor, per_page });
  
  // If using sample data is explicitly requested, return it immediately
  if (useSampleData) {
    console.log('Using sample data');
    return formatSampleData(query, per_page, cursor);
  }
  
  // Use passed credentials first, fall back to config
  const finalApiId = apiId || censysConfig.API_ID;
  const finalSecretKey = secretKey || censysConfig.SECRET_KEY;
  
  if (!finalApiId || !finalSecretKey) {
    throw new Error('Censys API credentials are not configured. Please set NEXT_PUBLIC_CENSYS_API_ID and NEXT_PUBLIC_CENSYS_SECRET_KEY in your environment variables.');
  }

  try {
    // Ensure query is properly formatted before sending to API
    const formattedQuery = formatQueryField(query.trim());
    
    // Prepare request params
    const params: Record<string, any> = {
      q: formattedQuery,
      per_page,
    };
    
    // Add cursor if it exists and is not null
    // IMPORTANT: Only add the cursor if it's a valid string (not null, undefined, or empty string)
    if (cursor && cursor !== 'next' && cursor !== '') {
      console.log('[API DEBUG] Using cursor for pagination:', cursor);
      
      // Debug the cursor structure (safely)
      try {
        const parts = cursor.split('.');
        if (parts.length > 1) {
          const payload = JSON.parse(base64.decode(parts[1]));
          console.log('[API DEBUG] Cursor decoded payload:', JSON.stringify(payload));
        }
      } catch (err) {
        console.log('[API DEBUG] Could not decode cursor payload (likely not JWT format)');
      }
      
      params.cursor = cursor;
    } else {
      console.log('[API DEBUG] No valid cursor provided, first page of results');
    }
    
    // Add other optional parameters
    if (virtual_hosts) params.virtual_hosts = virtual_hosts;
    if (sort) params.sort = sort;
    if (fields && fields.length > 0) params.fields = fields.join(',');
    
    console.log('[API DEBUG] Final request params:', params);
    
    const response = await axios.get('https://search.censys.io/api/v2/hosts/search', {
      params,
      auth: {
        username: finalApiId,
        password: finalSecretKey,
      },
    });

    // Log the full response structure to understand what's available
    console.log('[API DEBUG] Response structure:', JSON.stringify(response.data).substring(0, 500));
    
    // Log the cursor information from the actual response structure
    if (response.data?.result?.links) {
      console.log('[API DEBUG] Found cursor tokens in result.links:', response.data.result.links);
    } else {
      console.log('[API DEBUG] No cursor tokens found in API response');
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
    
    // No fallback to sample data - just throw the error
    throw error;
  }
};
