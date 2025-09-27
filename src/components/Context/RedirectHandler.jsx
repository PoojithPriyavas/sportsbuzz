'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

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
    if (hasHreflangCountryFormat) {
      // Extract country code and hreflang from URL and update cookies
      const [hreflang, countryCode] = firstSegment.split('-');
      if (hreflang && countryCode) {
        // Update cookies with the values from URL
        try {
          const countryDataCookie = Cookies.get('countryData');
          if (countryDataCookie) {
            const parsedCountryData = JSON.parse(countryDataCookie);
            // Only update if different from current
            if (parsedCountryData.country_code.toLowerCase() !== countryCode || 
                parsedCountryData.location.hreflang.toLowerCase() !== hreflang) {
              
              // Find location data for this country code
              const lanTagValuesCookie = Cookies.get('lanTagValues');
              if (lanTagValuesCookie) {
                const locations = JSON.parse(lanTagValuesCookie);
                const countryInfo = locations.find(loc => 
                  loc.country_code.toLowerCase() === countryCode.toUpperCase()
                );
                
                if (countryInfo) {
                  // Update countryData cookie
                  const newCountryData = {
                    country_code: countryInfo.country_code,
                    location: { ...countryInfo }
                  };
                  Cookies.set('countryData', JSON.stringify(newCountryData), { expires: 1 });
                }
              }
            }
          }
        } catch (error) {
          console.error('Error updating cookies from URL:', error);
        }
      }
      return;
    }

    // Function to handle redirection
    const handleRedirection = () => {
      setIsRedirecting(true);
      
      // Try to get country data from cookie first
      const countryDataCookie = Cookies.get('countryData');
      
      if (countryDataCookie) {
        try {
          const countryData = JSON.parse(countryDataCookie);
          redirectWithCountryData(countryData);
        } catch (error) {
          console.error('Error parsing countryData cookie:', error);
          fetchCountryDataAndRedirect();
        }
      } else {
        fetchCountryDataAndRedirect();
      }
    };

    // Function to redirect with country data
    const redirectWithCountryData = (countryData) => {
      if (!countryData || !countryData.country_code || !countryData.location || !countryData.location.hreflang) {
        console.error('Invalid country data for redirection:', countryData);
        fetchCountryDataAndRedirect();
        return;
      }

      const hreflang = countryData.location.hreflang.toLowerCase();
      const countryCode = countryData.country_code.toLowerCase();
      
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
      router.replace(newPath);
    };

    // Function to fetch country data from API and redirect
    const fetchCountryDataAndRedirect = async () => {
      try {
        console.log('📡 Fetching country code from client...');
        // Call the API to get country code
        const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
        
        let countryData;
        if (response.ok) {
          countryData = await response.json();
          console.log('📌 Client-side country API response:', JSON.stringify(countryData));
          
          // Save to cookie for future use
          Cookies.set('countryData', JSON.stringify(countryData), { expires: 1 });
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

        redirectWithCountryData(countryData);
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
    handleRedirection();
  }, [router.isReady, router.asPath, isRedirecting]);

  return null; // This component doesn't render anything
};

export default RedirectHandler;