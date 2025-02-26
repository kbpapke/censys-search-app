'use client';

import { useEffect, useState } from 'react';

export default function EnvTest() {
  const [envVars, setEnvVars] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_CENSYS_API_ID: process.env.NEXT_PUBLIC_CENSYS_API_ID || 'Not set',
      NEXT_PUBLIC_CENSYS_SECRET_KEY: process.env.NEXT_PUBLIC_CENSYS_SECRET_KEY ? 'Is set (value hidden)' : 'Not set',
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <pre className="bg-gray-100 p-4 rounded-md">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  );
}
