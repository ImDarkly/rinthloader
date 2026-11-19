"use server";
import { getFile, getProject } from "@/lib/api";
import archiver from "archiver";
import { PassThrough } from "stream";

export async function downloadMods(
  modsList: string,
  gameVersion: string,
  modLoader: string,
  onProgress?: (p: number) => void,
) {
  const mods = modsList
    .split("\n")
    .map((mod) => mod.trim())
    .filter(Boolean);

  const stream = new PassThrough();
  const archive = archiver("zip", { store: true });
  const total = mods.length;
  let done = 0;

  archive.pipe(stream);

  archive.on("progress", (data) => {
    const percent = data.entries.processed / total;
    onProgress?.(Math.min(1, percent));
  });

  void (async () => {
    try {
      for (const mod of mods) {
        const projectId = await getProject(mod);
        if (!projectId) continue;

        const file = await getFile(projectId, modLoader, gameVersion);
        if (!file) continue;

        const response = await fetch(file.url);
        if (!response.ok)
          throw new Error(`Failed to fetch ${file.url}: ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        archive.append(buffer, { name: file.filename || `${mod}.jar` });

        done++;
        onProgress?.(done / total);
      }
      await archive.finalize();
    } catch (error) {
      archive.destroy(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  })();

  return stream;
}
