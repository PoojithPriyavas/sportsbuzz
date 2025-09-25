// src/middleware.js

import { NextResponse } from 'next/server';
import { sriLankaFallbackData, processCountryCodeResponse, handleCountryCodeError } from './utils/countryFallback';

export async function middleware(request) {
  console.log('🚀 Middleware: Location-based URL handling started');
  
  const url = request.nextUrl.clone();
  let pathname = url.pathname;
  
  // Special handling for blog-details URLs to preserve special characters
  const isBlogDetailsUrl = pathname.includes('/blog-details/');
  
  // Only decode pathname for non-blog-details URLs
  if (!isBlogDetailsUrl) {
    try {
      pathname = decodeURIComponent(pathname);
      console.log('📝 Decoded pathname:', pathname);
    } catch (error) {
      console.warn('⚠️ Failed to decode pathname:', error);
      // Continue with original pathname if decoding fails
    }
  } else {
    console.log('📰 Blog details URL detected, preserving original encoding:', pathname);
  }
  
  // Skip middleware for API routes, static files, and other excluded paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Enhanced regex to check if URL already has language-country format
  // For blog-details URLs, use the original pathname to avoid decoding issues
  const pathToCheck = isBlogDetailsUrl ? url.pathname : pathname;
  const hasLanguageCountryFormat = /^\/[a-z]{2}-[a-z]{2}(\/|$)/i.test(pathToCheck);
  
  // SCENARIO 2: URL already has proper hreflang format
  if (hasLanguageCountryFormat) {
    console.log('✅ Scenario 2: URL has language-country format, proceeding normally');
    console.log('🔗 Processing path:', pathToCheck);
    
    // Check if this is a blog-details route with potentially problematic characters
    const blogDetailsMatch = pathToCheck.match(/^\/([a-z]{2}-[a-z]{2})\/blog-details\/(.+)$/i);
    if (blogDetailsMatch) {
      const [, langCountry, blogSlug] = blogDetailsMatch;
      console.log('📰 Blog details route detected:', { langCountry, blogSlug });
      
      // For blog details, don't decode the slug to preserve special characters
      console.log('🔄 Preserving original blog slug encoding');
    }
    
    // Set cookies but don't redirect
    const response = NextResponse.next();
    await setCookies(request, response);
    return response;
  }

  // SCENARIO 1: URL doesn't have hreflang format - need location detection
  console.log('🔄 Scenario 1: URL missing language-country format, detecting location');
  
  try {
    // Get user's location
    const countryCode = await getUserLocation(request);
    console.log('📍 Detected country code:', countryCode);
    
    // Get available locations data
    const locationsData = await getLocationsData();
    
    // Find default language for detected country
    const defaultLanguage = getDefaultLanguageForCountry(countryCode, locationsData);
    console.log('🌐 Default language for country:', defaultLanguage);
    
    // Construct new URL with language-country format
    const newPathname = `/${defaultLanguage}-${countryCode.toLowerCase()}${pathToCheck}`;
    url.pathname = newPathname;
    
    console.log(`🔄 Redirecting from ${pathToCheck} to ${newPathname}`);
    
    // Perform 302 temporary redirect
    const response = NextResponse.redirect(url, 302);
    
    // Set cookies for the redirected response
    await setCookies(request, response, countryCode, locationsData);
    
    return response;
    
  } catch (error) {
    console.error('❌ Middleware error:', error);
    
    // Fallback: redirect to Sri Lanka (en-lk) instead of India
    const fallbackCountryData = handleCountryCodeError(error);
    const fallbackCountryCode = fallbackCountryData.country_code;
    const fallbackLanguage = fallbackCountryData.location.hreflang;
    
    const newPathname = `/${fallbackLanguage}-${fallbackCountryCode.toLowerCase()}${pathToCheck}`;
    url.pathname = newPathname;
    
    console.log(`🔄 Fallback redirect from ${pathToCheck} to ${newPathname} (Sri Lanka)`);
    
    const response = NextResponse.redirect(url, 302);
    
    // Set fallback cookies with Sri Lanka data
    await setCookies(request, response, fallbackCountryCode, null);
    
    return response;
  }
}

