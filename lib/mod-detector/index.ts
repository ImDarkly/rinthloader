import JSZip from "jszip";

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

			const fabricFile = zip.file("fabric.mod.json");
			if (!fabricFile) {
				results.push({ fileName: file.name, modName: null });
				continue;
			}

			const content = await fabricFile.async("string");
			const data = JSON.parse(content);
			const name = data.name ?? data.id;
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

export async function getModNames(files: File[]): Promise<string[]> {
	const results = await detectModFiles(files);
	return results.flatMap((result) =>
		result.modName ? [result.modName] : [],
	);
}
