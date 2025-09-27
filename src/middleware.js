// src/middleware.js

import { NextResponse } from 'next/server';
import { processCountryCodeResponseSync, handleCountryCodeErrorSync } from './utils/countryFallback';

export async function middleware(request) {
  console.log('🚀 Middleware: Location-based URL handling started');
  
  const url = request.nextUrl.clone();
  let pathname = url.pathname;
  
  // Skip middleware for API routes, static files, and other excluded paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if URL already has language-country format
  const hasLanguageCountryFormat = /^\/[a-z]{2}-[a-z]{2}(\/|$)/i.test(pathname);
  
  // Check for language change in the request
  const languageParam = url.searchParams.get('setLanguage');
  
  // If there's a language change request and URL has proper format
  if (languageParam && hasLanguageCountryFormat) {
    console.log(`🔄 Language change requested to: ${languageParam}`);
    
    // Extract current country code from URL
    const match = pathname.match(/^\/([a-z]{2})-([a-z]{2})(\/|$)/i);
    if (match) {
      const currentCountryCode = match[2];
      
      // Split the path to get the part after the language-country prefix
      const pathParts = pathname.split('/');
      
      // Remove the first element (empty string before first slash)
      pathParts.shift();
      
      // Remove the language-country part (first segment)
      pathParts.shift();
      
      // Reconstruct the path after the prefix
      const pathAfterPrefix = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
      
      // Create the new URL with updated language
      const newPath = `/${languageParam}-${currentCountryCode}${pathAfterPrefix}`;
      
      console.log(`🔄 Redirecting to new language path: ${newPath}`);
      
      // Remove the setLanguage parameter
      url.searchParams.delete('setLanguage');
      url.pathname = newPath;
      
      const response = NextResponse.redirect(url, 302);
      
      // Store the selected language in a cookie
      response.cookies.set('selectedLanguage', languageParam, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return response;
    }
  }
  
  // If URL already has proper format and no language change, proceed normally
  if (hasLanguageCountryFormat) {
    return NextResponse.next();
  }

  // If it's the root path or doesn't have language-country format, redirect to API-determined location
  try {
    // First fetch locations data to have it available for fallback
    console.log('📡 Fetching locations data...');
    const locationsRes = await fetch('https://admin.sportsbuz.com/api/locations', {
      cache: 'no-store'
    });
    
    let locationsData = [];
    if (locationsRes.ok) {
      locationsData = await locationsRes.json();
      console.log('✅ Locations API success, found', locationsData.length, 'locations');
    } else {
      console.error('❌ Locations API failed:', locationsRes.status);
    }
    
    // Now fetch country code
    console.log('📡 Fetching country code...');
    const countryRes = await fetch('https://admin.sportsbuz.com/api/get-country-code/', {
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
      },
      cache: 'no-store'
    });
    
    let countryData;
    let usingSriLankaFallback = false;
    
    if (countryRes.ok) {
      const data = await countryRes.json();
      console.log('📌 Country API response:', JSON.stringify(data));
      
      // Check if the response has valid country_code
      if (data && data.country_code) {
        console.log('✅ Valid country code found in API response:', data.country_code);
        countryData = data;
      } else {
        console.log('⚠️ Invalid or missing country code in API response, using Sri Lanka fallback');
        usingSriLankaFallback = true;
        
        // Find Sri Lanka in locations data
        const sriLankaLocation = locationsData.find(location => 
          location.country_code === "LK"
        );
        
        if (sriLankaLocation) {
          console.log('✅ Found Sri Lanka in locations data:', JSON.stringify(sriLankaLocation));
          
          // Format Sri Lanka data to match get-country-code API response
          countryData = {
            country_code: sriLankaLocation.country_code,
            location: { ...sriLankaLocation }
          };
        } else {
          console.log('⚠️ Sri Lanka not found in locations data, using hardcoded fallback');
          
          // Hardcoded fallback as last resort
          countryData = {
            country_code: "LK",
            location: {
              id: 17,
              country: "Sri Lanka",
              language: "English",
              hreflang: "en",
              country_code: "LK",
              betting_apps: "Inactive",
              sports: "Cricket"
            }
          };
        }
      }
    } else {
      console.error('❌ Country API failed:', countryRes.status);
      console.log('⚠️ Country API failed, using Sri Lanka fallback');
      usingSriLankaFallback = true;
      
      // Find Sri Lanka in locations data
      const sriLankaLocation = locationsData.find(location => 
        location.country_code === "LK"
      );
      
      if (sriLankaLocation) {
        console.log('✅ Found Sri Lanka in locations data:', JSON.stringify(sriLankaLocation));
        
        // Format Sri Lanka data to match get-country-code API response
        countryData = {
          country_code: sriLankaLocation.country_code,
          location: { ...sriLankaLocation }
        };
      } else {
        console.log('⚠️ Sri Lanka not found in locations data, using hardcoded fallback');
        
        // Hardcoded fallback as last resort
        countryData = {
          country_code: "LK",
          location: {
            id: 17,
            country: "Sri Lanka",
            language: "English",
            hreflang: "en",
            country_code: "LK",
            betting_apps: "Inactive",
            sports: "Cricket"
          }
        };
      }
    }
    
    const countryCode = countryData.country_code;
    console.log('📌 Final country code to use:', countryCode);
    console.log('📌 Using Sri Lanka fallback:', usingSriLankaFallback);
    
    // Check for stored language preference
    const storedLanguage = request.cookies.get('selectedLanguage')?.value;
    
    // Find default language for the country
    const countryInfo = locationsData.find(location => 
      location.country_code === countryCode
    );
    
    // Use stored language if available, otherwise use default language for the country
    const defaultLanguage = storedLanguage || (countryInfo ? countryInfo.hreflang : 'en');
    console.log('📌 Language to use:', defaultLanguage);
    
    // Construct new URL with language-country format
    const newPathname = `/${defaultLanguage}-${countryCode.toLowerCase()}${pathname === '/' ? '/' : pathname}`;
    url.pathname = newPathname;
    
    console.log(`🔄 Redirecting from ${pathname} to ${newPathname}`);
    console.log(`📌 Is this a Sri Lanka fallback URL? ${countryCode === 'LK' && usingSriLankaFallback ? 'YES' : 'NO'}`);
    
    // Create response with redirect
    const response = NextResponse.redirect(url, 302);
    
    // Set cookies with country data
    response.cookies.set('countryData', JSON.stringify(countryData), {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Set cookies with filtered location data
    if (countryInfo) {
      const locationData = {
        country_code: countryCode,
        filtered_locations: [countryInfo],
        hreflang_tags: [countryInfo.hreflang]
      };
      
      response.cookies.set('locationData', JSON.stringify(locationData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Store all location data for reference
      response.cookies.set('lanTagValues', JSON.stringify(locationsData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Middleware error:', error);
    
    // Ultimate fallback to en-lk
    const fallbackPathname = `/en-lk${pathname === '/' ? '/' : pathname}`;
    url.pathname = fallbackPathname;
    
    console.log(`🔄 Ultimate error fallback redirect from ${pathname} to ${fallbackPathname}`);
    console.log('📌 Using hardcoded Sri Lanka fallback due to error');
    
    return NextResponse.redirect(url, 302);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};