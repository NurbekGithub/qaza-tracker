import dayjs from "dayjs";

export function formatDate(date?: string): string {
  return date ? dayjs(date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
}
