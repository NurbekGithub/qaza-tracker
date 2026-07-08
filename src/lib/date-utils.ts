import dayjs from "dayjs";

export function formatDate(date?: string): string {
  return date ? dayjs(date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
}

export function formatTime(ms: number): string {
  return dayjs(ms).format("HH:mm");
}

export function formatDateLabel(ms: number): string {
  const d = dayjs(ms);
  const iso = d.format("YYYY-MM-DD");
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  if (iso === today) return `Today (${iso})`;
  if (iso === yesterday) return `Yesterday (${iso})`;
  return iso;
}
