// The API base URL is now a relative path that points to our Netlify proxy.
// This prevents CORS errors by making the browser think it's requesting
// data from the same domain. Netlify will forward the request to the real API.
export const API_BASE_URL = '/api';