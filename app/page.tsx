import Footer from "@/components/footer";
import ModsDownloadFieldset from "@/components/mods-download-fieldset";

export default function Home() {
	return (
		<div className="flex flex-col h-full w-full justify-center items-center">
			<ModsDownloadFieldset />
			<Footer />
		</div>
	);
}
