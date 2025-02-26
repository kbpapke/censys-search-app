'use client';

import { useState } from 'react';
import { CensysSearchParams } from '@/services/censysApi';

// Helper to correct common query mistakes
const formatQueryField = (query: string): string => {
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

interface SearchFormProps {
  onSearch: (params: CensysSearchParams) => void;
  initialParams?: CensysSearchParams;
}

const SearchForm = ({ onSearch, initialParams = { query: '' } }: SearchFormProps) => {
  const [searchParams, setSearchParams] = useState<CensysSearchParams>(initialParams);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.query?.trim()) {
      // Format query before submitting
      const formattedQuery = formatQueryField(searchParams.query);
      onSearch({
        ...searchParams,
        query: formattedQuery
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const exampleQueries = [
    { label: 'HTTP Servers', query: 'services.service_name: HTTP' },
    { label: 'DNS Servers', query: 'services.service_name: DNS' },
    { label: 'SSH Servers', query: 'services.service_name: SSH' },
    { label: 'US IP Addresses', query: 'location.country: "United States"' },
    { label: 'Nginx Servers', query: 'services.software.product: NGINX' }
  ];

  const setExampleQuery = (query: string) => {
    setSearchParams(prev => ({ ...prev, query }));
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-4">
          {/* Main search input */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="query"
                value={searchParams.query}
                onChange={handleInputChange}
                placeholder="Enter Censys search query (e.g., services.service_name: HTTP)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                aria-label="Search query"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 whitespace-nowrap"
              aria-label="Search"
            >
              Search Hosts
            </button>
          </div>
          
          {/* Advanced toggle */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              {advancedOpen ? 'Hide' : 'Show'} advanced options
              <svg 
                className={`ml-1 h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Advanced options */}
          {advancedOpen && (
            <div className="p-4 mt-2 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="virtual_hosts" className="block text-sm font-medium text-gray-700 mb-1">
                  Virtual Hosts
                </label>
                <select
                  id="virtual_hosts"
                  name="virtual_hosts"
                  value={searchParams.virtual_hosts || 'EXCLUDE'}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white"
                >
                  <option value="EXCLUDE">Exclude</option>
                  <option value="INCLUDE">Include</option>
                  <option value="ONLY">Only</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="per_page" className="block text-sm font-medium text-gray-700 mb-1">
                  Results per page
                </label>
                <select
                  id="per_page"
                  name="per_page"
                  value={searchParams.per_page || 10}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    per_page: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  id="sort"
                  name="sort"
                  value={searchParams.sort || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white"
                >
                  <option value="">Default (Relevance)</option>
                  <option value="+ip">IP Address (Ascending)</option>
                  <option value="-ip">IP Address (Descending)</option>
                  <option value="+autonomous_system.asn">ASN (Ascending)</option>
                  <option value="-autonomous_system.asn">ASN (Descending)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </form>
      
      {/* Example queries */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2 font-medium">Example queries:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((exampleQuery, index) => (
            <button
              key={index}
              onClick={() => setExampleQuery(exampleQuery.query)}
              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-800 rounded-full hover:bg-indigo-100 hover:text-indigo-800 transition-colors duration-200"
            >
              {exampleQuery.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
