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
const ADSENSE_CLIENT = "";
// Naver Search Advisor HTML-tag verification code (the content="..." value)
const NAVER_SITE_VERIFICATION = "";

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
	run(`pagefind --site dist/${lang}`);
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
<link rel="icon" href="/en/favicon/favicon-light-32.png">
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
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}a{margin:0 8px}</style>
</head>
<body><p><a href="/en/">English</a> · <a href="/ko/">한국어</a></p></body>
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
	`User-agent: *
Disallow: /en/_astro/
Disallow: /ko/_astro/

${LANGS.map((l) => `Sitemap: ${SITE_URL}/${l}/sitemap-index.xml`).join("\n")}
`,
);

if (ADSENSE_CLIENT) {
	const pub = ADSENSE_CLIENT.replace(/^ca-/, "");
	fs.writeFileSync(path.join(dist, "ads.txt"), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
}

console.log("\n[i18n] done: dist/en, dist/ko + root index.html, 404.html, robots.txt");
