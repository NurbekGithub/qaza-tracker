export function extractError(err: unknown): string {
  const message =
    err && typeof err === "object" && "body" in err
      ? (err as { body?: { message?: string } }).body?.message
      : undefined;
  return message ?? "Something went wrong. Please try again.";
}
