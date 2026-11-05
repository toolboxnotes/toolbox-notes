# Toolbox Notes

Small tools, built for convenience. / 편하려고 만든 작은 도구들.

A bilingual (English / Korean) blog built with [Astro](https://astro.build), deployed on Cloudflare.

## Writing a new post

1. Add `src/content/blog/en/<slug>.md` and `src/content/blog/ko/<slug>.md` — **use the same file name** so the two languages link to each other.
2. Front matter:

   ```yaml
   ---
   title: 'Post title'
   description: 'One-sentence summary (used for search results)'
   pubDate: 2026-11-05
   tags: ['amazon', 'tool']
   draft: false   # true = not published
   ---
   ```

3. Put images in `public/images/<slug>/` and reference them as `/images/<slug>/file.png`.
4. Commit and push — Cloudflare rebuilds the site automatically.

## How language switching works

- `/` detects the visitor's saved choice or browser language and redirects to `/ko/` or `/en/`.
- Every page has a language toggle; a manual choice is remembered in the browser.
- Each page declares `hreflang` alternates so Google indexes both languages.

## Cloudflare build settings

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=22` (optional; `.node-version` already set) |

If you add a custom domain, update `SITE_URL` in `astro.config.mjs` and the sitemap line in `public/robots.txt`.
