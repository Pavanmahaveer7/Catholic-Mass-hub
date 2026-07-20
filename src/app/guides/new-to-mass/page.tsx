import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = { title: "New to Mass?" };

const tips = [
  {
    title: "Arrive a few minutes early",
    body: "Gives you time to settle, genuflect or bow toward the tabernacle, and prepare quietly. Sunday Mass is an obligation for Catholics; visitors are always welcome.",
  },
  {
    title: "Follow along — stand, sit, kneel",
    body: "The congregation moves together. If you are unsure, stand when others stand and sit when they sit. Kneeling is common during the Eucharistic Prayer if you are able.",
  },
  {
    title: "Holy Communion",
    body: "Catholics in a state of grace and properly disposed may receive. If you are not receiving, you may stay in the pew or approach for a blessing with arms crossed (in many parishes). Non-Catholics are invited to pray for unity.",
  },
  {
    title: "Dress with reverence",
    body: "Modest, respectful clothing is appreciated. The focus is the Eucharist — not fashion.",
  },
  {
    title: "Children are welcome",
    body: "Families with little ones belong at Mass. Many churches have cry rooms or quiet spaces; don’t let noise keep you away.",
  },
  {
    title: "After Mass",
    body: "A brief thanksgiving prayer is traditional. Say hello — parish communities grow through small greetings. Come back next Sunday.",
  },
];

export default function NewToMassPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="First visit"
        title="New to Mass?"
        description="A short guide so you can walk into church with peace — whether it’s your first time or your return."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button render={<Link href="/find?locate=1" />}>Find Mass near me</Button>
        <Button variant="outline" render={<Link href="/readings" />}>
          Today&apos;s readings
        </Button>
        <Button variant="outline" render={<Link href="/prayers" />}>
          Essential prayers
        </Button>
      </div>
      <div className="space-y-4">
        {tips.map((t) => (
          <Card key={t.title} className="church-panel">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-lg font-normal">{t.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {t.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
