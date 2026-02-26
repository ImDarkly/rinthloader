import { RiExternalLinkLine } from "@remixicon/react";

export default function Logo() {
	return (
		<a
			className="flex flex-row group/logo"
			href="https://github.com/ImDarkly/rinthloader"
			target="_blank"
		>
			<span className="text-primary">rinth</span>loader
			<RiExternalLinkLine
				size={16}
				className="invisible group-hover/logo:visible"
			/>
		</a>
	);
}
