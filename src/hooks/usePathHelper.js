import { useRouter } from 'next/router';
import { useMemo, useEffect, useState } from 'react';

export const usePathHelper = () => {
  const router = useRouter();
  const [currentPrefix, setCurrentPrefix] = useState('');

  // Update the prefix whenever the URL changes
  useEffect(() => {
    // Get the current path and decode it to handle special characters properly
    const currentPath = decodeURIComponent(router.asPath);

    // Improved regex to match language-country code pattern (e.g., en-in, hu-hu, de-de)
    // This will match both lowercase and uppercase country codes
    const langCountryMatch = currentPath.match(/^\/([a-z]{2}-[a-z]{2})/i);

    if (langCountryMatch) {
      console.log('Found language-country code in URL:', langCountryMatch[1]);
      setCurrentPrefix(`/${langCountryMatch[1]}`);
      return;
    }

    // If we're on a page with [countrycode-hreflng] in the route
    if (router.query && router.query['countrycode-hreflng']) {
      console.log('Found countrycode-hreflng in router query:', router.query['countrycode-hreflng']);
      setCurrentPrefix(`/${router.query['countrycode-hreflng']}`);
      return;
    }

    console.log('No language-country code found in URL');
    setCurrentPrefix('');
  }, [router.asPath, router.query]);

  const buildPath = (path) => {
    // Check if path is undefined or null
    if (path === undefined || path === null) {
      console.warn('DynamicLink received undefined or null path');
      return '/';
    }

    // If the path already includes the language-country code, return it as is
    if (path.match && path.match(/^\/[a-z]{2}-[a-z]{2}\//i)) {
      console.log('Path already contains language-country code:', path);
      return path;
    }

    // Ensure path starts with /
    const cleanPath = typeof path === 'string' && path.startsWith ?
      (path.startsWith('/') ? path : `/${path}`) :
      '/';
    const fullPath = `${currentPrefix}${cleanPath}`;

    console.log('Built path with prefix:', fullPath);
    return fullPath;
  };

  return { pathPrefix: currentPrefix, buildPath };
};