"use server";
import { getFile, getProject } from "@/lib/api";
import archiver from "archiver";
import { PassThrough } from "stream";

export async function downloadMods(
  modsList: string,
  gameVersion: string,
  modLoader: string,
  onProgress?: (p: number) => void,
  concurrencyLimit = 5,
) {
  const mods = modsList
    .split("\n")
    .map((mod) => mod.trim())
    .filter(Boolean);

  const stream = new PassThrough();
  const archive = archiver("zip", { store: true });
  const total = mods.length;
  let done = 0;
  const addedProjectIds = new Set<string>();

  archive.pipe(stream);
  archive.on("error", (error) => stream.destroy(error));

  archive.on("progress", (data) => {
    const percent = data.entries.processed / total;
    onProgress?.(Math.min(1, percent));
  });

  const addMod = async (mod: string) => {
    const projectId = await getProject(mod);
    if (!projectId || addedProjectIds.has(projectId)) return;
    addedProjectIds.add(projectId);

    const file = await getFile(projectId, modLoader, gameVersion);
    if (!file) return;

    const response = await fetch(file.url);
    if (!response.ok)
      throw new Error(`Failed to fetch ${file.url}: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    archive.append(buffer, { name: file.filename || `${mod}.jar` });

    done++;
    onProgress?.(done / total);
  };

  void (async () => {
    try {
      for (let i = 0; i < mods.length; i += concurrencyLimit) {
        await Promise.all(mods.slice(i, i + concurrencyLimit).map(addMod));
      }
      await archive.finalize();
    } catch (error) {
      stream.destroy(error instanceof Error ? error : new Error(String(error)));
      archive.abort();
    }
  })();

  return stream;
}
