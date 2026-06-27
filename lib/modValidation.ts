import { getProject } from "@/lib/api";

export async function validateModSlugs(
  slugs: string[],
  concurrencyLimit = 5,
): Promise<{ valid: string[]; invalid: string[] }> {
  if (concurrencyLimit <= 0) {
    throw new Error("concurrencyLimit must be greater than 0");
  }
  const valid: string[] = [];
  const invalid: string[] = [];

  // Throttling ensures we respect Modrinth rate limits and maintain
  // responsiveness while performing validation.
  for (let i = 0; i < slugs.length; i += concurrencyLimit) {
    const chunk = slugs.slice(i, i + concurrencyLimit);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        try {
          // Use search-based resolution to support display names and
          // case-insensitive matching instead of strict slug lookups.
          const projectId = await getProject(slug);
          return { slug, isValid: !!projectId };
        } catch {
          // Fail closed to ensure only verified mods proceed if connectivity
          // issues or API errors occur.
          return { slug, isValid: false };
        }
      }),
    );

    for (const result of results) {
      if (result.isValid) {
        valid.push(result.slug);
      } else {
        invalid.push(result.slug);
      }
    }
  }

  return { valid, invalid };
}
