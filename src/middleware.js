// src/middleware.js

import { NextResponse } from 'next/server';

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve));

export async function middleware(request) {
  console.log('🚀 Middleware: Fetching location data and setting cookies');
  
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

  try {
    // Add a small delay before starting API calls to ensure stability
    await delay(500);
    
    // Step 1: Get country code from API
    console.log('📡 Fetching country code...');
    const countryRes = await fetch('https://admin.sportsbuz.com/api/get-country-code/', {
      // headers: {
      //   'User-Agent': request.headers.get('user-agent') || '',
      //   'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      //   'X-Real-IP': request.headers.get('x-real-ip') || '',
      // },
      // cache: 'no-store'
    });
    
    let countryData;
    if (countryRes.ok) {
      countryData = await countryRes.json();
      console.log('📌 Country API response:', JSON.stringify(countryData));
    } else {
      console.error('❌ Country API failed with status:', countryRes.status);
    }
    
    // Step 2: Get locations data
    console.log('📡 Fetching locations data...');
    const locationsRes = await fetch('https://admin.sportsbuz.com/api/locations', {
      // cache: 'no-store'
    });
    
    let locationsData = [];
    if (locationsRes.ok) {
      locationsData = await locationsRes.json();
      console.log('✅ Locations API success, found', locationsData.length, 'locations');
    } else {
      console.error('❌ Locations API failed with status:', locationsRes.status);
    }
    
    // Check if we're at the root URL and need to redirect
    if (pathname === '/' && countryData && countryData.country_code && countryData.location && countryData.location.hreflang) {
      // Get the hreflang and country code from the API response
      const hreflang = countryData.location.hreflang.toLowerCase();
      const countryCode = countryData.country_code.toLowerCase();
      
      // Create the redirect URL
      const redirectUrl = `/${hreflang}-${countryCode}/`;
      console.log(`🔀 Redirecting from root to: ${redirectUrl}`);
      
      // Create a redirect response
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));
      
      // Set cookies before redirecting
      if (countryData) {
        response.cookies.set('countryData', JSON.stringify(countryData), {
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
      
      if (locationsData.length > 0) {
        response.cookies.set('lanTagValues', JSON.stringify(locationsData), {
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        if (countryData && countryData.country_code) {
          const countryInfo = locationsData.find(location => 
            location.country_code === countryData.country_code
          );
          
          if (countryInfo) {
            const locationData = {
              country_code: countryData.country_code,
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
          }
        }
      }
      
      return response;
    }
    
    // Create response (continue with normal request processing)
    const response = NextResponse.next();
    
    // Step 3: Set cookies with fetched data
    if (countryData) {
      response.cookies.set('countryData', JSON.stringify(countryData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      console.log('✅ Country data cookie set');
    }
    
    if (locationsData.length > 0) {
      // Store all location data
      response.cookies.set('lanTagValues', JSON.stringify(locationsData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      console.log('✅ Locations data cookie set');
      
      // If we have country data, also set filtered location data
      if (countryData && countryData.country_code) {
        const countryInfo = locationsData.find(location => 
          location.country_code === countryData.country_code
        );
        
        if (countryInfo) {
          const locationData = {
            country_code: countryData.country_code,
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
          console.log('✅ Filtered location data cookie set');
        }
      }
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Middleware error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Even on error, continue with normal request processing
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};