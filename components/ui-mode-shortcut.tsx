"use client";

import { useEffect } from "react";
import { useBetaContext } from "@/app/page";

/**
 * Hidden shortcut for the beta UI: Ctrl+Shift+U (Cmd+Shift+U on macOS).
 */
export default function UiModeShortcut() {
	const [, setIsBetaEnabled] = useBetaContext();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
			if (event.altKey || event.key.toLowerCase() !== "u") return;

			event.preventDefault();
			setIsBetaEnabled((enabled) => !enabled);
		};

		// Capture phase so open popovers (which trap key events) can't swallow it.
		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [setIsBetaEnabled]);

	return null;
}
