import { BrandState } from '@/store/useBrand';

const TIMEOUT_MS = 8000;

export type RedditSignal = {
  topic: string;
  discussionStrength: number;
  subreddit: string;
  source: 'Reddit';
};

export async function fetchRedditSignals(brand: BrandState): Promise<RedditSignal[]> {
  const query = brand.focus
    ? `${brand.companyName} ${brand.focus}`
    : brand.companyName;

  console.log('[REDDIT] fetch started —', query);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // old.reddit.com is more permissive with non-browser clients than www.reddit.com
    const url =
      `https://old.reddit.com/search.json` +
      `?q=${encodeURIComponent(query)}` +
      `&sort=hot` +
      `&limit=10` +
      `&t=week`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 BrandForge',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.log('[REDDIT] HTTP', res.status, '— fallback triggered');
      return [];
    }

    const data = await res.json();
    const posts: any[] = data?.data?.children ?? [];

    if (posts.length === 0) {
      console.log('[REDDIT] no posts — fallback triggered');
      return [];
    }

    const signals: RedditSignal[] = posts
      .slice(0, 8)
      .filter((c: any) => c?.data?.title)
      .map((child: any) => ({
        topic: child.data.title,
        discussionStrength: child.data.score ?? 0,
        subreddit: child.data.subreddit ?? 'unknown',
        source: 'Reddit' as const,
      }));

    console.log('[REDDIT] success —', signals.length, 'signals');
    return signals;
  } catch (e: any) {
    clearTimeout(timer);
    console.log('[REDDIT] fallback triggered —', e?.message ?? e);
    return [];
  }
}
