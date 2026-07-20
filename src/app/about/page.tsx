import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = { title: "About & sources" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="Transparency"
        title="About & sources"
        description="Catholic Mass Hub helps you find Mass, pray with the Church’s readings, and explore pilgrimages. Schedules can change — always confirm with the parish or shrine."
      />

      <div className="church-panel space-y-4 p-6 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-heading text-xl text-foreground">Data sources</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Parish & worship times</strong> —{" "}
            <a
              className="text-primary underline"
              href="https://masstimes.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              MassTimes.org
            </a>{" "}
            (includes Mass, Confession, and Adoration when listed).
          </li>
          <li>
            <strong className="text-foreground">Daily readings</strong> — United
            States Conference of Catholic Bishops (USCCB).
          </li>
          <li>
            <strong className="text-foreground">Geocoding</strong> — OpenStreetMap
            Nominatim / Photon.
          </li>
          <li>
            <strong className="text-foreground">Watch Online & pilgrimages</strong>{" "}
            — curated directory, refreshed via seed/admin and periodic link checks.
            Confirm times on each broadcaster or shrine’s official site.
          </li>
        </ul>

        <h2 className="font-heading pt-4 text-xl text-foreground">Disclaimer</h2>
        <p>
          This site is an unofficial aid for the faithful. It is not affiliated with
          the Vatican or any diocese. Liturgical times and feast dates may vary —
          verify before you travel or rely on a stream.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" render={<Link href="/teachings" />}>
            <BookOpen className="mr-2 h-4 w-4" />
            Teachings
          </Button>
          <Button
            variant="outline"
            render={
              <a href="https://www.usccb.org/" target="_blank" rel="noopener noreferrer" />
            }
          >
            USCCB
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