// Helper function to get user's location
async function getUserLocation(request) {
  // Check if country data already exists in cookies
  const existingCountryData = request.cookies.get('countryData');
  
  if (existingCountryData) {
    try {
      const parsedData = JSON.parse(existingCountryData.value);
      const countryCode = parsedData.country_code || parsedData.countryCode;
      if (countryCode) {
        console.log('📦 Using cached country code:', countryCode);
        return countryCode;
      }
    } catch (error) {
      console.error('Error parsing cached country data:', error);
    }
  }

  // Fetch from API if not cached
  try {
    console.log('🌍 Fetching country code from API...');
    const countryRes = await fetch('https://admin.sportsbuz.com/api/get-country-code/', {
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
      },
    });
    
    if (!countryRes.ok) {
      throw new Error(`Country API failed: ${countryRes.status}`);
    }
    
    const rawCountryData = await countryRes.json();
    const countryData = processCountryCodeResponse(rawCountryData);
    
    return countryData.country_code || countryData.countryCode || sriLankaFallbackData.country_code;
    
  } catch (error) {
    console.error('Failed to fetch country code:', error);
    // Use Sri Lanka fallback instead of India
    return sriLankaFallbackData.country_code;
  }
}

// Helper function to get locations data
async function getLocationsData() {
  try {
    console.log('🗺️ Fetching locations data...');
    const locationsRes = await fetch('https://admin.sportsbuz.com/api/locations');
    
    if (!locationsRes.ok) {
      throw new Error(`Locations API failed: ${locationsRes.status}`);
    }
    
    return await locationsRes.json();
    
  } catch (error) {
    console.error('Failed to fetch locations data:', error);
    return null;
  }
}

// Helper function to get default language for country
function getDefaultLanguageForCountry(countryCode, locationsData) {
  if (!locationsData || !Array.isArray(locationsData)) {
    return 'en'; // fallback language
  }

  const countryLanguages = locationsData.filter(location => 
    location.country_code?.toLowerCase() === countryCode?.toLowerCase()
  );

  return countryLanguages.length > 0 ? countryLanguages[0].hreflang : 'en';
}

// Helper function to set cookies
async function setCookies(request, response, countryCode = null, locationsData = null) {
  const existingCountryData = request.cookies.get('countryData');
  const existingLocationData = request.cookies.get('locationData');

  try {
    let finalCountryCode = countryCode;
    let finalCountryData = null;

    // Handle country data cookie
    if (!existingCountryData && countryCode) {
      // Create country data object
      finalCountryData = {
        country_code: countryCode,
        // Add additional country info if available from locations data
      };

      response.cookies.set('countryData', JSON.stringify(finalCountryData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

    } else if (existingCountryData && !countryCode) {
      // Extract country code from existing cookie
      const existingData = JSON.parse(existingCountryData.value);
      finalCountryCode = existingData.country_code || existingData.countryCode;
    }

    // Handle location data cookie
    if (!existingLocationData && finalCountryCode) {
      let finalLocationsData = locationsData;
      
      // Fetch locations data if not provided
      if (!finalLocationsData) {
        finalLocationsData = await getLocationsData();
      }

      if (finalLocationsData) {
        // Filter locations based on country code
        const filteredLocations = finalLocationsData.filter(
          location => location.country_code?.toLowerCase() === finalCountryCode?.toLowerCase()
        );

        // Extract hreflang values from filtered locations
        const hreflangTags = filteredLocations.map(location => location.hreflang);

        const locationFilterData = {
          country_code: finalCountryCode,
          hreflang_tags: hreflangTags,
          filtered_locations: filteredLocations,
          total_matches: filteredLocations.length
        };

        response.cookies.set('locationData', JSON.stringify(locationFilterData), {
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        // Store all location data for reference
        response.cookies.set('lanTagValues', JSON.stringify(finalLocationsData), {
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
    }

  } catch (err) {
    console.error('Error setting cookies:', err);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}