'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const RedirectHandler = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const currentPath = router.asPath;
    
    // Check if already has locale format (xx-xx)
    const firstSegment = currentPath.split('/')[1];
    if (firstSegment && /^[a-z]{2}-[a-z]{2}$/i.test(firstSegment)) {
      console.log('Already localized, skipping redirect');
      return;
    }

    const redirect = (lang, country) => {
      const newPath = currentPath === '/' 
        ? `/${lang}-${country}/` 
        : `/${lang}-${country}${currentPath}`;
      
      console.log(`Redirecting to: ${newPath}`);
      router.replace(newPath);
    };

    const callAPI = async () => {
      console.log('=== STARTING API CALL ===');
      
      try {
        const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('=== API SUCCESS ===');
        console.log('Raw response:', JSON.stringify(data, null, 2));
        
        // Just use whatever the API gives us
        const lang = data.language || data.hreflang || data.location?.hreflang || 'en';
        const country = data.country_code || data.countryCode || data.country || 'lk';
        
        console.log(`Using API values: ${lang}-${country}`);
        redirect(lang.toLowerCase(), country.toLowerCase());
        
      } catch (error) {
        console.log('=== API FAILED ===');
        console.log('Error:', error.message);
        console.log('Using fallback: en-lk');
        redirect('en', 'lk');
      }
    };

    callAPI();

  }, [router.isReady, router.asPath]);

  return null;
};

export default RedirectHandler;