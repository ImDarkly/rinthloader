import { downloadMods } from "@/actions/downloadMods";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const modsList = searchParams.get("modsList") || "";
	const gameVersion = searchParams.get("gameVersion") || "";

	const nodeStream = await downloadMods(modsList, gameVersion);
	console.log("nodeStream:", nodeStream);

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
			"Content-Disposition": 'attachment; filename="mods.zip"',
		},
	});
}
