import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const usePathHelper = () => {
  const router = useRouter();
  
  const pathPrefix = useMemo(() => {
    // Get the current path
    const currentPath = router.asPath;
    
    // Improved regex to match language-country code pattern (e.g., en-US, fr-FR)
    // This will match patterns like /en-US/ at the beginning of the URL
    const langCountryMatch = currentPath.match(/^\/([a-z]{2}-[A-Z]{2})/);
    
    if (langCountryMatch) {
      // console.log('Found language-country code in URL:', langCountryMatch[1]);
      return `/${langCountryMatch[1]}`;
    }
    
    // If we're on a page with [countrycode-hreflng] in the route
    if (router.query && router.query['countrycode-hreflng']) {
      // console.log('Found countrycode-hreflng in router query:', router.query['countrycode-hreflng']);
      return `/${router.query['countrycode-hreflng']}`;
    }
    
    // console.log('No language-country code found in URL');
    return '';
  }, [router.asPath, router.query]);
  
  const buildPath = (path) => {
    // Check if path is undefined or null
    if (path === undefined || path === null) {
      console.warn('DynamicLink received undefined or null path');
      return '/';
    }
    
    // If the path already includes the language-country code, return it as is
    if (path.match && path.match(/^\/[a-z]{2}-[A-Z]{2}\//)) {
      // console.log('Path already contains language-country code:', path);
      return path;
    }
    
    // Ensure path starts with /
    const cleanPath = typeof path === 'string' && path.startsWith ? 
      (path.startsWith('/') ? path : `/${path}`) : 
      '/';
    const fullPath = `${pathPrefix}${cleanPath}`;
    
    // console.log('Built path with prefix:', fullPath);
    return fullPath;
  };
  
  return { pathPrefix, buildPath };
};