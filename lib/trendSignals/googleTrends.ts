import { BrandState } from '@/store/useBrand';
import { buildTrendQueries } from '@/lib/queryBuilder';

const SERP_API_KEY = process.env.EXPO_PUBLIC_SERP_API_KEY ?? '';
const TIMEOUT_MS = 20000;

export type GoogleTrendSignal = {
  topic: string;
  growth: string;
  relevance: number;
  source: 'Google Trends';
};

export async function fetchGoogleTrends(brand: BrandState): Promise<GoogleTrendSignal[]> {
  if (!SERP_API_KEY) {
    console.log('[GOOGLE_TRENDS] no API key — skipping');
    return [];
  }

  // slice(0,2) → 1 brand + 1 category query (interleaved output from queryBuilder)
  const queries = buildTrendQueries(brand).slice(0, 2);
  console.log('[GOOGLE_TRENDS] fetch started — queries:', queries);

  const results = await Promise.allSettled(queries.map(q => fetchOneQuery(q)));

  // Merge signals, dedup by topic text
  const seen = new Set<string>();
  const signals: GoogleTrendSignal[] = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const s of result.value) {
      const key = s.topic.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push(s);
    }
  }

  if (signals.length > 0) {
    console.log('[GOOGLE_TRENDS] success —', signals.length, 'signals');
    console.log('[GOOGLE_TRENDS] preview:', JSON.stringify(signals.slice(0, 2)));
  } else {
    console.log('[GOOGLE_TRENDS] no signals across', queries.length, 'queries');
  }

  return signals.slice(0, 10);
}

async function fetchOneQuery(query: string): Promise<GoogleTrendSignal[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url =
      `https://serpapi.com/search.json` +
      `?engine=google_trends` +
      `&q=${encodeURIComponent(query)}` +
      `&date=now+7-d` +
      `&api_key=${SERP_API_KEY}`;

    console.log('[GOOGLE_TRENDS] url:', url.replace(SERP_API_KEY, 'KEY_HIDDEN'));

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.log('[GOOGLE_TRENDS] HTTP', res.status, `for "${query}" —`, errText.slice(0, 150));
      return [];
    }

    const data = await res.json();
    console.log('[GOOGLE_TRENDS] raw keys:', Object.keys(data).join(', '), `for "${query}"`);

    const signals: GoogleTrendSignal[] = [];

    // ── Rising topics ──────────────────────────────────────────────────────
    const risingTopics: any[] = data?.related_topics?.rising ?? [];
    console.log('[GOOGLE_TRENDS] rising topics:', risingTopics.length, `for "${query}"`);
    for (const t of risingTopics.slice(0, 5)) {
      const title = t?.topic?.title ?? t?.topic?.value ?? '';
      if (!title) continue;
      signals.push({
        topic: title,
        growth: formatGrowth(t?.extracted_value ?? t?.value),
        relevance: 88,
        source: 'Google Trends',
      });
    }

    // ── Rising queries ─────────────────────────────────────────────────────
    const risingQueries: any[] = data?.related_queries?.rising ?? [];
    console.log('[GOOGLE_TRENDS] rising queries:', risingQueries.length, `for "${query}"`);
    for (const q of risingQueries.slice(0, 5)) {
      const qText = q?.query ?? '';
      if (!qText) continue;
      signals.push({
        topic: qText,
        growth: formatGrowth(q?.extracted_value ?? q?.value),
        relevance: 75,
        source: 'Google Trends',
      });
    }

    // ── Fallback: infer momentum from interest_over_time timeline ──────────
    if (signals.length === 0) {
      const timeline: any[] = data?.interest_over_time?.timeline_data ?? [];
      console.log('[GOOGLE_TRENDS] no rising data — timeline points:', timeline.length);

      if (timeline.length >= 4) {
        const vals = timeline.map((d: any) => {
          const raw = d?.values?.[0]?.value ?? d?.value ?? 0;
          return typeof raw === 'number' ? raw : parseInt(raw) || 0;
        });
        const halfLen = Math.floor(vals.length / 2);
        const earlyAvg = vals.slice(0, halfLen).reduce((a: number, b: number) => a + b, 0) / halfLen;
        const recentAvg = vals.slice(halfLen).reduce((a: number, b: number) => a + b, 0) / (vals.length - halfLen);
        const momentumPct = earlyAvg > 5
          ? Math.round(((recentAvg - earlyAvg) / earlyAvg) * 100)
          : 0;

        if (recentAvg > 15) {
          const growth = momentumPct > 5
            ? `+${Math.min(momentumPct, 35)}%`
            : momentumPct < -10 ? 'Declining' : 'Stable';
          console.log('[GOOGLE_TRENDS] momentum inferred:', growth, `(early ${earlyAvg.toFixed(1)} → recent ${recentAvg.toFixed(1)})`);
          signals.push({
            topic: query,
            growth,
            relevance: 62,
            source: 'Google Trends',
          });
        }
      } else {
        // Last resort: averages
        const averages: any[] = data?.interest_over_time?.averages ?? [];
        for (const a of averages.slice(0, 2)) {
          const q = a?.query ?? '';
          const val = a?.value ?? 0;
          if (!q || val < 10) continue;
          signals.push({ topic: q, growth: `${val}/100 interest`, relevance: 58, source: 'Google Trends' });
        }
      }
    }

    return signals;
  } catch (e: any) {
    clearTimeout(timer);
    console.log('[GOOGLE_TRENDS] fallback for "', query, '" —', e?.message ?? e);
    return [];
  }
}

function formatGrowth(rawVal: any): string {
  if (!rawVal) return 'Rising';
  if (String(rawVal).toLowerCase() === 'breakout') return 'Breakout';
  if (typeof rawVal === 'number') return `+${rawVal}%`;
  return String(rawVal);
}
