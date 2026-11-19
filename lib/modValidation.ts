import { getFile, getProject } from "@/lib/api";

// Blur and download validate the same names, so look each one up once.
const projectIdCache = new Map<string, Promise<string | undefined>>();

function getCachedProject(slug: string) {
  const key = slug.toLowerCase();
  let projectId = projectIdCache.get(key);
  if (!projectId) {
    projectId = getProject(slug);
    projectIdCache.set(key, projectId);
    projectId.catch(() => projectIdCache.delete(key));
  }
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

  for (let i = 0; i < slugs.length; i += concurrencyLimit) {
    const chunk = slugs.slice(i, i + concurrencyLimit);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        try {
          const projectId = await getCachedProject(slug);
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
