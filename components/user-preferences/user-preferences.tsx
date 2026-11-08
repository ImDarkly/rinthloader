"use client";
import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";
import { SelectModLoader } from "./select-mod-loader";
import SelectTheme from "./select-theme";
import ToggleSnapshots from "./toggle-snapshots";
import UiModeSwitch from "../ui-mode-switch";
import { Field, FieldLabel } from "../ui/field";

export default function UserPreferences() {
	return (
		<Popover>
			<PopoverTrigger
				render={<Button variant="secondary">Preferences</Button>}
			/>
			<PopoverContent>
				<PopoverHeader>
					<PopoverTitle>User preferances</PopoverTitle>
					<PopoverDescription>
						Manage your user settings and preferences.
					</PopoverDescription>
				</PopoverHeader>
				<SelectModLoader />
				<ToggleSnapshots />
				<SelectTheme />
				<Field orientation="horizontal" className="items-center">
					<FieldLabel className="text-sm">Interface</FieldLabel>
					<UiModeSwitch />
				</Field>
			</PopoverContent>
		</Popover>
	);
}
