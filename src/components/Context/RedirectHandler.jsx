'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const RedirectHandler = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only run this effect when the router is ready and not already redirecting
    if (!router.isReady || isRedirecting) return;

    const pathname = router.asPath;
    
    // Extract the first segment of the path to check if it has the hreflang-countrycode format
    const firstSegment = pathname.replace(/^\//, '').split('/')[0];
    const hasHreflangCountryFormat = /^[a-z]{2}-[a-z]{2}$/i.test(firstSegment);

    // If the URL already has the correct format, don't redirect
    if (hasHreflangCountryFormat) return;

    // Function to get country code and hreflang
    const getCountryData = async () => {
      try {
        setIsRedirecting(true);
        
        // Call the API to get country code
        const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
        
        let countryData;
        if (response.ok) {
          countryData = await response.json();
        } else {
          // Use fallback if API fails
          countryData = {
            country_code: 'LK',
            location: {
              hreflang: 'en'
            }
          };
        }

        // Get the hreflang and country code
        const hreflang = countryData.location.hreflang.toLowerCase();
        const countryCode = countryData.country_code.toLowerCase();
        
        // Construct the new URL with the prefix
        let newPath;
        if (pathname === '/') {
          // For root path
          newPath = `/${hreflang}-${countryCode}/`;
        } else {
          // For other paths, preserve the path after adding the prefix
          const cleanPath = pathname.replace(/^\//, '');
          newPath = `/${hreflang}-${countryCode}/${cleanPath}`;
        }
        
        console.log(`🔀 Redirecting from ${pathname} to: ${newPath}`);
        
        // Redirect to the new URL
        router.replace(newPath);
      } catch (error) {
        console.error('Error during client-side redirection:', error);
        
        // Use fallback values on error
        const fallbackPath = pathname === '/' 
          ? '/en-lk/' 
          : `/en-lk/${pathname.replace(/^\//, '')}`;
          
        console.log(`🔄 Error occurred, using fallback redirect to: ${fallbackPath}`);
        router.replace(fallbackPath);
      }
    };

    // Execute the redirection
    getCountryData();
  }, [router.isReady, router.asPath, isRedirecting]);

  return null; // This component doesn't render anything
};

export default RedirectHandler;