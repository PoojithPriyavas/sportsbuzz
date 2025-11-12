/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sportsbuz.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/404', '/500'],
  // list each locale once (adjust to your real locales)
  locales: [
    'en-in', 'en-de', 'en-es', 'en-pt', 'en-it', 'en-gr', 'en-nz', 'en-ae',
    'en-ca', 'en-ie', 'en-pe', 'en-ar', 'en-br', 'en-gb', 'en-bd', 'en-at',
    'en-hu', 'en-lk'
  ],

  // additionalPaths builds locale-specific pages correctly
  additionalPaths: async (config) => {
    const locales = [
      'en-in', 'en-de', 'en-es', 'en-pt', 'en-it', 'en-gr', 'en-nz', 'en-ae',
      'en-ca', 'en-ie', 'en-pe', 'en-ar', 'en-br', 'en-gb', 'en-bd', 'en-at',
      'en-hu', 'en-lk'
    ];

    const pathsPerLocale = [
      { path: '/', changefreq: 'daily', priority: 1.0 },
      { path: '/match-schedules', changefreq: 'daily', priority: 0.8 },
      { path: '/contact', changefreq: 'monthly', priority: 0.5 },
      { path: '/blogs/pages/all-blogs', changefreq: 'daily', priority: 0.7 },
      { path: '/best-betting-apps/current', changefreq: 'weekly', priority: 0.6 }
    ];

    const extraPaths = [];

    for (const locale of locales) {
      for (const p of pathsPerLocale) {
        // ensure we don't accidentally generate duplicate URLs
        extraPaths.push({
          loc: `${config.siteUrl}/${locale}${p.path === '/' ? '' : p.path}`,
          changefreq: p.changefreq,
          priority: p.priority,
        });
      }
    }

    // optionally add any truly global pages (non-localized) once:
    extraPaths.push({
      loc: `${config.siteUrl}/terms`,
      changefreq: 'yearly',
      priority: 0.3,
    });
    extraPaths.push({
      loc: `${config.siteUrl}/privacy`,
      changefreq: 'yearly',
      priority: 0.3,
    });

    // remove duplicates (safety)
    const seen = new Set();
    return extraPaths.filter(item => {
      if (seen.has(item.loc)) return false;
      seen.add(item.loc);
      return true;
    });
  },

  // optional: add alternateRefs for hreflang (one static list for pages; next-sitemap will attach them)
  alternateRefs: [
    { href: 'https://sportsbuz.com/en-in', hreflang: 'en-in' },
    { href: 'https://sportsbuz.com/en-de', hreflang: 'en-de' },
    { href: 'https://sportsbuz.com/en-es', hreflang: 'en-es' },
    { href: 'https://sportsbuz.com/en-pt', hreflang: 'en-pt' },
    { href: 'https://sportsbuz.com/en-it', hreflang: 'en-it' },
    // add the rest...
  ],

  robotsTxtOptions: {
    additionalSitemaps: [
      'https://sportsbuz.com/my-custom-sitemap-1.xml' // keep only custom extra sitemaps
    ],
  },
};
