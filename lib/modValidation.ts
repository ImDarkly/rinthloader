export async function validateModSlugs(
  slugs: string[],
  concurrencyLimit = 5,
): Promise<{ valid: string[]; invalid: string[] }> {
  const valid: string[] = [];
  const invalid: string[] = [];

  // Throttle API calls to maintain performance while avoiding Modrinth rate limits.
  for (let i = 0; i < slugs.length; i += concurrencyLimit) {
    const chunk = slugs.slice(i, i + concurrencyLimit);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        try {
          const response = await fetch(
            `https://api.modrinth.com/v2/project/${encodeURIComponent(slug)}`,
          );
          return { slug, isValid: response.ok };
        } catch {
          // Fail closed to ensure only verified mods proceed if connectivity issues occur.
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
