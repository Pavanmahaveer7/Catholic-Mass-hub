import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = { title: "Going to Confession" };

const steps = [
  {
    title: "1. Examine your conscience",
    body: "Quietly review your thoughts, words, and actions since your last Confession. Ask the Holy Spirit for light. Use the Commandments and the Beatitudes as a guide — not to despair, but to be honest.",
  },
  {
    title: "2. Be truly sorry",
    body: "Contrition means sorrow for sin because it offends God who loves you. Perfect contrition is sorrow from love of God; imperfect contrition (fear of punishment) is still a grace that leads you to the sacrament.",
  },
  {
    title: "3. Go to the priest",
    body: "Enter the confessional or reconciliation room. Begin: “Bless me, Father, for I have sinned. It has been ___ since my last Confession.” Then confess your sins plainly and briefly. Ask if you are unsure how to say something.",
  },
  {
    title: "4. Receive counsel and penance",
    body: "Listen to the priest’s advice. He will give a penance (prayers or an act of charity). Resolve, with God’s help, to amend your life.",
  },
  {
    title: "5. Act of Contrition & absolution",
    body: "Pray an Act of Contrition. The priest gives absolution in the name of Christ and the Church. Make the Sign of the Cross and give thanks.",
  },
  {
    title: "6. Do your penance",
    body: "Complete the penance soon. Live in the peace of God’s mercy — and return regularly, not only when you feel “ready.”",
  },
];

const examine = [
  "Have I put God first, or have idols (money, status, screens) ruled me?",
  "Have I used God’s name carelessly? Have I kept Sunday Mass?",
  "Have I honored parents and those in authority?",
  "Have I harmed others in anger, gossip, or impurity?",
  "Have I been honest, generous, and faithful in my duties?",
];

export default function ConfessionGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="Sacrament of Mercy"
        title="Going to Confession"
        description="A simple guide for the first time — or the first time in a long time. Christ waits for you with mercy, not condemnation."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button render={<Link href="/find?service=confession" />}>
          Find Confession near me
        </Button>
        <Button variant="outline" render={<Link href="/prayers#act-of-contrition" />}>
          Act of Contrition
        </Button>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <Card key={s.title} className="church-panel">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-lg font-normal">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="church-panel mt-6 border-l-4 border-l-accent">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-normal">
            Short examination of conscience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {examine.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            If you are nervous, tell the priest — they hear first Confessions often and will help you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
