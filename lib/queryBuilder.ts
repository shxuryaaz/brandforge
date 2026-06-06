import { BrandState } from '@/store/useBrand';

/**
 * Generates 6-8 queries across 3 buckets:
 *   BRAND    — brand + attribute (narrow, brand-specific)
 *   CATEGORY — industry/category without brand prefix (broad category signal)
 *   CULTURAL — social/creator/trend angles (social momentum signal)
 *
 * Output is interleaved so any slice(0, N) gets cross-bucket coverage:
 *   index 0 → brand, 1 → category, 2 → cultural, 3 → brand, ...
 */
export function buildTrendQueries(brand: BrandState): string[] {
  const { companyName: name, keywords, focus } = brand;
  const nameLower = name.toLowerCase();

  const brandQ: string[] = [];
  const categoryQ: string[] = [];
  const culturalQ: string[] = [];

  // ── BRAND BUCKET ─────────────────────────────────────────────────────────
  if (focus) brandQ.push(`${name} ${focus}`);
  for (const kw of keywords.slice(0, 3)) {
    if (kw.toLowerCase().startsWith(nameLower)) {
      brandQ.push(kw); // keyword already contains brand name — use as-is
    } else {
      brandQ.push(`${name} ${kw}`);
    }
  }

  // ── CATEGORY BUCKET ───────────────────────────────────────────────────────
  // focus itself is the category
  if (focus) categoryQ.push(focus);
  for (const kw of keywords) {
    // Multi-word or long keywords that don't contain brand name = category signals
    if (!kw.toLowerCase().includes(nameLower) && (kw.includes(' ') || kw.length >= 8)) {
      categoryQ.push(kw);
    }
  }

  // ── CULTURAL BUCKET ────────────────────────────────────────────────────────
  if (focus) {
    culturalQ.push(`${focus} trends`);
    culturalQ.push(`${focus} creator`);
  }
  for (const kw of keywords.slice(0, 2)) {
    if (!kw.toLowerCase().includes(nameLower) && kw.length >= 6) {
      culturalQ.push(`${kw} culture`);
    }
  }

  // ── INTERLEAVE: brand → category → cultural → brand → ... ─────────────────
  // This ensures slice(0,2) = 1 brand + 1 category
  //              slice(0,3) = 1 brand + 1 category + 1 cultural
  const seen = new Set<string>();
  const out: string[] = [];

  function add(q: string) {
    const key = q.toLowerCase().trim();
    if (key.length < 5 || seen.has(key)) return;
    seen.add(key);
    out.push(q.trim());
  }

  const maxLen = Math.max(brandQ.length, categoryQ.length, culturalQ.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < brandQ.length) add(brandQ[i]);
    if (i < categoryQ.length) add(categoryQ[i]);
    if (i < culturalQ.length) add(culturalQ[i]);
  }

  console.log('[QUERY_BUILDER] buckets — brand:', brandQ.length, 'category:', categoryQ.length, 'cultural:', culturalQ.length);
  console.log('[QUERY_BUILDER] final queries:', out);
  return out.slice(0, 8);
}
