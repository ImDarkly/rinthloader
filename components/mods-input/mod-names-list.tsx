import { useAppSelector } from "@/hooks/store";
import { ScrollArea } from "../ui/scroll-area";
import { Item, ItemActions, ItemContent, ItemTitle } from "../ui/item";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { removeModNameFromList } from "@/lib/features/modNamesListSlice";

export default function ModNamesList() {
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const dispatch = useDispatch();

	return (
		<ScrollArea className="h-12">
			<div className="flex flex-col justify-end h-full gap-1">
				{modNames.map((mod) => (
					<Item key={mod} variant="muted">
						<ItemContent>
							<ItemTitle>{mod}</ItemTitle>
						</ItemContent>
						<ItemActions>
							<Button
								onClick={() => {
									dispatch(removeModNameFromList(mod));
								}}
								variant="destructive"
							>
								Remove
							</Button>
						</ItemActions>
					</Item>
				))}
			</div>
		</ScrollArea>
	);
}
