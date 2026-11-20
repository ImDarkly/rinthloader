import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import {
  setModNamesList,
  toDisplayNames,
  toModNames,
} from "@/lib/slices/modNamesListSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { useEffect, useState, useRef } from "react";
import { useDebounceCallback } from "@/hooks/useDebounceCallback";
import { validateModSlugs } from "@/lib/modValidation";
import { toast } from "sonner";

export default function ManualModsInput() {
  const dispatch = useAppDispatch();
  const modsList = useAppSelector((state) => state.modNamesList.modNames);
  const titles = useAppSelector((state) => state.modNamesList.titles);
  const [localValue, setLocalValue] = useState(
    toDisplayNames(modsList, titles).join("\n"),
  );
  const isEditingRef = useRef(false);
  const blurValidationIdRef = useRef(0);

  const debouncedDispatch = useDebounceCallback((value: string) => {
    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    dispatch(setModNamesList(toModNames(lines, titles)));
    isEditingRef.current = false;
  }, 500);

  useEffect(() => {
    if (!isEditingRef.current) {
      // Use setTimeout to schedule the state update after the current render cycle,
      // avoiding the "cascading render" warning while maintaining the sync logic.
      setTimeout(() => {
        setLocalValue(toDisplayNames(modsList, titles).join("\n"));
      }, 0);
    }
  }, [modsList, titles]);

  const handleBlur = async () => {
    const lines = localValue
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const names = toModNames(lines, titles);
    dispatch(setModNamesList(names));
    const validationId = ++blurValidationIdRef.current;

    // Validate mods after blur
    const { invalid } = await validateModSlugs(names);
    if (validationId !== blurValidationIdRef.current) return;

    if (invalid.length > 0) {
      toast.error(`${invalid.length} ${invalid.length === 1 ? "mod" : "mods"} not found`, {
        description: invalid.join(", "),
      });
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor="mods-list">Manual Input</FieldLabel>
      <Textarea
        id="mods-list"
        rows={10}
        className="min-h-24 max-h-64 resize-none"
        value={localValue}
        onChange={(e) => {
          isEditingRef.current = true;
          setLocalValue(e.target.value);
          debouncedDispatch(e.target.value);
        }}
        onBlur={() => {
          isEditingRef.current = false;
          void handleBlur();
        }}
      />
      <FieldDescription>
        Enter the list of mods you want to include, one per line.
      </FieldDescription>
    </Field>
  );
}
