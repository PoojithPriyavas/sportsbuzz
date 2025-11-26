import CustomAxios from '../components/utilities/CustomAxios';
import axios from 'axios';

export async function fetchBlogsSSR({ countryCode, search = '', category = null, subcategory = null }) {
  console.log(countryCode,"country code in blogs ssr")
  try {
    const params = {
      country_code: countryCode,
    };

    if (search) params.search = search;
    if (category) params.category_id = category;
    if (subcategory) params.subcategory_id = subcategory;

    const response = await axios.get('https://admin.sportsbuz.com/api/get-blogs', { params });

    return response.data?.results || [];
  } catch (error) {
    console.error('SSR blog fetch error:', error);
    return [];
  }
}
