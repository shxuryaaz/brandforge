import { BrandState } from '@/store/useBrand';
import { Trend } from '@/constants/mock';

// Inlined to avoid circular dependency with signalEngine.ts
type TrendSignals = {
  google: Array<{ topic: string; growth: string }>;
  youtube: Array<{ topic: string; freshness: string }>;
  reddit: Array<{ topic: string; discussionStrength: number; subreddit: string }>;
};

export function brandAnalysisPrompt(name: string, goal: string, focus: string): string {
  return `You are a brand strategist. Analyze "${name}" for a ${goal} campaign${focus ? `, focused on ${focus}` : ''}.

Be SPECIFIC to this exact brand. No generic words like "Quality", "Innovation", "Premium", "Aspirational" — those mean nothing.

Return JSON only, no markdown:
{
  "tone": ["word1", "word2", "word3"],
  "keywords": ["term1", "term2", "term3", "term4", "term5"],
  "positioning": "One sharp sentence that is specific to ${name} only"
}

Rules:
- tone: real brand personality (e.g. Swiggy = Playful, Conversational, Fast | Nike = Motivational, Athletic, Bold | iQOO = Aggressive, Performance-first, Gaming)
- keywords: actual brand-specific terms (e.g. for Swiggy: Late Night Delivery, Instamart, Food Cravings — NOT "Quality")
- positioning: must mention ${name} by name, must be industry-specific`;
}

export function trendGenerationPrompt(brand: BrandState): string {
  return `You are a social media trend analyst. Generate 3 trending opportunities for ${brand.companyName}.

Brand: ${brand.companyName}
Goal: ${brand.goal}
Focus: ${brand.focus || 'general'}
Tone: ${brand.tone.length ? brand.tone.join(', ') : 'not set yet'}
Keywords: ${brand.keywords.length ? brand.keywords.join(', ') : 'not set yet'}

Return ONLY a JSON array, no markdown, no explanation:
[
  {
    "id": "kebab-case-id",
    "title": "3-5 word trend name",
    "emoji": "one relevant emoji",
    "score": 85,
    "peakIn": "2 hrs",
    "platform": "Instagram Reels",
    "audienceOverlap": "High",
    "reasoning": "1-2 sentences: why ${brand.companyName} specifically should act on this NOW",
    "suggestedAngle": "4-6 word angle specific to ${brand.companyName}",
    "whyItMatters": ["specific reason 1", "specific reason 2", "specific reason 3"]
  }
]

Rules:
- Trends must be INDUSTRY-RELEVANT to ${brand.companyName} (food brand → food trends, gaming brand → gaming trends)
- score: integer 65-95
- peakIn: "1 hrs" to "12 hrs"
- platform: "Instagram Reels" | "YouTube Shorts" | "X (Twitter)" | "LinkedIn"
- audienceOverlap: "High" | "Medium-High" | "Medium"
- reasoning and suggestedAngle must mention ${brand.companyName} by name`;
}

