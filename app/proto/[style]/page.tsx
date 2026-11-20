"use client";

// THROWAWAY SPIKE: /proto/a … /proto/d — terminal UI prototypes.

import { use } from "react";
import { ProtoNav } from "@/components/proto/shared";
import ProtoWizard from "@/components/proto/proto-a-wizard";
import ProtoPanes from "@/components/proto/proto-b-panes";
import ProtoDialog from "@/components/proto/proto-c-dialog";
import ProtoFuzzy from "@/components/proto/proto-d-fuzzy";
import ProtoSetup from "@/components/proto/proto-e-setup";

const views = { a: ProtoWizard, b: ProtoPanes, c: ProtoDialog, d: ProtoFuzzy, e: ProtoSetup } as const;

export default function ProtoPage({ params }: { params: Promise<{ style: string }> }) {
	const { style } = use(params);
	const View = views[style as keyof typeof views] ?? ProtoWizard;

	return (
		<div className="flex min-h-dvh w-full flex-col items-center px-4 py-6 font-mono text-sm sm:px-6 sm:py-8 sm:text-base">
			<div className="flex w-full max-w-3xl flex-col gap-6">
				<ProtoNav current={style} />
				<View />
			</div>
		</div>
	);
}
