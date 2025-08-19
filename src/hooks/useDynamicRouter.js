import { useRouter } from 'next/router';
import { useMemo, useCallback } from 'react';

export const useDynamicRouter = () => {
  const router = useRouter();
  
  const pathPrefix = useMemo(() => {
    // Method 1: From router.query (most reliable for dynamic routes)
    if (router.query && router.query['countrycode-hreflng']) {
      return `/${router.query['countrycode-hreflng']}`;
    }
    
    // Method 2: From router.asPath with flexible regex
    const patterns = [
      /^\/([a-z]{2}-[a-z]{2})/i,
      /^\/([a-zA-Z]{2}-[a-zA-Z]{2})/,
      /^\/([a-z]{2}-[A-Z]{2})/
    ];
    
    for (const pattern of patterns) {
      const match = router.asPath.match(pattern);
      if (match) {
        return `/${match[1]}`;
      }
    }
    
    // Method 3: Check window.location as fallback
    if (typeof window !== 'undefined' && router.pathname.includes('[countrycode-hreflng]')) {
      const windowMatch = window.location.pathname.match(/^\/([a-zA-Z]{2}-[a-zA-Z]{2})/);
      if (windowMatch) {
        return `/${windowMatch[1]}`;
      }
    }
    
    return '';
  }, [router.asPath, router.pathname, router.query]);
  
  const buildPath = useCallback((path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${pathPrefix}${cleanPath}`;
  }, [pathPrefix]);
  
  const pushDynamic = useCallback(async (path, as, options) => {
    const dynamicPath = buildPath(path);
    // console.log('🚀 Dynamic router.push:', { original: path, dynamic: dynamicPath });
    return router.push(dynamicPath, as, options);
  }, [router, buildPath]);
  
  const replaceDynamic = useCallback(async (path, as, options) => {
    const dynamicPath = buildPath(path);
    // console.log('🚀 Dynamic router.replace:', { original: path, dynamic: dynamicPath });
    return router.replace(dynamicPath, as, options);
  }, [router, buildPath]);
  
  return {
    ...router,
    buildPath,
    pushDynamic,
    replaceDynamic,
    pathPrefix
  };
};