export function trendSynthesisPrompt(brand: BrandState, signals: TrendSignals): string {
  const sourcesActive: string[] = [];
  if (signals.google.length > 0) sourcesActive.push('Google Trends');
  if (signals.youtube.length > 0) sourcesActive.push('YouTube');
  if (signals.reddit.length > 0) sourcesActive.push('Reddit');
  const sourceStr = sourcesActive.join(' + ') || 'AI Analysis';

  const googleSection = signals.google.length > 0
    ? signals.google.map(s => `• ${s.topic} — ${s.growth} growth`).join('\n')
    : 'No data available';

  const youtubeSection = signals.youtube.length > 0
    ? signals.youtube.map(s => `• "${s.topic}" (${s.freshness})`).join('\n')
    : 'No data available';

  const redditSection = signals.reddit.length > 0
    ? signals.reddit.map(s => `• r/${s.subreddit}: "${s.topic.slice(0, 90)}" (${s.discussionStrength} upvotes)`).join('\n')
    : 'No data available';

  return `You are a senior social media intelligence analyst at a top creative agency. You identify real, timely opportunities that social teams actually act on.

Brand: ${brand.companyName}
Campaign goal: ${brand.goal}
Focus: ${brand.focus || 'general'}
Brand tone: ${brand.tone.join(', ')}
Brand keywords: ${brand.keywords.join(', ')}

LIVE SIGNALS:

GOOGLE TRENDS — Rising searches right now:
${googleSection}

YOUTUBE — What creators are publishing this week:
${youtubeSection}

REDDIT — Community discussions with momentum:
${redditSection}

Based on these signals, identify the 3 strongest campaign opportunities for ${brand.companyName}.

TITLE QUALITY RULES — this is critical:
BAD (too generic, reject): "Creator Content Surge", "Brand Awareness Wave", "Digital Innovation Push"
BAD (irrelevant hallucination — NEVER do this): "Toxic Boss Comedy Wave", "Office Drama Reaction Trend"
GOOD (specific, real, industry-relevant): "AI Camera Comparison Wave", "Athlete Recovery Content Surge", "Fast Delivery Expectations Trend", "Prime Day Shopping Behavior", "Creator Shopping Recommendation Trend"
The title must be something a journalist covering ${brand.companyName}'s industry would actually write.

CRITICAL — DO NOT FORCE RELEVANCE:
- If the signals are weak or off-topic, use broader INDUSTRY trends that are genuinely relevant to ${brand.companyName}
- NEVER invent absurd or unrelated opportunities (e.g. "Toxic Boss Comedy" for a delivery brand)
- A plausible industry trend with no signal data is better than a hallucinated specific trend
- If uncertain, default to what creators in ${brand.companyName}'s space are actually making content about

Return JSON array only, no markdown:
[
  {
    "id": "kebab-case-id",
    "title": "3-5 word SPECIFIC trend — industry-relevant, not generic",
    "emoji": "single relevant emoji",
    "score": 85,
    "searchGrowth": "+18%",
    "peakIn": "3 hrs",
    "platform": "Instagram Reels",
    "audienceOverlap": "High",
    "source": "${sourceStr}",
    "reasoning": "2 sentences — cite specific signals if available, explain why ${brand.companyName} should act on this",
    "suggestedAngle": "4-6 word brand-specific angle for ${brand.companyName}",
    "whyItMatters": ["industry-grounded reason 1", "creator or community angle", "timing or urgency reason"]
  }
]

Strict rules:
- Title: MUST be relevant to ${brand.companyName}'s industry — if Amazon, think shopping/delivery/commerce; if Nike, think fitness/running/athletes
- searchGrowth: "+5%" to "+35%" ONLY — never higher
- score: 70–95
- peakIn: "1 hrs" to "8 hrs" — prefer urgency
- platform: "Instagram Reels" | "YouTube Shorts" | "X (Twitter)" | "LinkedIn"
- audienceOverlap: "High" | "Medium-High" | "Medium"
- source: use exactly "${sourceStr}"
- Prefer creator-culture and cultural momentum over corporate announcements
- Each of the 3 opportunities must be meaningfully different from each other
- When signals are weak: generate plausible industry trends, NOT random viral content`;
}

export function campaignGenerationPrompt(brand: BrandState, trend: Trend): string {
  return `You are a viral campaign strategist for ${brand.companyName}.

Brand voice: ${brand.tone.join(', ')}
Core keywords: ${brand.keywords.join(', ')}
Positioning: ${brand.positioning}
Campaign goal: ${brand.goal}
Focus area: ${brand.focus || 'brand awareness'}

Trend to react to: "${trend.title}"
Why it matters: ${trend.reasoning}
Suggested angle: ${trend.suggestedAngle}

Generate a campaign. Return JSON only, no markdown:
{
  "caption": "1-2 punchy lines with emoji, max 150 chars, written in ${brand.companyName}'s voice",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "creativeDirection": "2-3 sentence visual/reel direction for a 5-10 second vertical video",
  "platform": "${trend.platform}",
  "postTime": "Specific time suggestion (e.g. Today 6 PM, Tonight 9 PM)"
}

Rules:
- caption must sound like ${brand.companyName}, NOT generic
- hashtags must be ${brand.companyName}-relevant, NOT generic like #Innovation
- creativeDirection must reference ${brand.companyName}'s product/service specifically`;
}
