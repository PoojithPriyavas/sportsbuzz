import axios from "axios";
export async function fetchBestBettingAppsSSR({countryCode, slug}) {
    console.log('fetchBestBettingAppsSSR called with:', { countryCode, slug });
    
    try {
        const params = {
            country_code: countryCode.toUpperCase(),
            slug: slug
        };
        
        console.log('API params:', params); 
        
        const response = await axios.get('https://admin.sportsbuz.com/api/best-betting-headings', {
            params
        });

        console.log('API response:', response.data); 
        
        const data = response.data;
        if (Array.isArray(data.results)) {
            return data.results;
        } else {
            console.warn('Expected array in betting apps SSR, got:', data);
            return [];
        }
    } catch (error) {
        console.error('SSR Betting Apps fetch failed:', error.message);
        console.error('Error details:', error.response?.data); 
        return [];
    }
}