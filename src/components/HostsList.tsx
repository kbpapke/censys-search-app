'use client';

import { CensysHost } from '@/services/censysApi';
import { useState } from 'react';

interface HostsListProps {
  hosts: CensysHost[];
}

const HostsList = ({ hosts }: HostsListProps) => {
  const [expandedHost, setExpandedHost] = useState<string | null>(null);

  if (hosts.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200 text-center">
        <svg 
          className="h-12 w-12 mx-auto text-slate-300 mb-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
          />
        </svg>
        <h3 className="text-lg font-medium text-slate-800 mb-1">No hosts found</h3>
        <p className="text-slate-500">Try modifying your search query or filters.</p>
      </div>
    );
  }

  const toggleHostExpand = (ip: string) => {
    setExpandedHost(prevIp => prevIp === ip ? null : ip);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-[1fr_180px_120px_80px] font-medium bg-slate-800 text-white p-4">
        <div>Host</div>
        <div className="text-center">Protocols</div>
        <div className="text-center">Location</div>
        <div className="text-center">Details</div>
      </div>
      
      <div className="divide-y divide-slate-200">
        {hosts.map((host, index) => (
          <div key={index} className="group">
            {/* Main row */}
            <div 
              className={`grid grid-cols-[1fr_180px_120px_80px] p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                expandedHost === host.ip ? 'bg-slate-50' : ''
              }`}
              onClick={() => toggleHostExpand(host.ip)}
            >
              <div>
                <div className="font-medium text-slate-900">{host.ip}</div>
                {host.name && <div className="text-xs text-slate-700 mt-1">{host.name}</div>}
                {host.autonomous_system && (
                  <div className="text-xs text-slate-700 mt-1">
                    AS{host.autonomous_system.asn} {host.autonomous_system.name}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <div className="flex space-x-1">
                  {host.services.slice(0, 3).map((service, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800 font-medium"
                      title={`${service.service_name || 'Unknown'} on port ${service.port}`}
                    >
                      {service.service_name || service.port}
                    </span>
                  ))}
                  {host.services.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-700 font-medium">
                      +{host.services.length - 3}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                {host.location ? (
                  <div className="flex items-center">
                    {host.location.country_code && (
                      <span className="text-xs font-medium text-slate-900">
                        {host.location.country_code}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-600">Unknown</span>
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <button
                  className="rounded-full p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHostExpand(host.ip);
                  }}
                >
                  <svg 
                    className={`h-5 w-5 transition-transform ${expandedHost === host.ip ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Expanded details */}
            {expandedHost === host.ip && (
              <div className="bg-slate-50 px-4 pb-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Services section */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h3 className="font-medium text-slate-800 mb-3">Services</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left pb-2 pr-2 font-medium text-slate-800">Port</th>
                          <th className="text-left pb-2 pr-2 font-medium text-slate-800">Protocol</th>
                          <th className="text-left pb-2 font-medium text-slate-800">Service</th>
                        </tr>
                      </thead>
                      <tbody>
                        {host.services.map((service, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0">
                            <td className="py-2 pr-2 text-slate-900">{service.port}</td>
                            <td className="py-2 pr-2 text-slate-900">{service.transport_protocol || '-'}</td>
                            <td className="py-2 text-slate-900">{service.service_name || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Location & AS Info */}
                  <div>
                    {/* Location info */}
                    {host.location && (
                      <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                        <h3 className="font-medium text-slate-800 mb-3">Location</h3>
                        <div className="space-y-2 text-sm">
                          {host.location.country && (
                            <div className="flex justify-between">
                              <span className="text-slate-700">Country:</span>
                              <span className="text-slate-900 font-medium">{host.location.country} {host.location.country_code ? `(${host.location.country_code})` : ''}</span>
                            </div>
                          )}
                          {host.location.continent && (
                            <div className="flex justify-between">
                              <span className="text-slate-700">Continent:</span>
                              <span className="text-slate-900 font-medium">{host.location.continent}</span>
                            </div>
                          )}
                          {host.location.timezone && (
                            <div className="flex justify-between">
                              <span className="text-slate-700">Timezone:</span>
                              <span className="text-slate-900 font-medium">{host.location.timezone}</span>
                            </div>
                          )}
                          {host.location.coordinates && (
                            <div className="flex justify-between">
                              <span className="text-slate-700">Coordinates:</span>
                              <span className="text-slate-900 font-medium">
                                {host.location.coordinates.latitude}, {host.location.coordinates.longitude}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* AS Info */}
                    {host.autonomous_system && (
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <h3 className="font-medium text-slate-800 mb-3">Autonomous System</h3>
                        <div className="space-y-2 text-sm">
                          {host.autonomous_system.asn && (
                            <div className="flex justify-between">
                              <span className="text-slate-700">ASN:</span>
                              <span className="text-slate-900 font-medium">{host.autonomous_system.asn}</span>
                            </div>
                          )}
                          {host.autonomous_system.name && (
                            <div className="flex justify-between">
                              <span className="text-slate-700">Name:</span>
                              <span className="text-slate-900 font-medium">{host.autonomous_system.name}</span>
                            </div>
                          )}
                          {host.autonomous_system.bgp_prefix && (
                            <div className="flex justify-between">
                              <span className="text-slate-700">BGP Prefix:</span>
                              <span className="text-slate-900 font-medium">{host.autonomous_system.bgp_prefix}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostsList;
