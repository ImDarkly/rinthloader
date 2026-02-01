import JSZip from "jszip";

export async function getModNames(files: File[]): Promise<string[]> {
	const modNames: string[] = [];

	for (const file of files) {
		try {
			const buffer = await file.arrayBuffer();
			const zip = await JSZip.loadAsync(buffer);

			const fabricFile = zip.file("fabric.mod.json");
			if (!fabricFile) continue;

			const content = await fabricFile.async("string");
			const data = JSON.parse(content);
			const name = data.name ?? data.id;
			if (name) modNames.push(name);
		} catch {
			continue;
		}
	}
	return modNames;
}
