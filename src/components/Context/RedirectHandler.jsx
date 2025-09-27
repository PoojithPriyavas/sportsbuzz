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

    // Function to handle redirection with country data
    const redirectWithCountryData = (hreflang, countryCode) => {
      // Construct the new URL with the prefix
      let newPath;
      if (pathname === '/' || pathname === '') {
        // For root path
        newPath = `/${hreflang}-${countryCode}/`;
      } else {
        // For other paths, preserve the path after adding the prefix
        // Remove leading slash if present
        const cleanPath = pathname.replace(/^\//, '');
        // Handle query parameters
        const [path, query] = cleanPath.split('?');
        newPath = `/${hreflang}-${countryCode}/${path}${query ? `?${query}` : ''}`;
      }
      
      console.log(`🔀 Client-side redirecting from ${pathname} to: ${newPath}`);
      
      // Redirect to the new URL
      router.replace(newPath, undefined, { shallow: true });
    };

    // Function to get country code and hreflang
    const getCountryData = async () => {
      try {
        setIsRedirecting(true);
        
        // First, try to get data from localStorage
        const storedCountryData = localStorage.getItem('userCountryData');
        
        if (storedCountryData) {
          const parsedData = JSON.parse(storedCountryData);
          if (parsedData && parsedData.country_code && parsedData.location && parsedData.location.hreflang) {
            console.log('📌 Using cached country data from localStorage');
            redirectWithCountryData(
              parsedData.location.hreflang.toLowerCase(), 
              parsedData.country_code.toLowerCase()
            );
            return;
          }
        }
        
        // If no cached data, call the API directly from the client
        console.log('📡 No cached data found, fetching from API on client side...');
        
        // Make a direct client-side API call to get the user's actual location
        const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/', {
          // Ensure this is a client-side request
          headers: {
            'Client-Side-Request': 'true'
          }
        });
        
        let countryData;
        if (response.ok) {
          countryData = await response.json();
          console.log('📌 Client-side country API response:', JSON.stringify(countryData));
          
          // Store in localStorage for future use
          localStorage.setItem('userCountryData', JSON.stringify(countryData));
        } else {
          console.error('❌ Client-side country API failed with status:', response.status);
          // Use fallback if API fails
          countryData = {
            country_code: 'LK',
            location: {
              hreflang: 'en'
            }
          };
          console.log('🔄 Using fallback values: en-lk');
        }

        // Get the hreflang and country code
        const hreflang = countryData.location.hreflang.toLowerCase();
        const countryCode = countryData.country_code.toLowerCase();
        
        redirectWithCountryData(hreflang, countryCode);
      } catch (error) {
        console.error('Error during client-side redirection:', error);
        
        // Use fallback values on error
        const fallbackPath = pathname === '/' 
          ? '/en-lk/' 
          : `/en-lk/${pathname.replace(/^\//, '')}`;
          
        console.log(`🔄 Error occurred, using fallback redirect to: ${fallbackPath}`);
        router.replace(fallbackPath, undefined, { shallow: true });
      }
    };

    // Execute the redirection
    getCountryData();
  }, [router.isReady, router.asPath, isRedirecting]);

  return null; // This component doesn't render anything
};

export default RedirectHandler;