// lib/fetchBettingAppsSSR.js
import axios from "axios";

export async function fetchBettingAppsSSR(countryCode) {
  try {
    const response = await axios.get(`https://admin.sportsbuz.com/api/best-betting-headings`, {
      params: {
        country_code: countryCode,
        filter_by: 'current_month',
      },
    });

    const data = response.data;
    if (Array.isArray(data.results)) {
      return data.results;
    } else {
      console.warn('Expected array in betting apps SSR, got:', data);
      return [];
    }
  } catch (error) {
    console.error('SSR Betting Apps fetch failed:', error.message);
    return [];
  }
}
