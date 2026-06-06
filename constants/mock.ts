import { BrandState } from '@/store/useBrand';

export type Trend = {
  id: string;
  title: string;
  emoji: string;
  score: number;
  peakIn: string;
  prevMentions: number;
  currMentions: number;
  spike: number;
  platform: string;
  tags: string[];
  audienceOverlap: string;
  genZRelevance: string;
  reasoning: string;
  suggestedAngle: string;
  whyItMatters: string[];
  source?: string;       // "Google Trends + YouTube" | "Reddit" | "AI Analysis"
  searchGrowth?: string; // "+18% search growth" — replaces spike % in display
};

export type BrandProfile = {
  name: string;
  tone: string[];
  keywords: string[];
  positioning: string;
  primaryColor: string;
  handle: string;
};

// Only used as AI fallback for iQOO specifically — never leaked to other brands
export const MOCK_TRENDS: Trend[] = [
  {
    id: 'bgmi-championship',
    title: 'BGMI Championship',
    emoji: '🔥',
    score: 92,
    peakIn: '2 hrs',
    prevMentions: 1200,
    currMentions: 4800,
    spike: 300,
    platform: 'Instagram Reels',
    tags: ['#BGMI', '#GamingPhone', '#MonsterInside', '#iQOO'],
    audienceOverlap: 'High',
    genZRelevance: 'Strong',
    reasoning: 'BGMI Championship finals trending across Twitter, YouTube, and Reddit. Peak engagement window opens in ~2 hours.',
    suggestedAngle: 'Performance Dominance',
    whyItMatters: [
      'Gaming audience overlap with iQOO core demographic',
      'Strong Gen-Z relevance — primary buying segment',
      'Matches iQOO "Monster Inside" performance positioning',
    ],
  },
  {
    id: 'ai-phone-battle',
    title: 'AI Phone Battle',
    emoji: '⚡',
    score: 81,
    peakIn: '5 hrs',
    prevMentions: 3400,
    currMentions: 8900,
    spike: 161,
    platform: 'YouTube Shorts',
    tags: ['#AIPhone', '#FutureOfGaming', '#SmartPerformance', '#iQOO'],
    audienceOverlap: 'Medium-High',
    genZRelevance: 'High',
    reasoning: 'Tech reviewers sparking debate on AI-enhanced mobile chipsets. Perfect moment to position iQOO as the performance-first AI phone.',
    suggestedAngle: 'AI-Powered Beast',
    whyItMatters: [
      'Tech enthusiasts actively comparing AI chip performance',
      'First-mover advantage window still open',
      'Direct relevance to iQOO 13 chip story',
    ],
  },
  {
    id: 'gaming-setup-tour',
    title: 'Gaming Setup Tour',
    emoji: '🎮',
    score: 74,
    peakIn: '8 hrs',
    prevMentions: 6200,
    currMentions: 11400,
    spike: 83,
    platform: 'Instagram Reels',
    tags: ['#GamingSetup', '#SetupTour', '#GamingLife', '#iQOO'],
    audienceOverlap: 'Medium',
    genZRelevance: 'High',
    reasoning: 'Weekend gaming setup content peaking across creators. Natural fit for a "phone as centerpiece" narrative.',
    suggestedAngle: 'The Missing Piece',
    whyItMatters: [
      'Aspirational lifestyle content — high share rate',
      'Creator-friendly format for UGC campaigns',
      'Softer sell with high brand recall potential',
    ],
  },
];

