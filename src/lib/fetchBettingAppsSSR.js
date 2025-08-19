// lib/fetchBettingAppsSSR.js
import CustomAxios from "../components/utilities/CustomAxios";

export async function fetchBettingAppsSSR(countryCode) {
  try {
    const response = await CustomAxios.get('/best-betting-headings', {
      params: {
        country_code: countryCode,
        filter_by: 'current_month',
      },
    });

    const data = response.data;
    if (Array.isArray(data.results)) {
      console.log("enters the is array condition")
      console.log(" the betting response is :",response.data)
      return data.results;
    } else {
      console.log("enters the not array condition")
      console.log(" the betting response is :",data.results)
      console.warn('Expected array in betting apps SSR, got:', data);
      return [];
    }
  } catch (error) {
    console.error('SSR Betting Apps fetch failed:', error.message);
    return [];
  }
}
