import { BrandState } from '@/store/useBrand';
import { buildTrendQueries } from '@/lib/queryBuilder';

const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ?? '';
const TIMEOUT_MS = 10000;

// Entertainment/viral patterns with no brand relevance — hard reject
const REJECT_PATTERNS = [
  'comedy', 'prank', 'drama', 'roast', 'vlog', 'storytime', 'toxic',
  'gossip', 'funny moments', 'reaction', 'skit', 'parody', 'cringe',
  'tier list', 'rank every', 'challenge accepted', 'gone wrong',
];

export type YouTubeSignal = {
  topic: string;
  creatorSignal: string;
  freshness: string;
  source: 'YouTube';
};

export async function fetchYoutubeSignals(brand: BrandState): Promise<YouTubeSignal[]> {
  if (!YOUTUBE_API_KEY) {
    console.log('[YOUTUBE] no API key — skipping');
    return [];
  }

  // Use top 3 queries: slice(0,3) → 1 brand + 1 category + 1 cultural (interleaved output)
  const queries = buildTrendQueries(brand).slice(0, 3);
  console.log('[YOUTUBE] fetch started — queries:', queries);

  const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const results = await Promise.allSettled(
    queries.map(q => fetchOneQuery(q, publishedAfter))
  );

  // Merge, filter, deduplicate by truncated title, sort freshest-first
  const seen = new Set<string>();
  const all: YouTubeSignal[] = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const s of result.value) {
      const key = s.topic.toLowerCase().slice(0, 50);
      if (seen.has(key)) continue;
      // Relevance filter: only include signals that pass the brand relevance check
      if (!isVideoRelevant(s.topic, brand)) continue;
      seen.add(key);
      all.push(s);
    }
  }

  // Sort: today → yesterday → oldest
  all.sort((a, b) => freshnessRank(a.freshness) - freshnessRank(b.freshness));

  const top = all.slice(0, 8);
  console.log('[YOUTUBE] after relevance filter:', top.length, 'signals');
  return top;
}

/**
 * Returns false if the video title is clearly irrelevant to the brand's domain.
 * Requires at least one positive signal (brand name, focus area, or keyword match).
 */
function isVideoRelevant(title: string, brand: BrandState): boolean {
  const t = title.toLowerCase();

  // Hard reject: entertainment content unrelated to the brand's space
  if (REJECT_PATTERNS.some(p => t.includes(p))) return false;

  // Require at least one positive relevance signal
  const nameLower = brand.companyName.toLowerCase();
  const focusLower = (brand.focus ?? '').toLowerCase();

  if (t.includes(nameLower)) return true;
  if (focusLower && t.includes(focusLower)) return true;
  if (brand.keywords.some(k => k.length >= 4 && t.includes(k.toLowerCase()))) return true;

  return false;
}

async function fetchOneQuery(query: string, publishedAfter: string): Promise<YouTubeSignal[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet` +
      `&q=${encodeURIComponent(query)}` +
      `&type=video` +
      `&order=viewCount` +
      `&publishedAfter=${encodeURIComponent(publishedAfter)}` +
      `&maxResults=8` +
      `&key=${YOUTUBE_API_KEY}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.log('[YOUTUBE] HTTP', res.status, `for "${query}" —`, err.slice(0, 80));
      return [];
    }

    const data = await res.json();
    const items: any[] = data?.items ?? [];

    return items
      .map((item) => {
        const publishedAt = new Date(item.snippet?.publishedAt ?? Date.now());
        const daysAgo = Math.floor((Date.now() - publishedAt.getTime()) / 86400000);
        return {
          topic: item.snippet?.title ?? '',
          creatorSignal: item.snippet?.channelTitle ?? '',
          freshness: daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`,
          source: 'YouTube' as const,
        };
      })
      .filter(s => s.topic.length > 8);
  } catch (e: any) {
    clearTimeout(timer);
    console.log('[YOUTUBE] fallback for "', query, '" —', e?.message ?? e);
    return [];
  }
}

function freshnessRank(freshness: string): number {
  if (freshness === 'today') return 0;
  if (freshness === 'yesterday') return 1;
  return parseInt(freshness) || 99;
}
