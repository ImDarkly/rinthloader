import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { getModNames } from "@/lib/mod-detector";
import { useDispatch } from "react-redux";
import { setModNamesList } from "@/lib/features/modNamesListSlice";

export default function AutoModsImport() {
    const dispatch = useDispatch();

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (!files.length) return;

        const result = await getModNames(files);
        dispatch(setModNamesList(result));
    };

    return (
        <Field>
            <FieldLabel htmlFor="mod">Auto Import</FieldLabel>
            <Input
                id="mod"
                type="file"
                accept=".jar"
                className="h-24"
                multiple
                onChange={handleFile}
            />
            <FieldDescription>
                Click or drag to upload. Only Fabric mods supported.
            </FieldDescription>
        </Field>
    );
}
