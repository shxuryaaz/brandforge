import { Trend } from '@/constants/mock';

export function computeSpike(prev: number, curr: number): number {
  return Math.round(((curr - prev) / prev) * 100);
}

export function computeTrendScore(spike: number, audienceOverlap: string, genZRelevance: string): number {
  let base = Math.min(spike / 4, 60);
  if (audienceOverlap === 'High') base += 20;
  else if (audienceOverlap === 'Medium-High') base += 14;
  else base += 8;
  if (genZRelevance === 'Strong' || genZRelevance === 'High') base += 12;
  else base += 5;
  return Math.min(Math.round(base), 99);
}

export function sortTrendsByScore(trends: Trend[]): Trend[] {
  return [...trends].sort((a, b) => b.score - a.score);
}
