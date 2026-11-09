export default function BlinkingCursor() {
	return (
		<span
			aria-hidden="true"
			className="terminal-cursor inline-block h-4 w-2 bg-foreground"
		/>
	);
}
