export interface ModFile {
  url: string;
  filename: string;
  primary: boolean;
}

export const getProject = async (name: string) => {
  const response = await fetch(
    `https://api.modrinth.com/v2/project/${encodeURIComponent(name)}`,
  );

  if (!response.ok) {
    if (response.status === 404) return findProjectByTitle(name);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.id;
};

// Mod names like "Fabric API" aren't slugs, so look them up by exact title.
const findProjectByTitle = async (title: string) => {
  const params = new URLSearchParams({
    query: title,
    facets: JSON.stringify([["project_type:mod"]]),
    limit: "5",
  });
  const response = await fetch(`https://api.modrinth.com/v2/search?${params}`);

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data: { hits: { project_id: string; title: string }[] } =
    await response.json();
  const normalized = title.trim().toLowerCase();
  return data.hits.find((hit) => hit.title.trim().toLowerCase() === normalized)
    ?.project_id;
};

export const getFile = async (
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
  const files: ModFile[] = data?.[0]?.files ?? [];

  return files.find((file) => file.primary) ?? files[0];
};
