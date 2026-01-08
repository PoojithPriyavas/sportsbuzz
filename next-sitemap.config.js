/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sportsbuz.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/404', '/500'],

  additionalPaths: async (config) => {
    const locales = [
      'en-in', 'en-de', 'en-es', 'en-pt', 'en-it', 'en-gr', 'en-nz', 'en-ae',
      'en-ca', 'en-ie', 'en-pe', 'en-ar', 'en-br', 'en-gb', 'en-bd', 'en-at',
      'en-hu', 'en-lk'
    ];

    const paths = [
      { path: '/', changefreq: 'daily', priority: 1.0 },
      { path: '/match-schedules', changefreq: 'daily', priority: 0.8 },
      { path: '/contact', changefreq: 'monthly', priority: 0.5 },
      { path: '/blogs/pages/all-blogs', changefreq: 'daily', priority: 0.7 },
      { path: '/best-betting-apps/current', changefreq: 'weekly', priority: 0.6 },
    ];

    const extraPaths = [];

    for (const locale of locales) {
      for (const p of paths) {
        extraPaths.push({
          loc: `${config.siteUrl}/${locale}${p.path === '/' ? '' : p.path}`,
          changefreq: p.changefreq,
          priority: p.priority,
        });
      }
    }

    // Add any global pages (non-locale)
    extraPaths.push({
      loc: `${config.siteUrl}/terms-and-conditions`,
      changefreq: 'yearly',
      priority: 0.3,
    });
    extraPaths.push({
      loc: `${config.siteUrl}/privacy-policy`,
      changefreq: 'yearly',
      priority: 0.3,
    });

    return extraPaths;
  },

  robotsTxtOptions: {
    additionalSitemaps: [
      'https://sportsbuz.com/my-custom-sitemap-1.xml',
    ],
  },
};
