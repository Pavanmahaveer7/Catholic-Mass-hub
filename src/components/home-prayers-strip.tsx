import Link from "next/link";
import { prayers } from "@/data/prayers";
import { Button } from "@/components/ui/button";

/** Compact prayer links for the home page — no account needed. */
export function HomePrayersStrip() {
  const featured = prayers.slice(0, 4);
  return (
    <section className="mb-12" aria-labelledby="prayers-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="prayers-heading" className="font-heading text-2xl md:text-3xl">
            Pray now
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Essential prayers — tap to open. No sign-in needed.
          </p>
          <div className="church-rule mt-3 max-w-[8rem]" aria-hidden />
        </div>
        <Button variant="link" className="text-primary" render={<Link href="/prayers" />}>
          All prayers
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {featured.map((p) => (
          <Button
            key={p.id}
            variant="outline"
            className="border-accent/40"
            render={<Link href={`/prayers#${p.id}`} />}
          >
            {p.title}
          </Button>
        ))}
        <Button variant="secondary" render={<Link href="/guides/confession" />}>
          Confession guide
        </Button>
        <Button variant="secondary" render={<Link href="/guides/new-to-mass" />}>
          New to Mass?
        </Button>
      </div>
    </section>
  );
}
