/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sportsbuz.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/404', '/500'],
  additionalPaths: async (config) => {
    return [
      {
        loc: '/blogs/pages/all-blogs',
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/best-betting-apps/current',
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      },
    ];
  },
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://sportsbuz.com/my-custom-sitemap-1.xml',
      'https://sportsbuz.com/sitemap.xml', // ensure main sitemap is included too
    ],
  },
};
