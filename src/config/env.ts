// Environment variables for the Censys API
// These must be set in your .env.local file

const API_ID = process.env.NEXT_PUBLIC_CENSYS_API_ID || '';
const SECRET_KEY = process.env.NEXT_PUBLIC_CENSYS_SECRET_KEY || '';

export const censysConfig = {
  API_ID,
  SECRET_KEY,
  hasCredentials: Boolean(API_ID && SECRET_KEY)
};