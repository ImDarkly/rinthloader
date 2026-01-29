import JSZip from "jszip";

export async function getModNames(files: File[]): Promise<string[]> {
	const mods: string[] = [];
	for (const file of files) {
		const buffer = await file.arrayBuffer();
		const zip = await JSZip.loadAsync(buffer);
	}
	let zip: JSZip;

	const file = zip.file("fabric.mod.json");
	if (!file) return [];

	try {
		const content = await file.async("string");
		const data = JSON.parse(content);
		const name = data.name ?? data.id;
		return name;
	} catch {
		return [];
	}
}
