export default function TerminalFooter() {
	return (
		<footer className="flex w-full flex-wrap items-center gap-2 text-xs text-muted-foreground">
			<a
				href="https://github.com/ImDarkly/rinthloader"
				target="_blank"
				rel="noreferrer"
				className="text-foreground underline-offset-4 hover:underline"
			>
				source
			</a>
			<span aria-hidden="true">·</span>
			<span>mods by Modrinth</span>
		</footer>
	);
}
