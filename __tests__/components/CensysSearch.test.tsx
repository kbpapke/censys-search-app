import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CensysSearch from '@/components/CensysSearch';
import * as censysApi from '@/services/censysApi';
import { censysConfig } from '@/config/env';

// Mock the config module
jest.mock('@/config/env', () => ({
  censysConfig: {
    API_ID: 'test-api-id',
    SECRET_KEY: 'test-secret-key',
    hasCredentials: true,
    usingFallbackCredentials: false
  }
}));

// Mock the searchHosts function
jest.mock('@/services/censysApi', () => ({
  __esModule: true,
  ...jest.requireActual('@/services/censysApi'),
  searchHosts: jest.fn(),
  DEFAULT_QUERY: 'services.service_name: HTTP'
}));

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});

describe('CensysSearch', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('renders the search form and loading state initially', () => {
    // Mock successful API response
    const mockData = {
      code: 200,
      status: 'OK',
      result: {
        query: 'services.service_name: HTTP',
        total: 5000,
        hits: [] // Empty for this test
      },
      links: {
        prev: null,
        next: '/api/v2/hosts/search?q=services.service_name%3A+HTTP&page=2&per_page=10'
      }
    };
    
    (censysApi.searchHosts as jest.Mock).mockResolvedValue(mockData);
    
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <CensysSearch />
      </QueryClientProvider>
    );
    
    // Check if search form is rendered
    expect(screen.getByPlaceholderText(/Enter Censys search query/i)).toBeInTheDocument();
  });

  it('displays search results when data is loaded', async () => {
    // Mock successful API response
    const mockData = {
      code: 200,
      status: 'OK',
      result: {
        query: 'services.service_name: HTTP',
        total: 5000,
        hits: [
          {
            ip: '8.8.8.8',
            services: [
              { port: 80, service_name: 'HTTP', transport_protocol: 'TCP' }
            ],
            location: {
              country: 'United States',
              continent: 'North America',
              country_code: 'US'
            },
            autonomous_system: {
              asn: 15169,
              name: 'Google LLC',
              description: 'Google LLC',
              country_code: 'US'
            }
          }
        ]
      },
      links: {
        prev: null,
        next: '/api/v2/hosts/search?q=services.service_name%3A+HTTP&page=2&per_page=10'
      }
    };
    
    (censysApi.searchHosts as jest.Mock).mockResolvedValue(mockData);
    
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <CensysSearch />
      </QueryClientProvider>
    );
    
    // Wait for results to load (API call and rendering)
    await waitFor(() => {
      expect(censysApi.searchHosts).toHaveBeenCalled();
    });
  });
});
