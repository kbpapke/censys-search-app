import axios from 'axios';
import { searchHosts, DEFAULT_QUERY } from '@/services/censysApi';
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

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.isAxiosError function
(axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

describe('censysApi', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should call the Censys API with correct parameters', async () => {
    // Setup mock axios response
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        code: 200,
        status: 'OK',
        result: {
          query: 'services.service_name: HTTP',
          total: 5000,
          hits: []
        },
        links: {
          prev: null,
          next: '/api/v2/hosts/search?q=services.service_name%3A+HTTP&page=2&per_page=10'
        }
      }
    });

    // Call the function
    await searchHosts({
      query: 'services.service_name: HTTP',
      page: 1,
      per_page: 10,
      apiId: 'test-id',
      secretKey: 'test-key'
    });

    // Check if axios.get was called with the correct parameters
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://search.censys.io/api/v2/hosts/search',
      expect.objectContaining({
        params: expect.objectContaining({
          q: 'services.service_name: HTTP',
          page: 1,
          per_page: 10
        }),
        auth: {
          username: 'test-id',
          password: 'test-key'
        }
      })
    );
  });

  it('should throw error if API credentials are missing', async () => {
    // Temporarily mock config to indicate missing credentials
    (censysConfig as any).API_ID = '';
    (censysConfig as any).SECRET_KEY = '';
    (censysConfig as any).hasCredentials = false;

    // Test that the function throws when credentials are missing
    await expect(
      searchHosts({
        query: DEFAULT_QUERY
      })
    ).rejects.toThrow('Censys API credentials are not configured');

    // Reset for other tests
    (censysConfig as any).API_ID = 'test-api-id';
    (censysConfig as any).SECRET_KEY = 'test-secret-key';
    (censysConfig as any).hasCredentials = true;
  });

  it('should throw error if API call fails', async () => {
    // Setup mock axios to reject with error
    const error = {
      response: {
        status: 400,
        data: {
          error: 'Invalid query parameters'
        }
      }
    };
    mockedAxios.get.mockRejectedValueOnce(error);

    // Test that the function throws an error
    await expect(
      searchHosts({
        query: 'invalid:query',
        apiId: 'test-id',
        secretKey: 'test-key'
      })
    ).rejects.toThrow();
  });
});
