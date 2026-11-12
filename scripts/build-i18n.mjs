// Bilingual build for Toolbox Notes.
//
// Writing lives in content/<lang>/ (posts/*.md, about.md, privacy.md).
// For each language this script:
//   1. copies content/<lang>/ into src/content/ (where Fuwari expects it)
//   2. runs `astro build` with SITE_LANG=<lang>  ->  dist/<lang>/
//   3. builds the Pagefind search index for that language
// Then it writes the root files: index.html (language redirect), 404.html, robots.txt.
//
// Usage:
//   node scripts/build-i18n.mjs            build both languages
//   node scripts/build-i18n.mjs dev ko     copy Korean content and start the dev server

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://toolboxnotes.com"; // keep in sync with astro.config.mjs
const LANGS = ["en", "ko"];
// Google AdSense publisher ID, e.g. "ca-pub-1234567890123456" (keep in sync with src/config.ts)
const ADSENSE_CLIENT = "ca-pub-7313885773782147";
// Naver Search Advisor HTML-tag verification code (the content="..." value)
const NAVER_SITE_VERIFICATION = "8bae01a012bc506041e0bfb5f5f459a00d5d2009";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {
	...process.env,
	PATH: `${path.join(root, "node_modules", ".bin")}${path.delimiter}${process.env.PATH}`,
};

function run(cmd, extraEnv = {}) {
	console.log(`\n> ${cmd}`);
	const res = spawnSync(cmd, {
		cwd: root,
		shell: true,
		stdio: "inherit",
		env: { ...env, ...extraEnv },
	});
	if (res.status !== 0) process.exit(res.status ?? 1);
}

function prepareContent(lang) {
	const from = path.join(root, "content", lang);
	const postsDir = path.join(root, "src", "content", "posts");
	const specDir = path.join(root, "src", "content", "spec");
	fs.rmSync(postsDir, { recursive: true, force: true });
	fs.mkdirSync(postsDir, { recursive: true });
	fs.mkdirSync(specDir, { recursive: true });
	fs.cpSync(path.join(from, "posts"), postsDir, { recursive: true });
	// Root-level pages (about.md, privacy.md, ...) go to the "spec" collection
	for (const f of fs.readdirSync(from)) {
		if (f.endsWith(".md")) fs.copyFileSync(path.join(from, f), path.join(specDir, f));
	}
	// Drop Astro's content cache so entries from the other language never leak in
	fs.rmSync(path.join(root, ".astro"), { recursive: true, force: true });
	fs.rmSync(path.join(root, "node_modules", ".astro"), { recursive: true, force: true });
	console.log(`\n[i18n] content/${lang} -> src/content`);
}


// Scheduled posts (future `published` date) are not built yet, but already-published
// posts may link to them ("related posts"). Remove those links until the target exists:
// a list item that is only the link is dropped, any other link is replaced by its text.
// Applies to post pages and the RSS feed of one language build.
function pruneUnpublishedLinks(lang) {
	const out = path.join(root, "dist", lang);
	const exists = (p) => fs.existsSync(path.join(out, p.replace(new RegExp(`^/${lang}/`), ""), "index.html"));
	const fix = (html, pageUrl) => {
		const target = (href) => {
			try {
				const u = new URL(href, pageUrl);
				if (u.origin !== SITE_URL) return null;
				return new RegExp(`^/${lang}/posts/[^/]+/$`).test(u.pathname) ? u.pathname : null;
			} catch { return null; }
		};
		const dead = (href) => { const t = target(href.replace(/&amp;/g, "&")); return t && !exists(t); };
		html = html.replace(/<li>\s*<a [^>]*href="([^"]+)"[^>]*>(?:(?!<\/?li[\s>])[\s\S])*?<\/a>\s*<\/li>\s*/g, (m, href) => (dead(href) ? "" : m));
		return html.replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (m, href, text) => (dead(href) ? text : m));
	};
	const walk = (d) => {
		for (const f of fs.readdirSync(d)) {
			const p = path.join(d, f);
			if (fs.statSync(p).isDirectory()) { walk(p); continue; }
			if (!f.endsWith(".html")) continue;
			const rel = path.relative(out, path.dirname(p)).split(path.sep).join("/");
			const url = `${SITE_URL}/${lang}/${rel ? rel + "/" : ""}`;
			const s = fs.readFileSync(p, "utf8");
			const t = fix(s, url);
			if (t !== s) fs.writeFileSync(p, t);
		}
	};
	walk(path.join(out, "posts"));
	const rss = path.join(out, "rss.xml");
	if (fs.existsSync(rss)) {
		// RSS content is HTML-escaped inside <content:encoded>; links there are absolute
		const s = fs.readFileSync(rss, "utf8");
		const t = s.replace(/&lt;li&gt;\s*&lt;a href="([^"]+)"&gt;(?:(?!&lt;\/?li&gt;)[\s\S])*?&lt;\/a&gt;\s*&lt;\/li&gt;\s*/g, (m, href) => {
			try { const u = new URL(href); return u.origin === SITE_URL && /\/posts\/[^/]+\/$/.test(u.pathname) && !exists(u.pathname) ? "" : m; } catch { return m; }
		}).replace(/&lt;a href="([^"]+)"&gt;([\s\S]*?)&lt;\/a&gt;/g, (m, href, text) => {
			try { const u = new URL(href); return u.origin === SITE_URL && /\/posts\/[^/]+\/$/.test(u.pathname) && !exists(u.pathname) ? text : m; } catch { return m; }
		});
		if (t !== s) fs.writeFileSync(rss, t);
	}
}

const [mode, devLang] = process.argv.slice(2);

if (mode === "dev") {
	const lang = LANGS.includes(devLang) ? devLang : "en";
	prepareContent(lang);
	run("astro dev", { SITE_LANG: lang });
	process.exit(0);
}

fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });

for (const lang of LANGS) {
	prepareContent(lang);
	run("astro build", { SITE_LANG: lang });
	pruneUnpublishedLinks(lang);
	run(`pagefind --site dist/${lang}`);
	// Also serve post images at their plain path next to the post
	// (/<lang>/posts/<slug>/image.png) so images in the RSS feed resolve.
	const postsSrc = path.join(root, "content", lang, "posts");
	for (const slug of fs.readdirSync(postsSrc)) {
		const dir = path.join(postsSrc, slug);
		if (!fs.statSync(dir).isDirectory()) continue;
		// scheduled posts that are not published yet have no page; skip their images too
		if (!fs.existsSync(path.join(root, "dist", lang, "posts", slug, "index.html"))) continue;
		for (const f of fs.readdirSync(dir)) {
			if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(f)) continue;
			const out = path.join(root, "dist", lang, "posts", slug);
			fs.mkdirSync(out, { recursive: true });
			fs.copyFileSync(path.join(dir, f), path.join(out, f));
		}
	}
}

// ---- root files ----
const dist = path.join(root, "dist");

fs.writeFileSync(
	path.join(dist, "index.html"),
	`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Toolbox Notes</title>
<meta name="description" content="Small tools, built for convenience. / 편하려고 만든 작은 도구들.">
<link rel="alternate" hreflang="en" href="${SITE_URL}/en/">
<link rel="alternate" hreflang="ko" href="${SITE_URL}/ko/">
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/en/favicon/favicon-light-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/en/favicon/favicon-light-180.png">
${NAVER_SITE_VERIFICATION ? `<meta name="naver-site-verification" content="${NAVER_SITE_VERIFICATION}">` : ""}
${ADSENSE_CLIENT ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>` : ""}
<script>
(function () {
  var lang = null;
  try { lang = localStorage.getItem("lang"); } catch (e) {}
  if (lang !== "en" && lang !== "ko") {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    lang = "en";
    for (var i = 0; i < prefs.length; i++) {
      var p = String(prefs[i]).toLowerCase();
      if (p.indexOf("ko") === 0) { lang = "ko"; break; }
      if (p.indexOf("en") === 0) { lang = "en"; break; }
    }
  }
  location.replace("/" + lang + "/");
})();
</script>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}a{margin:0 6px}</style>
</head>
<body>
<main>
<h1>Toolbox Notes</h1>
<p>Small tools, built for convenience. / 편하려고 만든 작은 도구들.</p>
<nav aria-label="Language">
<p><a href="/en/">English</a> · <a href="/ko/">한국어</a></p>
</nav>
<footer>
<p><a href="/en/about/">About</a> · <a href="/en/privacy/">Privacy Policy</a> · <a href="/en/terms/">Terms of Use</a> · <a href="/en/contact/">Contact</a></p>
<p><a href="/ko/about/">소개</a> · <a href="/ko/privacy/">개인정보처리방침</a> · <a href="/ko/terms/">이용약관</a> · <a href="/ko/contact/">문의</a></p>
</footer>
</main>
</body>
</html>
`,
);

fs.writeFileSync(
	path.join(dist, "404.html"),
	`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>404 - Toolbox Notes</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;background:#16181c;color:#e8e6e1}a{color:#f08a3e;margin:0 8px}</style>
</head>
<body>
<div>
<h1>404</h1>
<p id="msg">Page not found. / 페이지를 찾을 수 없습니다.</p>
<p><a href="/en/">English</a> · <a href="/ko/">한국어</a></p>
</div>
<script>
(function () {
  var m = location.pathname.match(/^\\/(en|ko)\\//);
  if (!m) return;
  document.getElementById("msg").textContent =
    m[1] === "ko" ? "페이지를 찾을 수 없습니다. 홈으로 이동합니다…" : "Page not found. Taking you home…";
  setTimeout(function () { location.replace("/" + m[1] + "/"); }, 2000);
})();
</script>
</body>
</html>
`,
);

fs.writeFileSync(
	path.join(dist, "robots.txt"),
	`#DaumWebMasterTool:92e558357e5bc2ee589b4f8f55158e148de86d53331a356bcf65660f544a8ba4:fjbPToQo9CIdABBLcO2OJw==
User-agent: *
Allow: /

${LANGS.map((l) => `Sitemap: ${SITE_URL}/${l}/sitemap-index.xml`).join("\n")}
`,
);

// Old RSS feeds had relative post links that resolved to /<slug>/ at the site root.
// Send those (and any other root-level post URL) to the Korean post with a 301.
{
	const slugs = fs
		.readdirSync(path.join(root, "content", "ko", "posts"))
		.map((f) => f.replace(/\.md$/, ""));
	const lines = slugs.flatMap((s) => [`/${s}/ /ko/posts/${s}/ 301`, `/${s} /ko/posts/${s}/ 301`]);
	fs.writeFileSync(path.join(dist, "_redirects"), `${lines.join("\n")}\n`);
}

// browsers and search engines request /favicon.ico at the site root
fs.copyFileSync(path.join(dist, "en", "favicon.ico"), path.join(dist, "favicon.ico"));

if (ADSENSE_CLIENT) {
	const pub = ADSENSE_CLIENT.replace(/^ca-/, "");
	fs.writeFileSync(path.join(dist, "ads.txt"), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
}

// IndexNow key file (proves site ownership to Bing, Naver, Yandex etc.).
// Must live at the site root, so it is written here rather than in public/.
const INDEXNOW_KEY = "de35e5e09a7cb964cc21e177ce55d08f";
fs.writeFileSync(path.join(dist, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

console.log("\n[i18n] done: dist/en, dist/ko + root index.html, 404.html, robots.txt");
