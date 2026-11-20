import packageJson from "@/package.json";

export interface ModFile {
  url: string;
  filename: string;
  primary: boolean;
}

// Modrinth asks API clients to identify themselves. Browsers send their own
// User-Agent, and setting one there would add a CORS preflight to every call.
const requestInit: RequestInit | undefined =
  typeof window === "undefined"
    ? {
        headers: {
          "User-Agent": `ImDarkly/rinthloader/${packageJson.version} (github.com/ImDarkly/rinthloader)`,
        },
      }
    : undefined;

export interface ModDependency {
  project_id: string | null;
  dependency_type: "required" | "optional" | "incompatible" | "embedded";
}

export const getProject = async (name: string) => {
  const response = await fetch(
    `https://api.modrinth.com/v2/project/${encodeURIComponent(name)}`,
    requestInit,
  );

  if (!response.ok) {
    if (response.status === 404) return findProjectByTitle(name);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.id;
};

// Mod names like "Fabric API" aren't slugs, so look them up by exact title.
export const findProjectByTitle = async (title: string) => {
  const params = new URLSearchParams({
    query: title,
    facets: JSON.stringify([["project_type:mod"]]),
    limit: "5",
  });
  const response = await fetch(
    `https://api.modrinth.com/v2/search?${params}`,
    requestInit,
  );

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data: { hits: { project_id: string; title: string }[] } =
    await response.json();
  const normalized = title.trim().toLowerCase();
  return data.hits.find((hit) => hit.title.trim().toLowerCase() === normalized)
    ?.project_id;
};

// Maps each id or slug Modrinth found, lowercased, to its project id.
export const getProjects = async (names: string[]) => {
  const response = await fetch(
    `https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(JSON.stringify(names))}`,
    requestInit,
  );
  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const projects: { id: string; slug: string }[] = await response.json();
  const projectIds = new Map<string, string>();
  for (const project of projects) {
    projectIds.set(project.id.toLowerCase(), project.id);
    projectIds.set(project.slug.toLowerCase(), project.id);
  }
  return projectIds;
};

export const getVersion = async (
  id: string,
  modLoader: string,
  gameVersion: string,
) => {
  const url = `https://api.modrinth.com/v2/project/${encodeURIComponent(
    id,
  )}/version?loaders=["${encodeURIComponent(
    modLoader,
  )}"]&game_versions=["${encodeURIComponent(gameVersion)}"]`;
  const response = await fetch(url, requestInit);
  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();
  const version = data?.[0];
  if (!version) return undefined;

  const files: ModFile[] = version.files ?? [];
  const dependencies: ModDependency[] = version.dependencies ?? [];

  return {
    file: files.find((file) => file.primary) ?? files[0],
    dependencies,
  };
};

export const getFile = async (
  id: string,
  modLoader: string,
  gameVersion: string,
) => (await getVersion(id, modLoader, gameVersion))?.file;

// Jars downloaded from Modrinth can be matched exactly by their file hash.
export const getProjectSlugsByFileHash = async (hashes: string[]) => {
  const slugs = new Map<string, string>();
  if (!hashes.length) return slugs;

  const versionsResponse = await fetch(
    "https://api.modrinth.com/v2/version_files",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hashes, algorithm: "sha1" }),
    },
  );
  if (!versionsResponse.ok)
    throw new Error(`API error: ${versionsResponse.status}`);
  const versions: Record<string, { project_id: string }> =
    await versionsResponse.json();

  const projectIds = [...new Set(Object.values(versions).map((v) => v.project_id))];
  if (!projectIds.length) return slugs;

  const projectsResponse = await fetch(
    `https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(JSON.stringify(projectIds))}`,
  );
  if (!projectsResponse.ok)
    throw new Error(`API error: ${projectsResponse.status}`);
  const projects: { id: string; slug: string }[] = await projectsResponse.json();
  const slugById = new Map(projects.map((project) => [project.id, project.slug]));

  for (const [hash, version] of Object.entries(versions)) {
    const slug = slugById.get(version.project_id);
    if (slug) slugs.set(hash, slug);
  }
  return slugs;
};
