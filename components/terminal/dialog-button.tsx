import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Terminal-style `< label >` button. Never `disabled`; `busy` only sets aria-busy. */
export function DialogButton({
	children,
	onClick,
	primary,
	busy,
	className,
}: {
	children: ReactNode;
	onClick: () => void;
	primary?: boolean;
	busy?: boolean;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-busy={busy || undefined}
			className={cn(
				"cursor-pointer px-1 outline-none aria-busy:cursor-wait",
				primary
					? "bg-primary text-background hover:bg-foreground focus-visible:bg-foreground"
					: "hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background",
				className,
			)}
		>
			&lt; {children} &gt;
		</button>
	);
}
