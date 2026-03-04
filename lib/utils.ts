export function extractDate(isoString: string): string {
  if (!isoString) return "";

  return isoString.split("T")[0];
}

