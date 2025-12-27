"use server";
import { getProject, getUrl } from "@/lib/api";
import archiver from "archiver";
import { PassThrough } from "stream";

export async function downloadMods(
	modsList: string,
	gameVersion: string,
	loader: string,
	onProgress?: (p: number) => void
) {
	const mods = modsList
		.split("\n")
		.map((mod) => mod.trim())
		.filter(Boolean);

	const stream = new PassThrough();
	const archive = archiver("zip", { zlib: { level: 9 } });
	const total = mods.length;
	let done = 0;

	archive.pipe(stream);

	archive.on("progress", (data) => {
		const percent = data.entries.processed / total;
		onProgress?.(Math.min(1, percent));
	});

	(async () => {
		for (const mod of mods) {
			const projectId = await getProject(mod);
			if (!projectId) continue;

			const url = await getUrl(projectId, loader, gameVersion);
			if (!url) continue;

			console.log("Downloading mod" + mod + " from URL: " + url);

			const response = await fetch(url);
			const buffer = Buffer.from(await response.arrayBuffer());
			const filename =
				url.split("/").pop()?.replace("%2B", "+") || `${mod}.jar`;
			archive.append(buffer, { name: filename });

			done++;
			onProgress?.(done / total);
		}

		await archive.finalize();
	})();

	return stream;
}
