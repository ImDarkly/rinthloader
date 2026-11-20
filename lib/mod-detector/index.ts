import JSZip from "jszip";
import { parse } from "smol-toml";
import { getProjectsByFileHash } from "@/lib/api";

export type DetectedModFile = {
	fileName: string;
	modName: string | null;
	// Modrinth project title, set when modName is a slug matched by hash.
	title?: string;
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
		hashes.push(hash);
	}

	const knownHashes = hashes.filter((hash): hash is string => hash !== null);
	const projects = await getProjectsByFileHash(knownHashes).catch(
		() => new Map<string, { slug: string; title: string }>(),
	);

	return results.map((result, index) => {
		const hash = hashes[index];
		const project = hash ? projects.get(hash) : undefined;
		return project
			? { ...result, modName: project.slug, title: project.title }
			: result;
	});
}

async function sha1(buffer: ArrayBuffer) {
	const digest = await crypto.subtle.digest("SHA-1", buffer);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
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
