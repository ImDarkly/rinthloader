import { downloadMods } from "@/actions/downloadMods";
import { MAX_MODS_PER_DOWNLOAD, parseModsList } from "@/lib/modsList";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modsList = searchParams.get("modsList") || "";
  const gameVersion = searchParams.get("gameVersion") || "";
  const modLoader = searchParams.get("modLoader") || "";

  const count = parseModsList(modsList).length;
  if (count > MAX_MODS_PER_DOWNLOAD) {
    return new Response(
      `Too many mods: got ${count}, the limit is ${MAX_MODS_PER_DOWNLOAD} per download.`,
      { status: 400 },
    );
  }

  const nodeStream = await downloadMods(modsList, gameVersion, modLoader);
  const filename = ["mods", gameVersion, modLoader]
    .filter(Boolean)
    .join("-")
    .replace(/[^\w.+-]/g, "_");

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of nodeStream) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}.zip"`,
    },
  });
}