export const BRAND_PRESETS: Record<string, BrandProfile> = {
  iqoo: {
    name: 'iQOO',
    tone: ['Bold', 'Performance-first', 'Gaming-focused'],
    keywords: ['Monster Inside', 'Gaming', 'Speed', '2K Display', 'Flagship Killer'],
    positioning: 'The performance flagship for power users and gamers who refuse to compromise.',
    primaryColor: '#FFD600',
    handle: '@iQOO_India',
  },
  zomato: {
    name: 'Zomato',
    tone: ['Playful', 'Witty', 'Relatable'],
    keywords: ['Food Delivery', 'Late Night Cravings', 'Binge', 'Never Hungry', 'Instamart'],
    positioning: "India's most loved food delivery brand — fast, fun, and always there when hunger strikes.",
    primaryColor: '#E23744',
    handle: '@zomato',
  },
  swiggy: {
    name: 'Swiggy',
    tone: ['Playful', 'Fast', 'Conversational'],
    keywords: ['Delivery', 'Cravings', 'Late Night', 'Instamart', 'Convenience'],
    positioning: "Fastest way to satisfy any craving — Swiggy delivers before your mood changes.",
    primaryColor: '#FC8019',
    handle: '@Swiggy',
  },
  nike: {
    name: 'Nike',
    tone: ['Motivational', 'Competitive', 'Athletic'],
    keywords: ['Just Do It', 'Athletes', 'Performance', 'Culture', 'Winners'],
    positioning: 'Empowering every athlete in the world — if you have a body, you are an athlete.',
    primaryColor: '#FFFFFF',
    handle: '@Nike',
  },
};

export const CAMPAIGN_GOALS = [
  'Product Launch',
  'Engagement',
  'Trendjacking',
  'Brand Awareness',
  'Campaign Push',
] as const;

export type CampaignGoal = typeof CAMPAIGN_GOALS[number];

// ─── Brand-aware local trend generator ──────────────────────────────────────
// Used as fallback when AI is unavailable. Never leaks iQOO/BGMI to other brands.

function makeTrend(
  id: string,
  title: string,
  emoji: string,
  score: number,
  peakIn: string,
  platform: string,
  audienceOverlap: string,
  reasoning: string,
  suggestedAngle: string,
  whyItMatters: string[],
  brandName: string,
): Trend {
  const base = 800 + score * 25;
  const spike = Math.floor(60 + score * 2);
  const slug = brandName.replace(/\s+/g, '');
  // Believable search growth: maps score 65→+5%, 85→+18%, 95→+26%
  const pct = Math.round(5 + ((score - 65) / 32) * 21);
  return {
    id,
    title,
    emoji,
    score,
    searchGrowth: `+${Math.min(pct, 28)}%`,
    peakIn,
    prevMentions: base,
    currMentions: Math.floor(base * (1 + spike / 100)),
    spike,
    platform,
    tags: [`#${slug}`, `#${title.replace(/\s+/g, '')}`],
    audienceOverlap,
    genZRelevance: score >= 85 ? 'Strong' : score >= 75 ? 'High' : 'Medium',
    reasoning,
    suggestedAngle,
    whyItMatters,
    source: 'AI Analysis',
  };
}

function detectIndustry(brand: BrandState): string {
  const text = `${brand.companyName} ${brand.focus} ${brand.keywords.join(' ')}`.toLowerCase();
  if (/food|eat|cook|delivery|restaurant|chai|swiggy|zomato|meal|snack|hunger|crav|kitchen|blinkit/.test(text)) return 'food';
  if (/game|gaming|bgmi|esport|iqoo|pubg|fps|valorant|mobile.?gam/.test(text)) return 'gaming';
  if (/sport|athlete|fitness|run|gym|workout|marathon|cricket|ipl|football|nike|adidas/.test(text)) return 'sports';
  if (/tech|phone|mobile|device|app|software|saas|startup|ai|ml/.test(text)) return 'tech';
  if (/fashion|wear|cloth|style|outfit|dress|apparel/.test(text)) return 'fashion';
  if (/finance|bank|invest|money|loan|insurance|fintech/.test(text)) return 'finance';
  return 'general';
}

