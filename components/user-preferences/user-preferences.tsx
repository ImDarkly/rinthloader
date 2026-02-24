"use client";
import { SelectModLoader } from "../select-mod-loader";
import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";

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
			</PopoverContent>
		</Popover>
	);
}
