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

export default function SelectTheme() {
	const { setTheme } = useTheme();

	return (
		<Field orientation="horizontal">
			<FieldLabel htmlFor="theme">Theme</FieldLabel>
			<Select
				onValueChange={(value) => setTheme(value ?? "system")}
				defaultValue="system"
			>
				<SelectTrigger id="theme">
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
