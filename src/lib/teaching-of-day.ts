import { prisma } from "@/lib/db";

export type TeachingOfDay = {
  sectionSlug: string;
  sectionTitle: string;
  source: string;
  chapter: string;
  description: string | null;
};

/** Deterministic daily rotation across teaching chapters. */
export async function getTeachingOfTheDay(
  date = new Date(),
): Promise<TeachingOfDay | null> {
  const sections = await prisma.teachingSection
    .findMany({ orderBy: { sortOrder: "asc" } })
    .catch(() => []);

  if (sections.length === 0) return null;

  const items: TeachingOfDay[] = [];
  for (const s of sections) {
    let chapters: string[] = [];
    try {
      chapters = JSON.parse(s.chapters) as string[];
    } catch {
      chapters = [];
    }
    if (chapters.length === 0) {
      items.push({
        sectionSlug: s.slug,
        sectionTitle: s.title,
        source: s.source,
        chapter: s.description ?? s.title,
        description: s.description,
      });
    } else {
      for (const chapter of chapters) {
        items.push({
          sectionSlug: s.slug,
          sectionTitle: s.title,
          source: s.source,
          chapter,
          description: s.description,
        });
      }
    }
  }

  if (items.length === 0) return null;

  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return items[dayOfYear % items.length]!;
}
