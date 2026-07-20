export type ScheduleEvent = {
  month: number; // 1–12
  day?: number | null;
  title: string;
  type: "feast" | "pilgrimage" | "season" | "liturgy";
  notes?: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function parseYearlySchedule(raw: string | ScheduleEvent[] | unknown): ScheduleEvent[] {
  if (Array.isArray(raw)) {
    return raw.filter(isScheduleEvent);
  }
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isScheduleEvent) : [];
  } catch {
    return [];
  }
}

function isScheduleEvent(value: unknown): value is ScheduleEvent {
  if (!value || typeof value !== "object") return false;
  const v = value as ScheduleEvent;
  return typeof v.month === "number" && typeof v.title === "string";
}

export function groupScheduleByMonth(events: ScheduleEvent[]) {
  return MONTHS.map((name, index) => ({
    month: index + 1,
    name,
    events: events
      .filter((e) => e.month === index + 1)
      .sort((a, b) => (a.day ?? 99) - (b.day ?? 99)),
  }));
}

/** Next upcoming event from "today" forward (wraps into next year). */
export function getUpcomingEvents(events: ScheduleEvent[], limit = 3, from = new Date()) {
  const year = from.getFullYear();
  const scored = events.map((e) => {
    const day = e.day && e.day >= 1 ? e.day : 1;
    let date = new Date(year, e.month - 1, day);
    if (date < startOfDay(from)) {
      date = new Date(year + 1, e.month - 1, day);
    }
    return { event: e, date };
  });
  scored.sort((a, b) => a.date.getTime() - b.date.getTime());
  return scored.slice(0, limit);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatScheduleDate(event: ScheduleEvent) {
  const month = MONTHS[event.month - 1] ?? `Month ${event.month}`;
  if (event.day) return `${month} ${event.day}`;
  return month;
}
