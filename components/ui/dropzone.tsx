import { Input } from "../ui/input";
import getFilesFromEvent from "@/lib/getFilesFromEvent";
import { useDropzone } from "react-dropzone";
import { useAppSelector } from "@/hooks/store";
import { useImportModFiles } from "@/hooks/useImportModFiles";

export default function Dropzone() {
	const modNames = useAppSelector((state) => state.modNamesList.modNames);

	const importModFiles = useImportModFiles();

	const onDrop = async (files: File[]) => {
		if (!files.length) return;
		await importModFiles(files);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		getFilesFromEvent,
		accept: { "application/java-archive": [".jar"] },
		multiple: true,
	});

	return (
		<div
			className="border border-dashed cursor-pointer flex justify-center items-center h-24 grow flex-col"
			{...getRootProps()}
		>
			<Input id="mod" className="h-8" {...getInputProps()} />
			{isDragActive
				? "Drop .jar files here"
				: modNames.length !== 0
					? `${modNames.length} ${modNames.length === 1 ? "mod" : "mods"} ready`
					: "Drag .jar files or click"}
		</div>
	);
}
