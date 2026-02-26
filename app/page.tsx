"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Logo from "@/components/logo";
import ModsDownloadFieldset from "@/components/mods-download-fieldset";
import useSnapshotsEnabled from "@/hooks/useSnapshotsEnabled";
import { SnapshotsState } from "@/lib/types";
import { createContext, useContext } from "react";

const SnapshotsContext = createContext<SnapshotsState>([false, () => {}]);

export function useSnapshotsContext() {
    return useContext(SnapshotsContext);
}

export default function Home() {
    const snapshotsState = useSnapshotsEnabled();

    return (
        <SnapshotsContext.Provider value={snapshotsState}>
            <div className="flex flex-col h-full w-full justify-center items-center">
                <Header />
                <ModsDownloadFieldset />
                <Footer />
            </div>
        </SnapshotsContext.Provider>
    );
}
