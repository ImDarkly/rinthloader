"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const THEMES = ["light", "dark", "system"] as const;
const linkClass =
	"cursor-pointer px-1 outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background";

export default function TerminalFooter({ onClassic }: { onClassic?: () => void }) {
	const { theme, setTheme } = useTheme();
	// theme is undefined before mount; render "system" until then to avoid a hydration mismatch.
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);
	const current = mounted && theme ? theme : "system";
	const next = THEMES[(THEMES.indexOf(current as (typeof THEMES)[number]) + 1) % THEMES.length];

	return (
		<footer className="flex w-full max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
			<a
				href="https://github.com/ImDarkly/rinthloader"
				target="_blank"
				rel="noreferrer"
				className={`${linkClass} text-foreground`}
			>
				source
			</a>
			<span aria-hidden="true">·</span>
			<span>mods by Modrinth</span>
			<span aria-hidden="true">·</span>
			<button
				type="button"
				onClick={() => setTheme(next)}
				aria-label={`theme: ${current}, switch to ${next}`}
				className={linkClass}
			>
				theme:{current}
			</button>
			{onClassic && (
				<>
					<span aria-hidden="true">·</span>
					<button type="button" onClick={onClassic} className={linkClass}>
						classic view
					</button>
				</>
			)}
		</footer>
	);
}
