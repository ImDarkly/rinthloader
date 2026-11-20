import { downloadMods } from "@/actions/downloadMods";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modsList = searchParams.get("modsList") || "";
  const gameVersion = searchParams.get("gameVersion") || "";
  const modLoader = searchParams.get("modLoader") || "";
  const includeDependencies =
    searchParams.get("includeDependencies") !== "false";

  const nodeStream = await downloadMods(
    modsList,
    gameVersion,
    modLoader,
    includeDependencies,
  );
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
