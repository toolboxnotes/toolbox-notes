import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items: blog.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			const link = url(`/posts/${post.slug}/`);
			// Relative links/images in posts (../other-post/, ./image.png) must be made
			// absolute, otherwise feed readers and crawlers resolve them against
			// /<lang>/rss.xml and end up at non-existent root URLs.
			const base = new URL(link, context.site ?? "https://toolboxnotes.com");
			const absolutize = (attr: string) => (tagName: string, attribs: Record<string, string>) => {
				const v = attribs[attr];
				if (v && !/^([a-z][a-z0-9+.-]*:|#)/i.test(v)) {
					try {
						attribs[attr] = new URL(v, base).href;
					} catch {}
				}
				return { tagName, attribs };
			};
			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link,
				content: sanitizeHtml(parser.render(cleanedContent), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
					transformTags: { a: absolutize("href"), img: absolutize("src") },
				}),
			};
		}),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
