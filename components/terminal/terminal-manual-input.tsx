"use client";

import { Textarea } from "../ui/textarea";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { useEffect, useState, useRef } from "react";
import { useDebounceCallback } from "@/hooks/useDebounceCallback";
import { validateModSlugs } from "@/lib/modValidation";
import { toast } from "sonner";

export default function TerminalManualInput() {
	const dispatch = useAppDispatch();
	const modsList = useAppSelector((state) => state.modNamesList.modNames);
	const [localValue, setLocalValue] = useState(modsList.join("\n"));
	const isEditingRef = useRef(false);
	const blurValidationIdRef = useRef(0);

	const debouncedDispatch = useDebounceCallback((value: string) => {
		const lines = value
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);
		dispatch(setModNamesList(lines));
		isEditingRef.current = false;
	}, 500);

	useEffect(() => {
		if (!isEditingRef.current) {
			// Use setTimeout to schedule the state update after the current render cycle,
			// avoiding the "cascading render" warning while maintaining the sync logic.
			setTimeout(() => {
				setLocalValue(modsList.join("\n"));
			}, 0);
		}
	}, [modsList]);

	const handleBlur = async () => {
		const lines = localValue
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);

		dispatch(setModNamesList(lines));
		const validationId = ++blurValidationIdRef.current;

		// Validate mods after blur
		const { invalid } = await validateModSlugs(lines);
		if (validationId !== blurValidationIdRef.current) return;

		if (invalid.length > 0) {
			toast.error(`${invalid.length} mods not found`, {
				description: invalid.join(", "),
			});
		}
	};

	const enteredCount = localValue
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean).length;

	return (
		<div className="flex w-full flex-col gap-2">
			<label htmlFor="mods-list" className="sr-only">
				Mod names
			</label>
			<Textarea
				id="mods-list"
				rows={6}
				className="min-h-32 resize-none rounded-none border-0 bg-transparent px-0 py-0 font-mono text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
				value={localValue}
				placeholder="one mod name per line"
				onChange={(e) => {
					isEditingRef.current = true;
					setLocalValue(e.target.value);
					debouncedDispatch(e.target.value);
				}}
				onBlur={() => {
					isEditingRef.current = false;
					void handleBlur();
				}}
			/>
			<p className="text-xs text-muted-foreground">
				one mod name per line · validated when you leave the field
				{enteredCount > 0 &&
					` · ${enteredCount} ${enteredCount === 1 ? "name" : "names"}`}
			</p>
		</div>
	);
}
