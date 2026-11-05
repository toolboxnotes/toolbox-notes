// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change this to your custom domain later (e.g. https://toolboxnotes.com)
const SITE_URL = 'https://toolbox-notes.pages.dev';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // Root "/" only redirects by language, so keep it out of the sitemap
      filter: (page) => page !== `${SITE_URL}/`,
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', ko: 'ko-KR' },
      },
    }),
  ],
});
