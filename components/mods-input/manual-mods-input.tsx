import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { useEffect, useState, useRef } from "react"; // Added useRef
import { useDebounceCallback } from "@/hooks/useDebounceCallback";

export default function ManualModsInput() {
  const dispatch = useAppDispatch();
  const modsList = useAppSelector((state) => state.modNamesList.modNames);
  const [localValue, setLocalValue] = useState(modsList.join("\n"));
  const isEditingRef = useRef(false);

  const debouncedDispatch = useDebounceCallback((value: string) => {
    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    dispatch(setModNamesList(lines));
    isEditingRef.current = false;
  }, 500);

  useEffect(() => {
    if (!isEditingRef.current) {
      // Use setTimeout to schedule the state update after the current render cycle,
      // avoiding the "cascading render" warning while maintaining the sync logic.
      setTimeout(() => {
        setLocalValue(modsList.join("\n"));
      }, 0);
    }
  }, [modsList]);

  const handleBlur = () => {
    const lines = localValue
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    dispatch(setModNamesList(lines));
  };

  return (
    <Field>
      <FieldLabel htmlFor="mods-list">Manual Input</FieldLabel>
      <Textarea
        id="mods-list"
        rows={10}
        className="h-24 resize-none"
        value={localValue}
        onChange={(e) => {
          isEditingRef.current = true;
          setLocalValue(e.target.value);
          debouncedDispatch(e.target.value);
        }}
        onBlur={() => {
          isEditingRef.current = false;
          handleBlur();
        }}
      />
      <FieldDescription>
        Enter the list of mods you want to include, one per line.
      </FieldDescription>
    </Field>
  );
}