export function generateLocalTrends(brand: BrandState): Trend[] {
  const name = brand.companyName;
  const industry = detectIndustry(brand);

  switch (industry) {
    case 'food':
      return [
        makeTrend('late-night-cravings', 'Late Night Cravings Wave', '🌙', 88, '2 hrs', 'Instagram Reels', 'High',
          `Late-night delivery demand spikes 3x on weekends — ${name} has a direct conversion window right now.`,
          'Be There When It Matters',
          [`High purchase intent audience`, `Relatable Gen-Z micro-moment`, `Low competition window after 11 PM`],
          name),
        makeTrend('rainy-day-comfort', 'Rainy Day Comfort Food', '🌧️', 79, '4 hrs', 'Instagram Reels', 'High',
          `Rain forecasts trending in metro cities — comfort food searches spike 220% during rains. ${name} owns this moment.`,
          'Rainy Day, Sorted',
          [`Weather-triggered impulse orders`, `Emotional resonance — comfort food is a mood`, `Shareable UGC format`],
          name),
        makeTrend('food-quality-debate', `${brand.focus || 'Food Safety'} Discussion`, '💬', 72, '6 hrs', 'X (Twitter)', 'Medium-High',
          `Consumers actively discussing ${brand.focus || 'food quality'} — ${name} can lead the narrative with transparency.`,
          'Own The Conversation',
          [`Builds long-term trust`, `Differentiator vs. competitors`, `Earned media potential`],
          name),
      ];

    case 'gaming':
      return [
        makeTrend('bgmi-championship', 'BGMI Championship', '🔥', 92, '2 hrs', 'Instagram Reels', 'High',
          `BGMI tournament trending — ${name}'s gaming audience is fully activated right now.`,
          'Performance Dominance',
          [`Direct audience match`, `Peak engagement window`, `High conversion intent`],
          name),
        makeTrend('fps-benchmark-war', 'Flagship FPS Benchmark War', '⚡', 83, '4 hrs', 'YouTube Shorts', 'High',
          `Tech reviewers comparing gaming performance across flagships — ${name} can stake a definitive claim.`,
          'Win Every Frame',
          [`Reviewer community reach`, `Trust-building credibility`, `SEO-rich content format`],
          name),
        makeTrend('gaming-setup-culture', 'Creator Gaming Setup Culture', '🎮', 74, '8 hrs', 'Instagram Reels', 'Medium-High',
          `Gaming setup tours peaking on weekends — ${name} as the centerpiece phone is a natural narrative.`,
          'The Setup Centrepiece',
          [`Aspirational lifestyle content`, `Creator collaboration opportunity`, `High save rate`],
          name),
      ];

    case 'sports':
      return [
        makeTrend('athlete-moment', 'Athlete Achievement Moment', '🏆', 87, '3 hrs', 'Instagram Reels', 'High',
          `Major sporting event creating conversation — ${name} can align with peak athletic energy.`,
          'Fuel The Champion',
          [`High emotional resonance`, `Mass audience moment`, `Shareable victory content`],
          name),
        makeTrend('fitness-creator-wave', 'Fitness Creator Content Wave', '💪', 78, '5 hrs', 'YouTube Shorts', 'High',
          `Fitness content creators at peak posting frequency — ${name} has strong audience overlap.`,
          'Train Harder With ${name}',
          [`Creator partnership potential`, `High Gen-Z relevance`, `Strong CTA conversion`],
          name),
        makeTrend('marathon-season', 'Marathon Season Push', '🏃', 71, '8 hrs', 'X (Twitter)', 'Medium',
          `City marathon registrations trending — ${name} can own the performance narrative.`,
          'Go The Distance',
          [`Community engagement angle`, `Long-format storytelling`, `Brand loyalty builder`],
          name),
      ];

    case 'tech':
      return [
        makeTrend('ai-feature-debate', 'AI Feature Debate', '🤖', 85, '3 hrs', 'X (Twitter)', 'High',
          `Tech community debating AI capabilities — ${name} can position itself as the intelligent choice.`,
          'AI, Actually Useful',
          [`Thought leadership opportunity`, `High tech media pickup`, `First-mover advantage`],
          name),
        makeTrend('product-comparison-war', 'Competitor Comparison War', '⚡', 79, '5 hrs', 'YouTube Shorts', 'Medium-High',
          `Reviewers actively benchmarking competitors — ${name} can enter the conversation with data.`,
          'The Numbers Don\'t Lie',
          [`High purchase-intent audience`, `Trust via transparency`, `SEO-driven discovery`],
          name),
        makeTrend('user-review-surge', 'User Review Surge', '⭐', 72, '7 hrs', 'Instagram Reels', 'Medium',
          `Real user testimonials trending across tech communities — ${name} has authenticity to leverage.`,
          'Real Users, Real Results',
          [`High trust signals`, `UGC amplification`, `Social proof flywheel`],
          name),
      ];

    default:
      return [
        makeTrend('brand-moment-1', `${name} Cultural Moment`, '✨', 82, '3 hrs', 'Instagram Reels', 'High',
          `${name}'s target audience is highly active right now — ideal window for ${brand.goal} content.`,
          `${name}'s Defining Moment`,
          [`Peak audience online time`, `${brand.goal} goal alignment`, `High organic reach potential`],
          name),
        makeTrend('brand-moment-2', `${brand.focus || brand.goal} Conversation`, '💬', 75, '5 hrs', 'X (Twitter)', 'Medium-High',
          `Conversations around ${brand.focus || brand.goal} are gaining momentum — ${name} can lead the narrative.`,
          'Lead The Conversation',
          [`Thought leadership angle`, `Community trust builder`, `Earned media opportunity`],
          name),
        makeTrend('brand-moment-3', 'Creator Collaboration Wave', '🎬', 68, '8 hrs', 'YouTube Shorts', 'Medium',
          `Creator-driven content performing strongly this week — ${name} has an authentic story to tell.`,
          'Authentic Brand Story',
          [`Creator community reach`, `High Gen-Z engagement`, `Shareable format`],
          name),
      ];
  }
}

