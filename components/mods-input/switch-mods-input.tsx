import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AutoModsImport from "./auto-mods-import";
import ManualModsInput from "./manual-mods-input";

export default function SwitchModsInput() {
	return (
		<Tabs defaultValue="auto">
			<TabsList>
				<TabsTrigger value="auto">Auto</TabsTrigger>
				<TabsTrigger value="manual">Manual</TabsTrigger>
			</TabsList>
			<TabsContent value="auto" keepMounted>
				<AutoModsImport />
			</TabsContent>
			<TabsContent value="manual">
				<ManualModsInput />
			</TabsContent>
		</Tabs>
	);
}
