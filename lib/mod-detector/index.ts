import JSZip from "jszip";
import { parse } from "smol-toml";

export type DetectedModFile = {
	fileName: string;
	modName: string | null;
};

export async function detectModFiles(
	files: File[],
): Promise<DetectedModFile[]> {
	const results: DetectedModFile[] = [];

	for (const file of files) {
		try {
			const buffer = await file.arrayBuffer();
			const zip = await JSZip.loadAsync(buffer);

			const name = await readModName(zip);
			results.push({
				fileName: file.name,
				modName:
					typeof name === "string" && name.trim() ? name.trim() : null,
			});
		} catch {
			results.push({ fileName: file.name, modName: null });
		}
	}

	return results;
}

async function readModName(zip: JSZip): Promise<unknown> {
	const fabricFile = zip.file("fabric.mod.json");
	if (fabricFile) {
		const data = JSON.parse(await fabricFile.async("string"));
		return data.name ?? data.id;
	}

	const quiltFile = zip.file("quilt.mod.json");
	if (quiltFile) {
		const loader = JSON.parse(await quiltFile.async("string")).quilt_loader;
		return loader?.metadata?.name ?? loader?.id;
	}

	const forgeFile =
		zip.file("META-INF/neoforge.mods.toml") ?? zip.file("META-INF/mods.toml");
	if (forgeFile) {
		const data = parse(await forgeFile.async("string")) as {
			mods?: { displayName?: unknown; modId?: unknown }[];
		};
		const mod = data.mods?.[0];
		// Some jars leave the display name as an unfilled build placeholder.
		const isPlaceholder =
			typeof mod?.displayName === "string" && mod.displayName.includes("${");
		return isPlaceholder ? mod?.modId : (mod?.displayName ?? mod?.modId);
	}

	return null;
}

export async function getModNames(files: File[]): Promise<string[]> {
	const results = await detectModFiles(files);
	return results.flatMap((result) =>
		result.modName ? [result.modName] : [],
	);
}
