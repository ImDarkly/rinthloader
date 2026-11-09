"use client";

export default function TerminalConfigField({
	label,
	htmlFor,
	children,
}: {
	label: string;
	htmlFor: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-row items-baseline gap-3">
			<label
				htmlFor={htmlFor}
				className="w-24 shrink-0 text-muted-foreground"
			>
				{label}
			</label>
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
