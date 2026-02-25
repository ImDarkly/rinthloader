import { Input } from "../ui/input";
import { getModNames } from "@/lib/mod-detector";
import { useDispatch } from "react-redux";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";
import { useDropzone } from "react-dropzone";
import { useAppSelector } from "@/hooks/store";
import { useState } from "react";

export default function Dropzone() {
	const dispatch = useDispatch();
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const [uploadedFileCount, setUploadedFileCount] = useState(0);

	const onDrop = async (files: File[]) => {
		if (!files.length) return;
		const result = await getModNames(files);
		dispatch(setModNamesList(result));
		setUploadedFileCount(files.length);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
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
				: uploadedFileCount !== 0 && modNames.length !== 0
					? `${uploadedFileCount} mods uploaded`
					: "Drag .jar files or click"}
		</div>
	);
}
