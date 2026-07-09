import { getProject } from "@/lib/api";

export async function validateModSlugs(
  slugs: string[],
  concurrencyLimit = 5,
): Promise<{ valid: string[]; invalid: string[]; errors: string[] }> {
  if (concurrencyLimit <= 0) {
    throw new Error("concurrencyLimit must be greater than 0");
  }
  const valid: string[] = [];
  const invalid: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < slugs.length; i += concurrencyLimit) {
    const chunk = slugs.slice(i, i + concurrencyLimit);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        try {
          const projectId = await getProject(slug);
          return { slug, status: projectId ? "valid" : "invalid" };
        } catch {
          return { slug, status: "error" };
        }
      }),
    );

    for (const result of results) {
      if (result.status === "valid") valid.push(result.slug);
      else if (result.status === "invalid") invalid.push(result.slug);
      else errors.push(result.slug);
    }
  }

  return { valid, invalid, errors };
}
