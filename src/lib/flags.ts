export type Flag = "LOW" | "NORMAL" | "HIGH" | null;

export function calculateFlag(
  value: number | null | undefined,
  species: string,
  refMin: number | null,
  refMax: number | null,
  catRefMin: number | null,
  catRefMax: number | null
): Flag {
  if (value == null) return null;

  const min = species === "CAT" ? catRefMin : refMin;
  const max = species === "CAT" ? catRefMax : refMax;

  if (min == null || max == null) return null;
  if (value < min) return "LOW";
  if (value > max) return "HIGH";
  return "NORMAL";
}

export function getFlagColor(flag: Flag): string {
  switch (flag) {
    case "LOW":
      return "text-blue-600 bg-blue-50";
    case "HIGH":
      return "text-red-600 bg-red-50";
    case "NORMAL":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
}

export function getFlagBadgeVariant(flag: Flag): "default" | "secondary" | "destructive" | "outline" {
  switch (flag) {
    case "HIGH":
      return "destructive";
    case "LOW":
      return "secondary";
    case "NORMAL":
      return "outline";
    default:
      return "default";
  }
}
