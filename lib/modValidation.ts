import {
  findProjectByTitle,
  getProject,
  getProjects,
  getVersion,
  type ModDependency,
} from "@/lib/api";

// Blur and download validate the same names, so look each one up once.
const projectIdCache = new Map<string, Promise<string | undefined>>();

function getCachedProject(slug: string, lookup = getProject) {
  const key = slug.toLowerCase();
  let projectId = projectIdCache.get(key);
  if (!projectId) {
    projectId = lookup(slug);
    projectIdCache.set(key, projectId);
    projectId.catch(() => projectIdCache.delete(key));
  }
  return projectId;
}

// Only names that could be slugs go in the bulk request, so a name like
// "Fabric API" can't make Modrinth reject the whole list.
const slugPattern = /^[\w.+-]{3,64}$/;
const bulkLimit = 100;

function prefetchProjects(slugs: string[]) {
  const prefetched = new Map<string, Promise<string | undefined>>();
  const uncached = new Map<string, string>();
  for (const slug of slugs) {
    const key = slug.toLowerCase();
    if (
      slugPattern.test(slug) &&
      !projectIdCache.has(key) &&
      !uncached.has(key)
    ) {
      uncached.set(key, slug);
    }
  }

  const entries = [...uncached];
  for (let i = 0; i < entries.length; i += bulkLimit) {
    const chunk = entries.slice(i, i + bulkLimit);
    const found = getProjects(chunk.map(([, slug]) => slug)).then((projects) => {
      const projectIds = new Map<string, string>();
      for (const project of projects) {
        projectIds.set(project.id.toLowerCase(), project.id);
        projectIds.set(project.slug.toLowerCase(), project.id);
      }
      return projectIds;
    });
    for (const [key] of chunk) {
      const projectId = found.then((projectIds) => projectIds.get(key));
      // A worker awaits this later; mark it handled so a failed bulk
      // request isn't reported as unhandled in the meantime.
      projectId.catch(() => {});
      prefetched.set(key, projectId);
    }
  }
  return prefetched;
}

// Names the bulk request missed fall back to title search here, inside the
// caller's concurrency limit.
async function resolveProject(
  slug: string,
  prefetched: Map<string, Promise<string | undefined>>,
) {
  const key = slug.toLowerCase();
  const bulk = prefetched.get(key);
  if (!bulk) return getCachedProject(slug);

  const projectId = await bulk;
  if (!projectId) return getCachedProject(slug, findProjectByTitle);

  projectIdCache.set(key, Promise.resolve(projectId));
  return projectId;
}

type Target = { gameVersion: string; modLoader: string };

const requiredIds = (dependencies: ModDependency[]) =>
  dependencies.flatMap((dependency) =>
    dependency.dependency_type === "required" && dependency.project_id
      ? [dependency.project_id]
      : [],
  );

// Mirrors the zip: required dependencies with a matching build, and theirs.
async function findAddedDependencies(
  listedIds: Set<string>,
  dependencyIds: string[],
  target: Target,
) {
  const seen = new Set(listedIds);
  const added: string[] = [];
  let pending = [...new Set(dependencyIds)].filter((id) => !seen.has(id));

  while (pending.length) {
    pending.forEach((id) => seen.add(id));
    const versions = await Promise.all(
      pending.map((id) => getVersion(id, target.modLoader, target.gameVersion)),
    );
    const next: string[] = [];
    versions.forEach((version, i) => {
      if (!version?.file) return;
      added.push(pending[i]);
      for (const id of requiredIds(version.dependencies)) {
        if (!seen.has(id) && !next.includes(id)) next.push(id);
      }
    });
    pending = next;
  }

  if (!added.length) return [];
  const projects = await getProjects(added);
  const titleById = new Map(projects.map((project) => [project.id, project.title]));
  return added.map((id) => titleById.get(id) ?? id);
}

export async function validateModSlugs(
  slugs: string[],
  concurrencyLimit = 5,
  target?: Target,
): Promise<{
  valid: string[];
  invalid: string[];
  unavailable: string[];
  errors: string[];
  dependencies: string[];
}> {
  if (concurrencyLimit <= 0) {
    throw new Error("concurrencyLimit must be greater than 0");
  }
  const valid: string[] = [];
  const invalid: string[] = [];
  const unavailable: string[] = [];
  const errors: string[] = [];
  const prefetched = prefetchProjects(slugs);
  const validIds = new Set<string>();
  const dependencyIds: string[] = [];

  for (let i = 0; i < slugs.length; i += concurrencyLimit) {
    const chunk = slugs.slice(i, i + concurrencyLimit);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        try {
          const projectId = await resolveProject(slug, prefetched);
          if (!projectId) return { slug, status: "invalid" };
          if (!target) return { slug, status: "valid" };

          const version = await getVersion(
            projectId,
            target.modLoader,
            target.gameVersion,
          );
          if (!version?.file) return { slug, status: "unavailable" };
          validIds.add(projectId);
          dependencyIds.push(...requiredIds(version.dependencies));
          return { slug, status: "valid" };
        } catch {
          return { slug, status: "error" };
        }
      }),
    );

    for (const result of results) {
      if (result.status === "valid") valid.push(result.slug);
      else if (result.status === "invalid") invalid.push(result.slug);
      else if (result.status === "unavailable") unavailable.push(result.slug);
      else errors.push(result.slug);
    }
  }

  let dependencies: string[] = [];
  if (target && errors.length === 0) {
    try {
      dependencies = await findAddedDependencies(validIds, dependencyIds, target);
    } catch {
      // The zip still gets its dependencies; only the notice is lost.
    }
  }

  return { valid, invalid, unavailable, errors, dependencies };
}
