import type { Church, WorshipTime } from "@/lib/masstimes";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type ServiceFilter =
  | "all"
  | "mass"
  | "confession"
  | "adoration"
  | "devotions"
  | "holy_days";

export function getTodayDayIndex(): number {
  return new Date().getDay();
}

export function parseWorshipTime(time: string | null): Date | null {
  if (!time) return null;
  const match = time.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[4]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function formatTime(time: string | null): string {
  const d = parseWorshipTime(time);
  if (!d) return "—";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function matchesServiceFilter(
  wt: WorshipTime,
  filter: ServiceFilter,
): boolean {
  if (filter === "all") return true;
  const name = (wt.service_typename ?? "").toLowerCase();
  if (filter === "mass") return name.includes("weekend") || name.includes("weekday") || name.includes("mass");
  if (filter === "confession") return name.includes("confession");
  if (filter === "adoration") return name.includes("adoration");
  if (filter === "devotions") return name.includes("devotion");
  if (filter === "holy_days") return name.includes("holy");
  return true;
}

export function matchesDay(wt: WorshipTime, dayIndex: number | "all"): boolean {
  if (dayIndex === "all") return true;
  return wt.day_of_week === String(dayIndex) || wt.day_of_week === "99";
}

export function churchHasServiceToday(
  church: Church,
  filter: ServiceFilter = "mass",
): boolean {
  const today = getTodayDayIndex();
  return church.church_worship_times.some(
    (wt) => matchesDay(wt, today) && matchesServiceFilter(wt, filter),
  );
}

export function groupWorshipTimes(times: WorshipTime[]) {
  const groups: Record<string, WorshipTime[]> = {};
  for (const wt of times) {
    const day =
      wt.day_of_week === "99"
        ? "Special"
        : DAY_NAMES[parseInt(wt.day_of_week, 10)] ?? `Day ${wt.day_of_week}`;
    if (!groups[day]) groups[day] = [];
    groups[day].push(wt);
  }
  return groups;
}

export function sortChurchesByTime(churches: Church[]): Church[] {
  const today = getTodayDayIndex();
  return [...churches].sort((a, b) => {
    const aTime = earliestToday(a, today);
    const bTime = earliestToday(b, today);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return aTime.getTime() - bTime.getTime();
  });
}

function earliestToday(church: Church, dayIndex: number): Date | null {
  let earliest: Date | null = null;
  for (const wt of church.church_worship_times) {
    if (!matchesDay(wt, dayIndex)) continue;
    const parsed = parseWorshipTime(wt.time_start);
    if (!parsed) continue;
    if (!earliest || parsed < earliest) earliest = parsed;
  }
  return earliest;
}

export function sortChurchesByDistance(churches: Church[]): Church[] {
  return [...churches].sort(
    (a, b) =>
      parseFloat(a.distance ?? "9999") - parseFloat(b.distance ?? "9999"),
  );
}

export function filterChurches(
  churches: Church[],
  options: {
    service?: ServiceFilter;
    day?: number | "all";
    language?: string;
    rite?: string;
  },
): Church[] {
  const { service = "mass", day = getTodayDayIndex(), language, rite } = options;

  return churches.filter((church) => {
    if (language && !church.language_name.toLowerCase().includes(language.toLowerCase())) {
      return false;
    }
    if (rite && !church.rite_type_name.toLowerCase().includes(rite.toLowerCase())) {
      return false;
    }
    if (day === "all" && service === "all") return true;
    return church.church_worship_times.some(
      (wt) =>
        matchesDay(wt, day) &&
        matchesServiceFilter(wt, service),
    );
  });
}
