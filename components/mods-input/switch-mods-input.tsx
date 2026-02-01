import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AutoModsImport from "./auto-mods-import";
import ManualModsInput from "./manual-mods-input";

export default function SwitchModsInput() {
    return (
        <Tabs defaultValue="account">
            <TabsList>
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="auto">
                    Auto<Badge>New</Badge>
                </TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
                <ManualModsInput />
            </TabsContent>
            <TabsContent value="auto">
                <AutoModsImport />
            </TabsContent>
        </Tabs>
    );
}
