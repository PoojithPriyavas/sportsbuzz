// utils/parseUrl.js
export function parseUrlPath(pathname) {
  const parts = pathname.split('/').filter(part => part !== '');
  
  // Default to empty strings if parts don't exist
  const countryCode = parts.length > 0 ? parts[0].toUpperCase() : '';
  const language = parts.length > 1 ? parts[1].toLowerCase() : '';
  
  return { countryCode, language };
}