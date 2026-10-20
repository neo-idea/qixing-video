const CN_DIGITS: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

const CN_NUMBER_WITH_UNIT = /[零一二两三四五六七八九]*(?:[十百千][零一二两三四五六七八九]*)+/g;

function parseChineseNumber(value: string): string {
  let total = 0;
  let current = 0;
  let hasUnit = false;

  for (const char of value) {
    const digit = CN_DIGITS[char];
    if (char === "十" || char === "百" || char === "千") {
      const unit = char === "十" ? 10 : char === "百" ? 100 : 1000;
      total += (current || 1) * unit;
      current = 0;
      hasUnit = true;
      continue;
    }
    if (digit === undefined) continue;
    current = current * 10 + digit;
  }

  if (!hasUnit) return value.split("").map((char) => String(CN_DIGITS[char] ?? 0)).join("");
  return String(total + current);
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(CN_NUMBER_WITH_UNIT, parseChineseNumber)
    .replace(/[零一二两三四五六七八九]/g, (char) => String(CN_DIGITS[char] ?? char))
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

export function searchQueryVariants(query: string): string[] {
  const trimmed = query.trim();
  const compact = trimmed.replace(/\s+/g, "");
  const normalized = normalizeSearchText(trimmed);
  return [...new Set([trimmed, compact, normalized].filter(Boolean))];
}

function bigramSimilarity(left: string, right: string): number {
  if (left === right) return 1;
  if (left.length < 2 || right.length < 2) return left === right ? 1 : 0;

  const grams = new Map<string, number>();
  for (let index = 0; index < left.length - 1; index += 1) {
    const gram = left.slice(index, index + 2);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }

  let hits = 0;
  for (let index = 0; index < right.length - 1; index += 1) {
    const gram = right.slice(index, index + 2);
    const count = grams.get(gram) ?? 0;
    if (count > 0) {
      grams.set(gram, count - 1);
      hits += 1;
    }
  }
  return (2 * hits) / (left.length - 1 + right.length - 1);
}

export function relevanceScore(name: string, keyword: string): number {
  const normalizedName = normalizeSearchText(name);
  const normalizedKeyword = normalizeSearchText(keyword);
  if (!normalizedName || !normalizedKeyword) return 100;
  if (normalizedName === normalizedKeyword) return 0;
  if (normalizedName.startsWith(normalizedKeyword)) return 1;
  if (normalizedName.includes(normalizedKeyword)) return 2;

  const tokens = keyword
    .normalize("NFKC")
    .toLowerCase()
    .split(/[\s\p{P}\p{S}]+/u)
    .map((token) => normalizeSearchText(token))
    .filter(Boolean);
  if (tokens.length > 1 && tokens.every((token) => normalizedName.includes(token))) return 3;

  const similarity = bigramSimilarity(normalizedName, normalizedKeyword);
  if (similarity >= 0.45) return 4;
  if (tokens.some((token) => token.length >= 2 && normalizedName.includes(token))) return 5;
  return 100;
}
