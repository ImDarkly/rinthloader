import {
  findProjectByTitle,
  getFile,
  getProject,
  getProjects,
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
    const found = getProjects(chunk.map(([, slug]) => slug));
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

export async function validateModSlugs(
  slugs: string[],
  concurrencyLimit = 5,
  target?: { gameVersion: string; modLoader: string },
): Promise<{
  valid: string[];
  invalid: string[];
  unavailable: string[];
  errors: string[];
}> {
  if (concurrencyLimit <= 0) {
    throw new Error("concurrencyLimit must be greater than 0");
  }
  const valid: string[] = [];
  const invalid: string[] = [];
  const unavailable: string[] = [];
  const errors: string[] = [];
  const prefetched = prefetchProjects(slugs);

  for (let i = 0; i < slugs.length; i += concurrencyLimit) {
    const chunk = slugs.slice(i, i + concurrencyLimit);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        try {
          const projectId = await resolveProject(slug, prefetched);
          if (!projectId) return { slug, status: "invalid" };
          if (!target) return { slug, status: "valid" };

          const file = await getFile(
            projectId,
            target.modLoader,
            target.gameVersion,
          );
          return { slug, status: file ? "valid" : "unavailable" };
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

  return { valid, invalid, unavailable, errors };
}
