import type { DropEvent } from "react-dropzone";

/**
 * Collect dropped/selected files without going through the File System Access
 * API. `file-selector` tries `DataTransferItem.getAsFileSystemHandle()` first
 * and calls `handle.getFile()`, which throws "The request is not allowed by the
 * user agent or the platform in the current context" for some drag sources.
 */
export default async function getFilesFromEvent(
	event: DropEvent,
): Promise<File[]> {
	// File picker path (`showOpenFilePicker`), when enabled.
	if (Array.isArray(event)) {
		const files = await Promise.all(
			event.map(async (handle) => {
				try {
					return await handle.getFile();
				} catch {
					return null;
				}
			}),
		);
		return files.filter((file): file is File => file !== null);
	}

	const { dataTransfer, target } = event as {
		dataTransfer?: DataTransfer | null;
		target?: { files?: FileList | null } | null;
	};

	if (dataTransfer) {
		const files = Array.from(dataTransfer.files ?? []);
		if (files.length > 0) return files;

		// Fall back to `getAsFile()` for drag sources that only expose items.
		const itemFiles = Array.from(dataTransfer.items ?? [])
			.filter((item) => item.kind === "file")
			.map((item) => item.getAsFile())
			.filter((file): file is File => file !== null);

		if (itemFiles.length > 0) return itemFiles;
	}

	// `<input type="file">` change events.
	if (target?.files?.length) {
		return Array.from(target.files);
	}

	return [];
}
