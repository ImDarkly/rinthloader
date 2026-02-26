import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Logo() {
    return (
        <Link
            className="flex flex-row group/logo"
            href="https://github.com/ImDarkly/rinthloader"
        >
            <span className="text-primary">rinth</span>loader
            <ExternalLink
                className="invisible group-hover/logo:visible"
                size={16}
            />
        </Link>
    );
}
