export const getProject = async (name: string) => {
	const response = await fetch(
		`https://api.modrinth.com/v2/search?query=${encodeURIComponent(name)}`
	);
	const data = await response.json();
	const id = data.hits?.[0]?.project_id;

	return id;
};

export const getUrl = async (
	id: string,
	loader: string,
	gameVersion: string
) => {
	const url = `https://api.modrinth.com/v2/project/${encodeURIComponent(
		id
	)}/version?loaders=["${encodeURIComponent(
		loader
	)}"]&game_versions=["${encodeURIComponent(gameVersion)}"]`;
	const response = await fetch(url);
	const data = await response.json();

	return data?.[0]?.files?.[0]?.url;
};
