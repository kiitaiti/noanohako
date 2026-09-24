// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 公開URL。Netlifyの環境変数 SITE_URL で上書き可能（プレビュー環境と本番を分けるため）
const site = process.env.SITE_URL || 'https://noanohako.jp';

export default defineConfig({
  site,
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/contact/thanks/') && !page.includes('/404'),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
  image: {
    // sharp を使用（AVIF/WebP 変換）
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
