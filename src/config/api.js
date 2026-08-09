/**
 * Global Configuration for HH Goa Builder ID & Community Architecture
 *
 * Toggle USE_MOCK_DATA to false when connecting to the official backend API.
 */

export const CONFIG = {
  // Keep true while developing without a real backend
  USE_MOCK_DATA: true,

  // Vite environment variables
  API_BASE_URL: import.meta.env.VITE_API_URL || '',

  // Optional API key
  API_KEY: import.meta.env.VITE_API_KEY || '',
};