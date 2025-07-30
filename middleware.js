// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const response = NextResponse.next();

  const existingCookie = request.cookies.get('countryData');

  // Only fetch and set the cookie if it doesn't exist
  if (!existingCookie) {
    try {
      const res = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
      const data = await res.json();

      response.cookies.set('countryData', JSON.stringify(data), {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
    } catch (err) {
      console.error('Middleware country fetch error:', err);
    }
  }

  return response;
}
