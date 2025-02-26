// Environment variables for the Censys API
// These must be set in your .env.local file

// Log for debugging
console.log('Reading environment variables:');
console.log('NEXT_PUBLIC_CENSYS_API_ID exists:', Boolean(process.env.NEXT_PUBLIC_CENSYS_API_ID));
console.log('NEXT_PUBLIC_CENSYS_SECRET_KEY exists:', Boolean(process.env.NEXT_PUBLIC_CENSYS_SECRET_KEY));

// Use only environment variables, no fallbacks
const API_ID = process.env.NEXT_PUBLIC_CENSYS_API_ID || '';
const SECRET_KEY = process.env.NEXT_PUBLIC_CENSYS_SECRET_KEY || '';

export const censysConfig = {
  API_ID,
  SECRET_KEY,
  hasCredentials: Boolean(API_ID && SECRET_KEY),
  usingFallbackCredentials: false  // No fallbacks anymore
};

// Also log the final result
console.log('censysConfig.hasCredentials:', censysConfig.hasCredentials);
console.log('censysConfig.usingFallbackCredentials:', censysConfig.usingFallbackCredentials);
