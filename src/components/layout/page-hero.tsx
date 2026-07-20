import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

/** Shared section header — Roman Catholic visual language */
export function PageHero({ eyebrow, title, description, actions }: PageHeroProps) {
  return (
    <header className="mb-8">
      {eyebrow ? (
        <Badge
          variant="secondary"
          className="mb-3 border border-accent/40 bg-accent/15 font-medium text-accent-foreground"
        >
          {eyebrow}
        </Badge>
      ) : null}
      <h1 className="font-heading text-3xl font-normal tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      <div className="church-rule my-4 max-w-xs" aria-hidden />
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
