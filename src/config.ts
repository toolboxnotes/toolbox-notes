import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

// Set at build time by astro.config.mjs (vite.define). Falls back to "en"
// when this file is loaded directly by Node (e.g. from astro.config.mjs).
declare const __SITE_LANG__: string | undefined;
export const SITE_LANG: "en" | "ko" =
	typeof __SITE_LANG__ !== "undefined" && __SITE_LANG__ === "ko" ? "ko" : "en";

const text = {
	en: {
		subtitle: "Small tools, built for convenience",
		bio: "Notes on the little programs I build to make everyday work easier.",
	},
	ko: {
		subtitle: "편하려고 만든 작은 도구들",
		bio: "일상 업무를 편하게 만들기 위해 직접 만든 작은 프로그램들의 기록.",
	},
}[SITE_LANG];

export const siteConfig: SiteConfig = {
	title: "Toolbox Notes",
	subtitle: text.subtitle,
	lang: SITE_LANG, // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 30, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Toolbox Notes",
	bio: text.bio,
	links: [],
};

export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
