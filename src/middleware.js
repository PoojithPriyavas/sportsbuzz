// src/middleware.js

import { NextResponse } from 'next/server';

export async function middleware(request) {
  console.log('🚀 Middleware: Processing request');
  
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
    // Step 1: Get locations data only (not country code)
    console.log('📡 Fetching locations data...');
    const locationsRes = await fetch('https://admin.sportsbuz.com/api/locations');
    
    let locationsData = [];
    if (locationsRes.ok) {
      locationsData = await locationsRes.json();
      console.log('✅ Locations API success, found', locationsData.length, 'locations');
    } else {
      console.error('❌ Locations API failed with status:', locationsRes.status);
    }
    
    // Create response (continue with normal request processing)
    const response = NextResponse.next();
    
    // Step 2: Set only locations data cookie
    if (locationsData.length > 0) {
      // Store all location data
      response.cookies.set('lanTagValues', JSON.stringify(locationsData), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: false, // Important: Set to false so client-side JS can access it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      console.log('✅ Locations data cookie set');
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