import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const usePathHelper = () => {
  const router = useRouter();
  
  const pathPrefix = useMemo(() => {
    const currentPath = router.asPath;
    
    const langCountryMatch = currentPath.match(/^\/([a-z]{2}-[A-Z]{2})/);
    
    if (langCountryMatch) {
      return `/${langCountryMatch[1]}`;
    }
    
    return '';
  }, [router.asPath]);
  
  const buildPath = (path) => {
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${pathPrefix}${cleanPath}`;
  };
  
  return { pathPrefix, buildPath };
};