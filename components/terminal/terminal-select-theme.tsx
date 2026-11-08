"use client";

import { useTheme } from "next-themes";
import { Field, FieldLabel } from "../ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const themes = ["light", "dark", "system"] as const;

export default function TerminalSelectTheme({
	compact = false,
}: {
	compact?: boolean;
}) {
	const { theme, setTheme } = useTheme();

	return (
		<Field
			orientation={compact ? "horizontal" : "vertical"}
			className={compact ? "items-center" : undefined}
		>
			<FieldLabel
				htmlFor="theme"
				className={compact ? "text-muted-foreground" : "text-sm"}
			>
				Theme
			</FieldLabel>
			<Select
				onValueChange={(value) => setTheme(value ?? "system")}
				value={theme ?? "system"}
			>
				<SelectTrigger
					id="theme"
					className={compact ? "h-7 text-xs" : "h-9 w-full text-base"}
				>
					<SelectValue data-placeholder="Select theme" />
				</SelectTrigger>

				<SelectContent>
					<SelectGroup>
						{themes.map((theme) => (
							<SelectItem value={theme} key={theme}>
								{theme}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	);
}
