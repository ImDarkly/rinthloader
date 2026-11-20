"use server";
import { getProject, getVersion } from "@/lib/api";
import archiver from "archiver";
import { PassThrough } from "stream";
import { parseModsList } from "@/lib/modsList";

export async function downloadMods(
  modsList: string,
  gameVersion: string,
  modLoader: string,
  includeDependencies = true,
  onProgress?: (p: number) => void,
  concurrencyLimit = 5,
) {
  const mods = parseModsList(modsList);

  const stream = new PassThrough();
  const archive = archiver("zip", { store: true });
  const total = mods.length;
  let done = 0;
  const addedProjectIds = new Set<string>();
  const queue = [...mods];

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

    const version = await getVersion(projectId, modLoader, gameVersion);
    const file = version?.file;
    if (!file) return;

    if (includeDependencies) {
      for (const dependency of version.dependencies) {
        if (
          dependency.dependency_type === "required" &&
          dependency.project_id
        ) {
          queue.push(dependency.project_id);
        }
      }
    }

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
      const worker = async () => {
        for (let mod = queue.shift(); mod; mod = queue.shift()) {
          await addMod(mod);
        }
      };
      await Promise.all(Array.from({ length: concurrencyLimit }, worker));
      await archive.finalize();
    } catch (error) {
      stream.destroy(error instanceof Error ? error : new Error(String(error)));
      archive.abort();
    }
  })();

  return stream;
}
