import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';

export const usePathHelper = () => {
  const pathname = usePathname();
  
  // Extract the hreflang-countrycode from the URL path
  const parseUrlPath = (path) => {
    if (!path) return '';
    
    // Extract the first segment of the path (e.g., "en-lk" from "/en-lk/some/path")
    const firstSegment = path.replace(/^\//, '').split('/')[0];
    
    // Check if it matches the format: hreflang-countrycode
    const match = firstSegment.match(/^([a-z]{2})-([a-z]{2})$/i);
    
    if (match) {
      return `/${firstSegment}`;
    }
    
    return '';
  };
  
  // Get the pathPrefix from the current URL
  const pathPrefix = parseUrlPath(pathname);
  
  // Build a path with the pathPrefix
  const buildPath = (path) => {
    // If the path already starts with the pathPrefix or has its own hreflang-countrycode, return it as is
    if (pathPrefix && path.startsWith(pathPrefix)) {
      return path;
    }
    
    // If the path already has a hreflang-countrycode format
    if (path.match(/^\/[a-z]{2}-[a-z]{2}\//i)) {
      return path;
    }
    
    // If the path is just "/", add the prefix
    if (path === '/') {
      return `${pathPrefix}/`;
    }
    
    // For other paths, ensure we don't add double slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${pathPrefix}${cleanPath}`;
  };
  
  return {
    pathPrefix,
    buildPath
  };
};