// ─── Brand-aware campaign fallback ──────────────────────────────────────────
// Never uses hardcoded iQOO/BGMI content. Uses actual brand + trend context.

export type GeneratedCampaign = {
  caption: string;
  hashtags: string[];
  creativeDirection: string;
  platform: string;
  postTime: string;
};

export function generateLocalCampaign(brand: BrandState | null, trend: Trend): GeneratedCampaign {
  const name = brand?.companyName ?? 'Your Brand';
  const slug = name.replace(/\s+/g, '');
  const keyword = brand?.keywords?.[0] ?? brand?.goal ?? 'Campaign';
  const tone = brand?.tone?.[0] ?? 'Bold';
  const hour = new Date().getHours();
  const postTime = hour < 11 ? 'Today 12 PM' : hour < 15 ? 'Today 6 PM' : hour < 20 ? 'Tonight 9 PM' : 'Tomorrow 12 PM';

  return {
    caption: `${trend.emoji} ${name} + ${trend.title}. This is the moment. ${brand?.keywords?.[1] ? `#${brand.keywords[1].replace(/\s+/g, '')}` : ''}`,
    hashtags: [
      `#${slug}`,
      `#${trend.title.replace(/\s+/g, '')}`,
      `#${trend.suggestedAngle.replace(/\s+/g, '')}`,
      `#${keyword.replace(/\s+/g, '')}`,
      `#${brand?.goal?.replace(/\s+/g, '') ?? 'BrandForge'}`,
    ],
    creativeDirection: `Open on ${name}'s most iconic visual. Cut to raw, unfiltered ${trend.title} energy. End frame: ${trend.suggestedAngle} — ${name}. ${tone} pacing throughout. 5-8 seconds, no fluff.`,
    platform: trend.platform,
    postTime,
  };
}
