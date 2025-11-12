
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sportsbuz.com/',
  generateRobotsTxt: true, // (optional)
  sitemapSize: 7000,
  exclude: ['/404', '/500'], // optional
  additionalPaths: async (config) => {
    const locales = ['en-in', 'en-de', 'en-es', 'en-pt', 'en-it', 'en-gr', 'en-nz', 'en-ae', 'en-ca', 'en-ie', 'en-pe', 'en-ar', 'en-br', 'en-gb', 'en-bd', 'en-at', 'en-hu', 'en-lk', 'en-pt', 'en-de', 'en-es',];
    const extraPaths = [];


    for (const locale of locales) {
      extraPaths.push({
        loc: `${config.siteUrl}/${locale}`,
        changefreq: 'daily',
        priority: 1.0,
      });
      extraPaths.push({
        loc: `${config.siteUrl}/${locale}/match-schedules`,
        changefreq: 'daily',
        priority: 0.8,
      });
      extraPaths.push({
        loc: `${config.siteUrl}/${locale}/contact`,
        changefreq: 'monthly',
        priority: 0.5,
      });
      extraPaths.push({
        loc: `/blogs/pages/all-blogs`,
        changefreq: 'daily',
        priority: 0.9,
      }); extraPaths.push({
        loc: `/best-betting-apps/current`,
        changefreq: 'weekly',
        priority: 0.9,
      });
    }

    return extraPaths;
  },
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://sportsbuz.com/my-custom-sitemap-1.xml',
      'https://sportsbuz.com/sitemap.xml',
    ],
  },
};