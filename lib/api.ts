export const getProject = async (name: string) => {
  const response = await fetch(
    `https://api.modrinth.com/v2/project/${encodeURIComponent(name)}`,
  );

  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.id;
};

export const getUrl = async (
  id: string,
  modLoader: string,
  gameVersion: string,
) => {
  const url = `https://api.modrinth.com/v2/project/${encodeURIComponent(
    id,
  )}/version?loaders=["${encodeURIComponent(
    modLoader,
  )}"]&game_versions=["${encodeURIComponent(gameVersion)}"]`;
  const response = await fetch(url);
  const data = await response.json();

  return data?.[0]?.files?.[0]?.url;
};
