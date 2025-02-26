'use client';

import React from 'react';
import { censysConfig } from '../config/env';
import Link from 'next/link';

const CredentialsWarning: React.FC = () => {
  // Don't show the warning if credentials are present
  if (censysConfig.hasCredentials) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Missing API Credentials</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              The Censys API credentials are not configured. Please add the following environment variables:
            </p>
            <ul className="list-disc list-inside mt-1">
              <li>NEXT_PUBLIC_CENSYS_API_ID</li>
              <li>NEXT_PUBLIC_CENSYS_SECRET_KEY</li>
            </ul>
            <p className="mt-1">
              You can set these in your <code>.env.local</code> file for local development,
              or in your Vercel project settings for deployment.
            </p>
            <p className="mt-2">
              <a
                href="https://search.censys.io/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-800 underline"
              >
                Get your API credentials from Censys
              </a>
            </p>
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 font-medium">Having issues with environment variables?</p>
              <Link 
                href="/env-debug" 
                className="inline-block mt-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                View Environment Debug Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsWarning;
