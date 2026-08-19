// Fixed business-hours constants shared by the availability API and the
// customer booking flow. Closed Sundays, lunch break 11:30–13:00.
export const BASE_SLOTS = [
  "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
];

/** Longer services get fewer, more spread-out start-time options. */
export function candidateSlotsFor(durationMinutes: number): string[] {
  const step = durationMinutes >= 90 ? 3 : durationMinutes >= 60 ? 2 : 1;
  return BASE_SLOTS.filter((_, i) => i % step === 0);
}

export function isShopClosed(date: Date): boolean {
  return date.getDay() === 0; // Sunday
}

export function isPastDate(date: Date, today: Date = new Date()): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d < t;
}
