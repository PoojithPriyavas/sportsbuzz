// src/middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const response = NextResponse.next();
  const existingCountryData = request.cookies.get('countryData');
  const existingLocationData = request.cookies.get('locationData');

  try {
    let countryCode = null;

    // Only fetch country data if it doesn't exist
    if (!existingCountryData) {
      const countryRes = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
      const countryData = await countryRes.json();

      response.cookies.set('countryData', JSON.stringify(countryData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      // Extract country code from the fresh data
      countryCode = countryData.country_code || countryData.countryCode;
    } else {
      // Extract country code from existing cookie
      const existingData = JSON.parse(existingCountryData.value);
      countryCode = existingData.country_code || existingData.countryCode;
    }

    // Only fetch and filter location data if it doesn't exist and we have a country code
    if (!existingLocationData && countryCode) {
      const locationsRes = await fetch('https://admin.sportsbuz.com/api/locations');
      const locationsData = await locationsRes.json();

      // Filter locations based on country code and extract hreflang values
      const filteredLocations = locationsData.filter(
        location => location.country_code === countryCode
      );

      // Extract hreflang values from filtered locations
      const hreflangTags = filteredLocations.map(location => location.hreflang);

      // Store the filtered data
      const locationFilterData = {
        country_code: countryCode,
        hreflang_tags: hreflangTags,
        filtered_locations: filteredLocations,
        total_matches: filteredLocations.length
      };

      response.cookies.set('locationData', JSON.stringify(locationFilterData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
      response.cookies.set('lanTagValues', JSON.stringify(locationsData), {
        path: '/',
        maxAge: 60 * 60 * 24,
      });
    }

  } catch (err) {
    console.error('Middleware error:', err);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}