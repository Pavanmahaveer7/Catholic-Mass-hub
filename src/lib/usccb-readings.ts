import * as cheerio from "cheerio";

export type Reading = {
  title: string;
  citation: string;
  text: string;
};

export type DailyReadings = {
  date: string;
  liturgicalTitle: string;
  lectionary: string | null;
  readings: Reading[];
  url: string;
};

function formatUsccbDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}${dd}${yy}`;
}

export function getReadingsUrl(date: Date): string {
  return `https://bible.usccb.org/bible/readings/${formatUsccbDate(date)}.cfm`;
}

export async function fetchDailyReadings(date = new Date()): Promise<DailyReadings> {
  const url = getReadingsUrl(date);
  const res = await fetch(url, {
    next: { revalidate: 86400 },
    headers: { "User-Agent": "CatholicMassHub/1.0" },
  });

  if (!res.ok) {
    throw new Error(`USCCB fetch failed: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const liturgicalTitle =
    $("h2, h3").first().text().trim() ||
    $("title").text().replace(" | USCCB", "").trim();

  const lectionaryMatch = html.match(/Lectionary:\s*(\d+)/i);
  const readings: Reading[] = [];

  $("div.content-body h3, div.content-body h4").each((_, el) => {
    const title = $(el).text().trim();
    if (!title) return;
    const contentBlock = $(el).nextUntil("h3, h4");
    const citation = contentBlock.find("em, i").first().text().trim();
    const text = contentBlock
      .clone()
      .find("em, i")
      .remove()
      .end()
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);

    if (title && (citation || text)) {
      readings.push({ title, citation, text });
    }
  });

  if (readings.length === 0) {
    $("h3").each((_, el) => {
      const title = $(el).text().trim();
      if (
        title &&
        /reading|psalm|gospel|alleluia/i.test(title)
      ) {
        const next = $(el).next("div, p").text().trim().slice(0, 1500);
        readings.push({ title, citation: "", text: next });
      }
    });
  }

  return {
    date: date.toISOString().slice(0, 10),
    liturgicalTitle,
    lectionary: lectionaryMatch?.[1] ?? null,
    readings,
    url,
  };
}
