"use client";

import TerminalDropzone from "./terminal-dropzone";

export default function TerminalAutoImport() {
	return (
		<div className="flex w-full flex-col gap-2">
			<label htmlFor="mod" className="sr-only">
				Jar files
			</label>
			<TerminalDropzone />
		</div>
	);
}
