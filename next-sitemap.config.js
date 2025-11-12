/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sportsbuz.com/', 
  generateRobotsTxt: true, // (optional)
  sitemapSize: 7000,
  exclude: ['/404', '/500'], // optional
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://sportsbuz.com/my-custom-sitemap-1.xml',
    ],
  },
};
