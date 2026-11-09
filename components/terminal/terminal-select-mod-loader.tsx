"use client";

import { useModrinthLoaders } from "@/hooks/useModrinthLoaders";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "../ui/combobox";
import { cn } from "@/lib/utils";

export function TerminalSelectModLoader() {
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const dispatch = useAppDispatch();
	const { modLoaders } = useModrinthLoaders();

	return (
		<Combobox
			items={modLoaders}
			onValueChange={(value) => dispatch(setModLoader(value))}
			value={modLoader}
		>
			<span className="inline-flex items-center text-sm">
				<span className="text-muted-foreground">[</span>
				<ComboboxInput
					id="modLoader"
					placeholder="select"
					className={cn(
						"h-auto w-auto border-0 bg-transparent p-0 dark:bg-transparent",
						"has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0",
						"[&_input]:h-auto [&_input]:w-[9ch] [&_input]:p-0 [&_input]:text-sm",
					)}
				/>
				<span className="text-muted-foreground">]</span>
			</span>
			<ComboboxContent className="min-w-56">
				<ComboboxEmpty>No mod loaders found.</ComboboxEmpty>
				<ComboboxList>
					{(item) => (
						<ComboboxItem key={item.name} value={item.name}>
							{item.name}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
