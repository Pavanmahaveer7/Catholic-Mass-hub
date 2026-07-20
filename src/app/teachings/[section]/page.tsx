import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = { params: Promise<{ section: string }> };

const content: Record<string, { intro: string; chapters: { title: string; body: string }[] }> = {
  creed: {
    intro: "The Apostles' Creed is the summary of faith professed by Catholics worldwide.",
    chapters: [
      { title: "I believe in God the Father", body: "We believe in one God, Father Almighty, Creator of heaven and earth. He made us to know, love, and serve Him in this life and to be happy with Him forever in the next." },
      { title: "And in Jesus Christ, His Son", body: "Our Lord Jesus Christ is true God and true man. He suffered under Pontius Pilate, was crucified, died, and was buried. On the third day He rose again." },
      { title: "The Holy Catholic Church", body: "The Church is one, holy, catholic, and apostolic. Christ founded it upon Peter and the apostles, and it subsists in the Catholic Church." },
    ],
  },
  sacraments: {
    intro: "Seven sacraments instituted by Christ for the sanctification of souls.",
    chapters: [
      { title: "Baptism", body: "Baptism washes away original sin and makes us children of God and members of the Church." },
      { title: "The Holy Eucharist", body: "In the Mass, bread and wine become the Body and Blood of Christ — the source and summit of Christian life." },
      { title: "Penance", body: "Through Confession, the penitent receives absolution and reconciliation with God and the Church." },
    ],
  },
  commandments: {
    intro: "The Ten Commandments express man's fundamental duties toward God and neighbor.",
    chapters: [
      { title: "First Commandment", body: "I am the Lord thy God; thou shalt not have strange gods before Me." },
      { title: "Second Commandment", body: "Thou shalt not take the name of the Lord thy God in vain." },
      { title: "Third Commandment", body: "Remember to keep holy the Lord's day — attend Mass on Sundays and holy days of obligation." },
    ],
  },
  prayer: {
    intro: "Prayer is the raising of the mind and heart to God.",
    chapters: [
      { title: "The Lord's Prayer", body: "Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come, Thy will be done on earth as it is in heaven." },
      { title: "The Hail Mary", body: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus." },
      { title: "The Rosary", body: "The Rosary meditates on the mysteries of Christ's life through the intercession of the Blessed Virgin Mary." },
    ],
  },
  baltimore: {
    intro: "The Baltimore Catechism presents Catholic doctrine in a simple question-and-answer format.",
    chapters: [
      { title: "Lesson 1: Purpose of Man", body: "Q. Why did God make you? A. God made me to know Him, to love Him, and to serve Him in this world, and to be happy with Him forever in heaven." },
      { title: "Lesson 2: God and Creation", body: "Q. Who made the world? A. God made the world." },
      { title: "Lesson 3: Unity and Trinity", body: "Q. Is there but one God? A. Yes; there is but one God." },
    ],
  },
};

export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  const db = await prisma.teachingSection.findUnique({ where: { slug: section } }).catch(() => null);
  return { title: db?.title ?? section };
}

export default async function TeachingSectionPage({ params }: Props) {
  const { section } = await params;
  const db = await prisma.teachingSection.findUnique({ where: { slug: section } }).catch(() => null);
  const data = content[section];

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p>Section not found.</p>
        <Button className="mt-4" render={<Link href="/teachings" />}>Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="md:w-56">
        <Button variant="link" className="px-0" render={<Link href="/teachings" />}>
          ← All teachings
        </Button>
        <ScrollArea className="mt-4 h-[50vh]">
          <nav aria-label="Chapters" className="space-y-1">
            {data.chapters.map((ch) => (
              <a
                key={ch.title}
                href={`#${ch.title.replace(/\s+/g, "-").toLowerCase()}`}
                className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                {ch.title}
              </a>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <article className="flex-1">
        <h1 className="font-heading text-3xl">{db?.title ?? section}</h1>
        <p className="mt-2 text-muted-foreground">{data.intro}</p>
        <div className="mt-8 space-y-6">
          {data.chapters.map((ch) => (
            <Card key={ch.title} id={ch.title.replace(/\s+/g, "-").toLowerCase()}>
              <CardHeader>
                <CardTitle className="font-heading text-xl font-normal">{ch.title}</CardTitle>
              </CardHeader>
              <CardContent className="leading-relaxed text-muted-foreground">{ch.body}</CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Based on public-domain catechetical sources. See also the{" "}
          <a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM" className="underline" target="_blank" rel="noopener noreferrer">
            Catechism of the Catholic Church
          </a>.
        </p>
      </article>
    </div>
  );
}
