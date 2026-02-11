import { Input } from "../ui/input";
import { getModNames } from "@/lib/mod-detector";
import { useDispatch } from "react-redux";
import { setModNamesList } from "@/lib/features/modNamesListSlice";
import { useDropzone } from "react-dropzone";
import { useAppSelector } from "@/hooks/store";

export default function Dropzone() {
	const dispatch = useDispatch();
	const modNames = useAppSelector((state) => state.modNamesList.modNames);

	const onDrop = async (files: File[]) => {
		if (!files.length) return;
		const result = await getModNames(files);
		dispatch(setModNamesList(result));
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
				: modNames.length !== 0
					? `${modNames.length} mods uploaded`
					: "Drag .jar files or click"}
		</div>
	);
}
