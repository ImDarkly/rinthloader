"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FuzzyPicker } from "./fuzzy-picker";

/** A `[ value ▼]` field that opens a fuzzy picker box right under it. */
export function DropField({
	id,
	label,
	value,
	items,
	onPick,
	extra,
}: {
	id: string;
	label: string;
	value: string | null;
	items: string[];
	onPick: (v: string) => void;
	extra?: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const root = useRef<HTMLDivElement>(null);
	const btn = useRef<HTMLButtonElement>(null);

	const close = () => {
		setOpen(false);
		btn.current?.focus();
	};

	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e: PointerEvent) => {
			if (root.current?.contains(e.target as Node)) return;
			setOpen(false);
			// Return focus to the field unless the click landed on another focusable control.
			setTimeout(() => {
				if (document.activeElement === document.body) btn.current?.focus();
			}, 0);
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [open]);

	return (
		<div
			ref={root}
			className="relative"
			onKeyDown={(e) => {
				if (open && e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					close();
				}
			}}
			onBlur={(e) => {
				// Focus left the field entirely: close without stealing focus back.
				if (open && !root.current?.contains(e.relatedTarget as Node | null)) {
					setOpen(false);
				}
			}}
		>
			<div className="flex flex-wrap items-center gap-x-3">
				<span id={`${id}-label`} className="w-24 shrink-0">
					{label}
				</span>
				<button
					ref={btn}
					id={`${id}-btn`}
					type="button"
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-labelledby={`${id}-label ${id}-btn`}
					onClick={() => setOpen((o) => !o)}
					className="cursor-pointer outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
				>
					[ <span className="inline-block w-[14ch] text-left">{value ?? "select"}</span>▼]
				</button>
				{extra}
			</div>
			{open && (
				<div
					// Keep input focus on option clicks so the blur-close doesn't fire first.
					// Inputs are exempt so the caret can be placed and text drag-selected.
					onMouseDown={(e) => {
						if ((e.target as HTMLElement).tagName !== "INPUT") e.preventDefault();
					}}
					className="absolute top-full left-0 z-10 mt-1 w-full border-2 border-foreground bg-background p-2 shadow-[6px_6px_0_0_var(--muted-foreground)] sm:left-[calc(6rem+0.75rem)] sm:max-w-xs"
				>
					{items.length === 0 ? (
						<div className="text-muted-foreground">loading…</div>
					) : (
						<FuzzyPicker
							id={id}
							label={label}
							autoFocus
							rows={7}
							items={items}
							value={value}
							onPick={(v) => {
								onPick(v);
								close();
							}}
						/>
					)}
					<div className="mt-1 text-muted-foreground">esc close</div>
				</div>
			)}
		</div>
	);
}
