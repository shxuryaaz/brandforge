import { documentDirectory, writeAsStringAsync, EncodingType, getInfoAsync } from 'expo-file-system/legacy';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
const TIMEOUT_MS = 60000;

export type CampaignCreativeParams = {
  brandName: string;
  trendTitle: string;
  campaignAngle: string;
  creativeDirection: string;
  brandTone: string[];
  focusArea: string;
};

export type CampaignCreativeResult = {
  imageUrl: string;
  prompt: string;
};

/**
 * Generates a campaign creative via OpenAI gpt-image-1.
 * Saves the returned base64 PNG to the device cache and returns a file:// URI
 * so Expo Go / React Native can render it without hitting base64 size limits.
 */
export async function generateCampaignCreative(
  params: CampaignCreativeParams
): Promise<CampaignCreativeResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('[IMAGE] no OpenAI API key');
  }

  const prompt = buildImagePrompt(params);
  console.log('[IMAGE] prompt generated:', prompt.slice(0, 120));
  console.log('[IMAGE] request sent');

  try {
    const imageUrl = await callOpenAI('gpt-image-1', prompt);
    console.log('[IMAGE] generation success — model: gpt-image-1');
    return { imageUrl, prompt };
  } catch (e: any) {
    const msg: string = e?.message ?? '';
    const isModelError =
      msg.includes('model') ||
      msg.includes('404') ||
      msg.includes('not found') ||
      msg.includes('not supported');

    if (!isModelError) {
      console.log('[IMAGE] fallback triggered —', msg);
      throw e;
    }

    console.log('[IMAGE] gpt-image-1 unavailable — retrying with dall-e-3');
    try {
      const imageUrl = await callOpenAI('dall-e-3', prompt);
      console.log('[IMAGE] generation success — model: dall-e-3');
      return { imageUrl, prompt };
    } catch (e2: any) {
      console.log('[IMAGE] fallback triggered —', e2?.message ?? e2);
      throw e2;
    }
  }
}

async function callOpenAI(model: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  const isGptImage1 = model === 'gpt-image-1';
  const quality = isGptImage1 ? 'high' : 'standard';

  const body: Record<string, unknown> = {
    model,
    prompt,
    n: 1,
    size: '1024x1024',
    quality,
  };
  if (!isGptImage1) {
    body.response_format = 'url';
  }

  console.log('[IMAGE] model used:', model);
  console.log('[IMAGE] quality setting:', quality);

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    clearTimeout(timer);

    console.log('[IMAGE] response received — HTTP', res.status, `(${model})`);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.log('[IMAGE] API error:', errText.slice(0, 200));
      throw new Error(`HTTP ${res.status} — ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    console.log('[IMAGE] generation latency:', Date.now() - start, 'ms');

    const item = data?.data?.[0];

    // gpt-image-1 returns b64_json — save to local file to avoid base64 render issues
    if (item?.b64_json) {
      console.log('[IMAGE] base64 size:', item.b64_json.length, 'chars');
      return await saveBase64ToFile(item.b64_json);
    }

    // dall-e-3 with response_format=url returns a hosted URL directly
    if (item?.url) {
      console.log('[IMAGE] render file uri: hosted URL');
      return item.url;
    }

    throw new Error('no image data in response');
  } catch (e: any) {
    clearTimeout(timer);
    throw e;
  }
}

async function saveBase64ToFile(base64: string): Promise<string> {
  const fileUri = `${documentDirectory}campaign-${Date.now()}.png`;

  await writeAsStringAsync(fileUri, base64, {
    encoding: EncodingType.Base64,
  });

  const info = await getInfoAsync(fileUri);
  console.log('[IMAGE] local file saved:', fileUri);
  console.log('[IMAGE_DEBUG] file exists:', info.exists, '| size:', (info as any).size ?? 'unknown');
  return fileUri;
}

function buildImagePrompt(params: CampaignCreativeParams): string {
  const { brandName, trendTitle, campaignAngle, creativeDirection, brandTone, focusArea } = params;

  const visualBrief = creativeDirection.split(/[.!]/)[0].trim();
  const tone = brandTone.slice(0, 2).join(', ') || 'premium, modern';
  const focus = focusArea || 'brand campaign';

  return (
    `Premium ${brandName} social media campaign visual. ` +
    `Theme: ${trendTitle}. Campaign angle: ${campaignAngle}. ` +
    `${visualBrief}. ` +
    `Brand tone: ${tone}. Focus: ${focus}. ` +
    `Cinematic product photography. Dark moody premium background. ` +
    `High contrast. Clean minimal composition. Professional advertising quality. ` +
    `Photorealistic. Instagram campaign ready. No text. No watermark. No logo. No clutter.`
  );
}
