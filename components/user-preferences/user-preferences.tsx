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
import ToggleSnapshots from "./toggle-snapshots";

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
			</PopoverContent>
		</Popover>
	);
}
