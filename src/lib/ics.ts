import type { ScheduleEvent } from "@/lib/pilgrimage-schedule";

/** Build a minimal iCalendar (.ics) for yearly shrine events. */
export function buildPilgrimageIcs(
  siteName: string,
  slug: string,
  events: ScheduleEvent[],
  year = new Date().getFullYear(),
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Catholic Mass Hub//Pilgrimage//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcs(siteName)} ${year}`,
  ];

  for (const event of events) {
    const day = event.day && event.day >= 1 ? event.day : 1;
    const dt = `${year}${pad(event.month)}${pad(day)}`;
    const uid = `${slug}-${event.month}-${day}-${hash(event.title)}@catholicmasshub`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatStamp(new Date())}`,
      `DTSTART;VALUE=DATE:${dt}`,
      `SUMMARY:${escapeIcs(`${siteName}: ${event.title}`)}`,
    );
    if (event.notes) {
      lines.push(`DESCRIPTION:${escapeIcs(event.notes)}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
