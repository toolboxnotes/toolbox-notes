// Send every visitor to the main domain, https://toolboxnotes.com
// (www.toolboxnotes.com and the old toolbox-notes.pages.dev address redirect here).
// Preview deployments such as <hash>.toolbox-notes.pages.dev are left alone.
const MAIN_HOST = "toolboxnotes.com";
const REDIRECT_HOSTS = new Set(["www.toolboxnotes.com", "toolbox-notes.pages.dev"]);

export async function onRequest(context) {
	const url = new URL(context.request.url);
	if (REDIRECT_HOSTS.has(url.hostname)) {
		url.hostname = MAIN_HOST;
		url.protocol = "https:";
		return Response.redirect(url.toString(), 301);
	}
	return context.next();
}
