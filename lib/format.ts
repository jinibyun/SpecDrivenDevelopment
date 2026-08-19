const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/** e.g. "2026. 8. 18 (화) 10:00" */
export function formatDateTimeFull(at: string): string {
  const d = new Date(`${at}:00`);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${WEEKDAYS[d.getDay()]}) ${hh}:${mm}`;
}

/** e.g. "8월 18일 (화) 10:00" */
export function formatDateTimeShort(at: string): string {
  const d = new Date(`${at}:00`);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]}) ${hh}:${mm}`;
}

export { WEEKDAYS };
