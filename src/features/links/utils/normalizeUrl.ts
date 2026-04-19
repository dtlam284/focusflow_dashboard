export function normalizeUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) return trimmed;

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  return hasProtocol ? trimmed : `https://${trimmed}`;
}