'use client';

import { useEffect, useState } from 'react';

export default function EnvDebug() {
  const [clientEnvVars, setClientEnvVars] = useState<{ [key: string]: string }>({});
  const [loadTime, setLoadTime] = useState<string>('');
  
  useEffect(() => {
    // Record when this component loads
    setLoadTime(new Date().toISOString());
    
    // Get client-side environment variables
    setClientEnvVars({
      NEXT_PUBLIC_CENSYS_API_ID: process.env.NEXT_PUBLIC_CENSYS_API_ID || 'Not set',
      NEXT_PUBLIC_CENSYS_SECRET_KEY: process.env.NEXT_PUBLIC_CENSYS_SECRET_KEY ? 'Is set (value hidden)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
    });
    
    // Log to console as well
    console.log('Client-side Environment Variables:');
    console.log('NEXT_PUBLIC_CENSYS_API_ID exists:', Boolean(process.env.NEXT_PUBLIC_CENSYS_API_ID));
    console.log('NEXT_PUBLIC_CENSYS_SECRET_KEY exists:', Boolean(process.env.NEXT_PUBLIC_CENSYS_SECRET_KEY));
    console.log('NODE_ENV:', process.env.NODE_ENV);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Component Load Time</h2>
        <p className="text-gray-700">{loadTime}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Client-side Environment Variables</h2>
        <pre className="bg-gray-100 p-4 rounded-md">
          {JSON.stringify(clientEnvVars, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Make sure your .env.local file exists in the project root</li>
          <li>Ensure it contains NEXT_PUBLIC_CENSYS_API_ID and NEXT_PUBLIC_CENSYS_SECRET_KEY</li>
          <li>Restart your Next.js development server after changing .env files</li>
          <li>Variables must be prefixed with NEXT_PUBLIC_ to be accessible in the browser</li>
        </ul>
      </div>
    </div>
  );
}
