import JSZip from "jszip";
import { parse } from "smol-toml";
import { getProjectSlugsByFileHash } from "@/lib/api";

export type DetectedModFile = {
	fileName: string;
	modName: string | null;
	modId: string | null;
	modLoader: string | null;
};

export async function detectModFiles(
	files: File[],
): Promise<DetectedModFile[]> {
	const results: DetectedModFile[] = [];
	const hashes: (string | null)[] = [];

	for (const file of files) {
		let hash: string | null = null;
		try {
			const buffer = await file.arrayBuffer();
			hash = await sha1(buffer).catch(() => null);
			const zip = await JSZip.loadAsync(buffer);

			const { name, id, modLoader } = await readModMetadata(zip);
			const modId = asText(id);
			const modName = asText(name) ?? modId;
			results.push({
				fileName: file.name,
				modName,
				modId,
				modLoader: modName ? modLoader : null,
			});
		} catch {
			results.push({
				fileName: file.name,
				modName: null,
				modId: null,
				modLoader: null,
			});
		}
		hashes.push(hash);
	}

	const knownHashes = hashes.filter((hash): hash is string => hash !== null);
	const slugs = await getProjectSlugsByFileHash(knownHashes).catch(
		() => new Map<string, string>(),
	);

	return results.map((result, index) => {
		const hash = hashes[index];
		const slug = hash ? slugs.get(hash) : undefined;
		return slug ? { ...result, modName: slug } : result;
	});
}

function asText(value: unknown) {
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function sha1(buffer: ArrayBuffer) {
	const digest = await crypto.subtle.digest("SHA-1", buffer);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

async function readModMetadata(
	zip: JSZip,
): Promise<{ name: unknown; id: unknown; modLoader: string | null }> {
	const fabricFile = zip.file("fabric.mod.json");
	if (fabricFile) {
		const data = JSON.parse(await fabricFile.async("string"));
		return { name: data.name, id: data.id, modLoader: "fabric" };
	}

	const quiltFile = zip.file("quilt.mod.json");
	if (quiltFile) {
		const loader = JSON.parse(await quiltFile.async("string")).quilt_loader;
		return {
			name: loader?.metadata?.name,
			id: loader?.id,
			modLoader: "quilt",
		};
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
			name: isPlaceholder ? null : mod?.displayName,
			id: mod?.modId,
			modLoader: neoForgeFile ? "neoforge" : "forge",
		};
	}

	return { name: null, id: null, modLoader: null };
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
