import { getServerSideSitemapLegacy } from 'next-sitemap';
import axios from 'axios';

export const getServerSideProps = async (ctx) => {
  const baseUrl = 'https://sportsbuz.com';
  let fields = [];

  try {
    // 1. Fetch all supported locations
    const locationsRes = await axios.get('https://admin.sportsbuz.com/api/locations/');
    const locationsData = locationsRes.data;

    // 2. Iterate over each location to fetch dynamic data
    const countryPromises = locationsData.map(async (location) => {
      const { country_code, hreflang } = location;
      // Ensure we handle cases where hreflang or country_code might be missing
      if (!country_code || !hreflang) return [];

      const countryLang = `${hreflang}-${country_code.toLowerCase()}`;
      const countryFields = [];

      // --- Betting Apps ---
      try {
        const bettingAppsRes = await axios.get('https://admin.sportsbuz.com/api/best-betting-headings', {
          params: {
            country_code: country_code.toUpperCase(),
            filter_by: 'current_month',
          },
        });

        const bettingApps = bettingAppsRes.data?.results || [];

        // Only add the betting apps page if we have results
        if (Array.isArray(bettingApps) && bettingApps.length > 0) {
          countryFields.push({
            loc: `${baseUrl}/${countryLang}/best-betting-apps/current`,
            lastmod: new Date().toISOString(), // Or use updated_at from the first app if available
            changefreq: 'daily',
            priority: 0.8,
          });
        }
      } catch (error) {
        console.error(`Error fetching betting apps for ${country_code}:`, error.message);
      }
      try {
        const bettingAppsRes = await axios.get('https://admin.sportsbuz.com/api/best-betting-headings', {
          params: {
            country_code: country_code.toUpperCase(),
            filter_by: 'previous_month',
          },
        });

        const bettingApps = bettingAppsRes.data?.results || [];

        // Only add the betting apps page if we have results
        if (Array.isArray(bettingApps) && bettingApps.length > 0) {
          bettingApps.forEach((apps) => {
            if(apps.slug){
              countryFields.push({
                loc: `${baseUrl}/${countryLang}/best-betting-apps/recent/${apps.slug}`,
                lastmod: new Date().toISOString(), // Or use updated_at from the first app if available
                changefreq: 'daily',
                priority: 0.8,
              });
            }
          })

        }
      } catch (error) {
        console.error(`Error fetching betting apps for ${country_code}:`, error.message);
      }
      // --- Blogs ---
      try {
        const blogsRes = await axios.get('https://admin.sportsbuz.com/api/get-blogs', {
          // params: {
          //   country_code: country_code,
          // }
        });

        const blogs = blogsRes.data?.results || [];

        if (Array.isArray(blogs)) {
          blogs.forEach((blog) => {
            if (blog.slug) {
              countryFields.push({
                loc: `${baseUrl}/${countryLang}/blog-details/${blog.slug}`,
                lastmod: blog.updated_at || blog.created_at || new Date().toISOString(),
                changefreq: 'weekly',
                priority: 0.7,
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching blogs for ${country_code}:`, error.message);
      }

      return countryFields;
    });

    const results = await Promise.all(countryPromises);
    fields = results.flat();

  } catch (error) {
    console.error('Error generating server sitemap:', error);
  }

  return getServerSideSitemapLegacy(ctx, fields);
};

export default function Sitemap() { }
