# Toolbox Notes

Small tools, built for convenience. / 편하려고 만든 작은 도구들.

A bilingual (English / Korean) blog based on the [Fuwari](https://github.com/saicaca/fuwari) theme (MIT) for [Astro](https://astro.build), deployed on Cloudflare Pages.

- Live: https://toolboxnotes.com
- `/` sends visitors to `/ko/` or `/en/` based on their saved choice or browser language
- The translate button in the navbar switches to the same page in the other language (or that language's home page if there is no translation)

## Writing a post

Write every post twice, **with the same file name**, so the language switch can link them:

```
content/en/posts/my-tool.md
content/ko/posts/my-tool.md
```

Or run `pnpm new-post my-tool` to create both files (as drafts).

Front matter:

```yaml
---
title: My Tool
published: 2026-11-05
description: One-sentence summary (shown in search results and post cards)
image: ''            # optional cover image
tags: [Tool, Amazon]
category: Tools
draft: false         # true = not published
---
```

Images: put them in `public/images/<post>/` and reference them as `/en/images/<post>/file.png` in the English post and `/ko/images/<post>/file.png` in the Korean post (each language is served under its own prefix). Alternatively, put them next to the post file and use a relative path like `./cover.png`, in each language folder.

Other pages: `content/<lang>/about.md` and `content/<lang>/privacy.md`.

Commit and push — Cloudflare rebuilds the site automatically.

## How the bilingual build works

`pnpm build` runs `scripts/build-i18n.mjs`, which for each language copies `content/<lang>/` into `src/content/`, builds the site with `SITE_LANG=<lang>` into `dist/<lang>/`, and builds the Pagefind search index. It then writes `dist/index.html` (language redirect), `dist/404.html` and `dist/robots.txt`.

Language-specific site text (subtitle, bio) lives in `src/config.ts`.

| Command | Action |
|:--|:--|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server, English content |
| `pnpm dev:ko` | Dev server, Korean content |
| `pnpm build` | Build both languages to `dist/` |
| `pnpm new-post <name>` | Create a post in both languages |

## Cloudflare Pages settings

| Setting | Value |
|---|---|
| Build command | `npm run build` (or `pnpm build`) |
| Build output directory | `dist` |

If you add a custom domain, update `site` in `astro.config.mjs` and `SITE_URL` in `scripts/build-i18n.mjs`.
