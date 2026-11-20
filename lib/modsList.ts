export const MAX_MODS_PER_DOWNLOAD = 300;

export function parseModsList(modsList: string) {
	return modsList
		.split("\n")
		.map((mod) => mod.trim())
		.filter(Boolean);
}
