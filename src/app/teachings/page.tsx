import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Catholic Teachings" };

const fallbackSections = [
  { slug: "creed", title: "The Creed", source: "Catechism of the Council of Trent", description: "The twelve articles of the Apostles' Creed explained." },
  { slug: "sacraments", title: "The Sacraments", source: "Catechism of the Council of Trent", description: "Baptism, Eucharist, Penance, and the other sacraments." },
  { slug: "commandments", title: "The Commandments", source: "Catechism of the Council of Trent", description: "The Decalogue and the moral life." },
  { slug: "prayer", title: "Prayer", source: "Catechism of the Council of Trent", description: "The Lord's Prayer, Hail Mary, and devotional life." },
  { slug: "baltimore", title: "Baltimore Catechism", source: "Baltimore Catechism No. 2", description: "Classic question-and-answer catechesis." },
];

export default async function TeachingsPage() {
  let sections = await prisma.teachingSection.findMany({
    orderBy: { sortOrder: "asc" },
  }).catch(() => []);

  if (sections.length === 0) {
    sections = fallbackSections.map((s, i) => ({
      ...s,
      id: s.slug,
      sortOrder: i,
      chapters: "[]",
      createdAt: new Date(),
    }));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="Catechesis"
        title="Catholic Teachings"
        description="Classic Roman Catholic formation from the Catechism of the Council of Trent and the Baltimore Catechism — ordered for prayerful reading."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.slug} href={`/teachings/${section.slug}`}>
            <Card className="church-panel h-full transition hover:border-accent/40">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-normal">
                  {section.title}
                </CardTitle>
                <CardDescription>{section.source}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                  Read section <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
