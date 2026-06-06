import { Trend } from '@/constants/mock';
import { BrandState } from '@/store/useBrand';

export function scoreLocally(trend: Trend, brand: BrandState): number {
  let score = 55;

  const trendText = [
    trend.title,
    trend.reasoning,
    trend.suggestedAngle,
    ...(trend.whyItMatters ?? []),
  ].join(' ').toLowerCase();

  // Brand name present in AI-generated content
  if (trendText.includes(brand.companyName.toLowerCase())) score += 10;

  // Keyword overlap — each keyword that appears adds weight
  const keywordHits = brand.keywords.filter(k =>
    trendText.includes(k.toLowerCase())
  ).length;
  score += Math.min(keywordHits * 7, 21);

  // Focus area alignment
  if (brand.focus && trendText.includes(brand.focus.toLowerCase())) score += 8;

  // Campaign goal alignment
  if (brand.goal && trendText.toLowerCase().includes(brand.goal.toLowerCase())) score += 5;

  // Source credibility (real sources > AI-only)
  const src = (trend.source ?? '').toLowerCase();
  if (src.includes('google trends')) score += 4;
  if (src.includes('youtube')) score += 3;
  if (src.includes('reddit')) score += 3;

  // Peak timing urgency bonus
  const peakNum = parseInt((trend.peakIn ?? '12').replace(/[^\d]/g, '')) || 12;
  if (peakNum <= 2) score += 5;
  else if (peakNum <= 5) score += 3;
  else if (peakNum <= 8) score += 1;

  // Audience overlap quality
  if (trend.audienceOverlap === 'High') score += 4;
  else if (trend.audienceOverlap === 'Medium-High') score += 2;

  // Clamp 65–97
  return Math.min(Math.max(Math.round(score), 65), 97);
}
