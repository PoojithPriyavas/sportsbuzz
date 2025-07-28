// utils/parseUrl.js
export function parseUrlPath(pathname) {
  if (typeof pathname !== 'string') return { countryCode: '', language: '' };

  const parts = pathname.split('/').filter(part => part !== '');

  const countryCode = parts.length > 0 ? parts[0].toUpperCase() : '';
  const language = parts.length > 1 ? parts[1].toLowerCase() : '';

  return { countryCode, language };
}
