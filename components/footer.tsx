import UserPreferences from "./user-preferences/user-preferences";

export default function Footer({ onTerminal }: { onTerminal?: () => void }) {
	return (
		<div className="flex flex-col items-center gap-3 p-4">
			<UserPreferences />
			{onTerminal && (
				<button
					type="button"
					onClick={onTerminal}
					className="rounded-sm text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					terminal view
				</button>
			)}
		</div>
	);
}
