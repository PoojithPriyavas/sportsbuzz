import CustomAxios from '../components/utilities/CustomAxios';

export async function fetchBlogsSSR({ countryCode, search = '', category = null, subcategory = null }) {
  try {
    const params = {
      country_code: countryCode,
    };

    if (search) params.search = search;
    if (category) params.category_id = category;
    if (subcategory) params.subcategory_id = subcategory;

    const response = await CustomAxios.get('/get-blogs', { params });

    return response.data?.results || [];
  } catch (error) {
    console.error('SSR blog fetch error:', error);
    return [];
  }
}
