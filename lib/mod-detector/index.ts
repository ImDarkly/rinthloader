import JSZip from "jszip";
import { parse } from "smol-toml";

export type DetectedModFile = {
	fileName: string;
	modName: string | null;
	modLoader: string | null;
};

export async function detectModFiles(
	files: File[],
): Promise<DetectedModFile[]> {
	const results: DetectedModFile[] = [];

	for (const file of files) {
		try {
			const buffer = await file.arrayBuffer();
			const zip = await JSZip.loadAsync(buffer);

			const { name, modLoader } = await readModMetadata(zip);
			const modName =
				typeof name === "string" && name.trim() ? name.trim() : null;
			results.push({
				fileName: file.name,
				modName,
				modLoader: modName ? modLoader : null,
			});
		} catch {
			results.push({ fileName: file.name, modName: null, modLoader: null });
		}
	}

	return results;
}

async function readModMetadata(
	zip: JSZip,
): Promise<{ name: unknown; modLoader: string | null }> {
	const fabricFile = zip.file("fabric.mod.json");
	if (fabricFile) {
		const data = JSON.parse(await fabricFile.async("string"));
		return { name: data.name ?? data.id, modLoader: "fabric" };
	}

	const quiltFile = zip.file("quilt.mod.json");
	if (quiltFile) {
		const loader = JSON.parse(await quiltFile.async("string")).quilt_loader;
		return { name: loader?.metadata?.name ?? loader?.id, modLoader: "quilt" };
	}

	const neoForgeFile = zip.file("META-INF/neoforge.mods.toml");
	const forgeFile = neoForgeFile ?? zip.file("META-INF/mods.toml");
	if (forgeFile) {
		const data = parse(await forgeFile.async("string")) as {
			mods?: { displayName?: unknown; modId?: unknown }[];
		};
		const mod = data.mods?.[0];
		// Some jars leave the display name as an unfilled build placeholder.
		const isPlaceholder =
			typeof mod?.displayName === "string" && mod.displayName.includes("${");
		return {
			name: isPlaceholder ? mod?.modId : (mod?.displayName ?? mod?.modId),
			modLoader: neoForgeFile ? "neoforge" : "forge",
		};
	}

	return { name: null, modLoader: null };
}

export function getMostCommonModLoader(
	results: DetectedModFile[],
): string | null {
	const counts = new Map<string, number>();
	for (const { modLoader } of results) {
		if (modLoader) counts.set(modLoader, (counts.get(modLoader) ?? 0) + 1);
	}

	let mostCommon: string | null = null;
	for (const [modLoader, count] of counts) {
		if (!mostCommon || count > counts.get(mostCommon)!) mostCommon = modLoader;
	}
	return mostCommon;
}
