const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseEventDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export type EventDateEntry =
  | string
  | { date: string; photos?: string[]; credit?: { text: string; url: string } };

export type WWEvent = {
  name: string;
  place: string;
  address?: string;
  time?: string;
  image?: string;
  dates: EventDateEntry[];
};

export type Occurrence = {
  date: Date;
  photos?: string[];
  credit?: { text: string; url: string };
};

export type UpcomingEvent = { event: WWEvent; futureDates: Date[] };
export type PastOccurrence = { event: WWEvent; occurrence: Occurrence };

function normalize(entry: EventDateEntry): Occurrence {
  if (typeof entry === "string") return { date: parseEventDate(entry) };
  return { date: parseEventDate(entry.date), photos: entry.photos, credit: entry.credit };
}

export function splitEvents(
  events: WWEvent[],
  today: Date,
): { upcoming: UpcomingEvent[]; past: PastOccurrence[] } {
  const upcoming: UpcomingEvent[] = [];
  const past: PastOccurrence[] = [];

  for (const event of events) {
    const occ = event.dates.map(normalize);
    const future = occ
      .filter((o) => o.date >= today)
      .map((o) => o.date)
      .sort((a, b) => a.getTime() - b.getTime());
    const gone = occ
      .filter((o) => o.date < today)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (future.length) upcoming.push({ event, futureDates: future });
    for (const o of gone) past.push({ event, occurrence: o });
  }

  upcoming.sort((a, b) => a.futureDates[0].getTime() - b.futureDates[0].getTime());
  past.sort((a, b) => b.occurrence.date.getTime() - a.occurrence.date.getTime());
  return { upcoming, past };
}

export function nextOccurrence(
  events: WWEvent[],
  today: Date,
): { event: WWEvent; date: Date } | null {
  let best: { event: WWEvent; date: Date } | null = null;
  for (const event of events) {
    for (const entry of event.dates) {
      const d = normalize(entry).date;
      if (d >= today && (best === null || d < best.date)) best = { event, date: d };
    }
  }
  return best;
}

export function formatChip(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatFull(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function isWithinDays(d: Date, today: Date, days: number): boolean {
  const diff = (d.getTime() - today.getTime()) / 86400000;
  return diff >= 0 && diff <= days;
}

export { MONTHS };
