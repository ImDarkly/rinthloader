export function buildShareLink(modNames: string[], modLoader: string) {
	const url = new URL(window.location.pathname, window.location.origin);
	url.search = `mods=${modNames.map(encodeURIComponent).join(",")}&loader=${encodeURIComponent(modLoader)}`;
	return url.toString();
}

export function readShareLink(search: string) {
	const params = new URLSearchParams(search);
	const modNames = (params.get("mods") ?? "")
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean);

	return { modNames, modLoader: params.get("loader") };
}
