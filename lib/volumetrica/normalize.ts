export function normalizeEnumValue(value: unknown) {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return null;
  const parts = value.split("=");
  return (parts[1] ?? parts[0]).trim();
}

