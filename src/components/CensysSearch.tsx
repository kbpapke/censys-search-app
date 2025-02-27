'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchHosts, CensysSearchParams, DEFAULT_QUERY, extractCursorInfo } from '@/services/censysApi';
import SearchForm from './SearchForm';
import HostsList from './HostsList';

const CensysSearch = () => {
  const [searchParams, setSearchParams] = useState<CensysSearchParams>({
    query: DEFAULT_QUERY,
    per_page: 10,
    cursor: null,
    apiId: process.env.NEXT_PUBLIC_CENSYS_API_ID,
    secretKey: process.env.NEXT_PUBLIC_CENSYS_SECRET_KEY
  });

  const [navigationState, setNavigationState] = useState<{
    direction: 'initial' | 'forward' | 'backward';
    pages: number;
  }>({
    direction: 'initial',
    pages: 0
  });

  // Empty useEffect to trigger initial query on component mount
  useEffect(() => {}, []);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['hosts', searchParams],
    queryFn: () => searchHosts(searchParams),
    enabled: true,
    staleTime: 60000, // Cache results for 1 minute
  });

  const handleSearch = (params: CensysSearchParams) => {
    setSearchParams(prev => ({
      ...prev,
      ...params,
      cursor: null, // Reset cursor when performing a new search
    }));
    setNavigationState({
      direction: 'initial',
      pages: 0
    });
  };

  const handleNextPage = () => {
    if (data?.result?.links?.next) {
      const cursorInfo = extractCursorInfo(data.result.links.next);
      setSearchParams(prev => ({
        ...prev,
        cursor: data.result.links.next,
      }));
      setNavigationState(prev => ({
        direction: 'forward',
        pages: cursorInfo.page ? cursorInfo.page - 1 : prev.pages + 1
      }));
    } else if (!searchParams.cursor && data?.result?.total && data.result.total > (searchParams.per_page || 0)) {
      setSearchParams(prev => ({
        ...prev,
        cursor: null, // Explicitly set to null to ensure clean state
      }));
    } else if (data?.result?.total && data.result.total <= (searchParams.per_page || 0)) {
      return;
    }
  };

  const handlePrevPage = () => {
    if (data?.result?.links?.prev && data.result.links.prev !== '') {
      const cursorInfo = extractCursorInfo(data.result.links.prev);
      if (cursorInfo.page === 1) {
        setSearchParams(prev => ({
          ...prev,
          cursor: null,
        }));
        setNavigationState({
          direction: 'initial',
          pages: 0
        });
      } else {
        setSearchParams(prev => ({
          ...prev,
          cursor: data.result.links.prev,
        }));
        setNavigationState(prev => ({
          direction: 'backward',
          pages: Math.max(0, prev.pages - 1)
        }));
      }
    } else {
      setSearchParams(prev => ({
        ...prev,
        cursor: null,
      }));
      setNavigationState({
        direction: 'initial',
        pages: 0
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Censys IPv4 Host Search</h1>
        <p className="text-slate-600">
          Search and explore IPv4 hosts indexed by Censys. Use advanced search syntax to find specific hosts.
        </p>
      </div>
      
      <SearchForm onSearch={handleSearch} initialParams={searchParams} />
      
      {isLoading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600">Loading results...</p>
          </div>
        </div>
      )}
      
      {isError && !isLoading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error fetching results
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{(error as Error)?.message || 'An unknown error occurred'}</p>
                
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="font-medium">Helpful tips:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Use <code className="bg-red-100 px-1 rounded">services</code> (plural) instead of <code className="bg-red-100 px-1 rounded">service</code> (singular) in field names</li>
                    <li>Example of correct query: <code className="bg-red-100 px-1 rounded">services.service_name: HTTP</code></li>
                    <li>For country names with spaces, use double quotes: <code className="bg-red-100 px-1 rounded">location.country: &quot;United States&quot;</code></li>
                    <li>Make sure to follow the correct Censys query syntax</li>
                    {(error as Error)?.message?.includes('invalid field') && (
                      <li>Check field names carefully - the API is suggesting: {(error as Error)?.message.split('Did you mean ')[1]}</li>
                    )}
                    {(error as Error)?.message?.includes('query could not be parsed') && (
                      <li>Query syntax error - check for missing quotes around terms with spaces</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {data && !isLoading && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg shadow-sm border border-slate-200">
            <div>
              <p className="text-slate-800 font-medium">
                Found <span className="text-indigo-600 font-bold">{data.result.total?.toLocaleString() || '0'}</span> hosts matching your query
              </p>
              <p className="text-sm text-slate-500 mt-1">
                <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                  {data.result.query}
                </span>
              </p>
            </div>
            <div className="text-slate-600 text-sm mt-2 md:mt-0 flex flex-col items-end">
              <div>Showing {data.result.hits?.length || 0} of {data.result.total?.toLocaleString() || '0'} Total Results</div>
              {navigationState.pages > 0 && (
                <div className="text-slate-500 text-xs mt-1">
                  Page {navigationState.pages + 1} 
                  <span className="text-gray-400 ml-1">({navigationState.direction})</span>
                </div>
              )}
              {navigationState.pages === 0 && (
                <div className="text-slate-500 text-xs mt-1">
                  First page of results
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between my-4">
            {navigationState.pages > 0 && (
              <button 
                onClick={() => {
                  setSearchParams(prev => ({
                    ...prev,
                    cursor: null,
                  }));
                  setNavigationState({
                    direction: 'initial',
                    pages: 0
                  });
                }} 
                className="px-5 py-2.5 rounded-lg flex items-center bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 mr-2"
              >
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                First
              </button>
            )}
            
            <button 
              onClick={handlePrevPage} 
              disabled={(!data?.result?.links?.prev || data.result.links.prev === '') || isFetching}
              className={`px-5 py-2.5 rounded-lg flex items-center transition-colors ${
                (!data?.result?.links?.prev || data.result.links.prev === '') || isFetching
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button 
              onClick={handleNextPage} 
              disabled={(!data?.result?.links?.next) || isFetching}
              className={`px-5 py-2.5 rounded-lg flex items-center transition-colors ${
                (!data?.result?.links?.next) || isFetching
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              Next
              <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <HostsList hosts={data.result.hits} />
        </div>
      )}
    </div>
  );
};

export default CensysSearch;
