<p align="center">
  <img src="assets/logo.png" alt="BrandForge" width="180" />
</p>

# BrandForge

> Turn trending moments into published campaigns in under 90 seconds.

BrandForge is an AI-powered mobile app that watches what's trending across the internet, matches those trends to your brand, and generates a complete social media campaign — caption, hashtags, creative image, platform targeting, and optimal post time — ready to publish instantly.

Built for speed. Built for the algorithm.

---

## The Problem

Marketing teams spend hours manually monitoring trends, briefing creatives, and writing copy. By the time a campaign is ready, the moment has passed.

BrandForge collapses that entire workflow into a single tap.

---

## How It Works

```
Brand Setup → Live Trend Analysis → Campaign Generation → AI Creative → Publish
     10s              15s                  10s               45s          5s
```

**1. Brand Setup**
Enter your company name, campaign goal, and focus area. BrandForge analyzes your brand voice and builds a keyword profile using GPT-4o.

**2. Live Trend Intelligence**
Simultaneously queries three real-time data sources:
- **Google Trends** — search momentum and breakout topics
- **YouTube** — high-velocity video signals filtered for brand relevance
- **Reddit** — community momentum and early cultural signals

Trends are scored and ranked by brand match, audience overlap, and timing window.

**3. Campaign Generation**
GPT-4o-mini writes a full campaign brief: caption, hashtags, creative direction, platform recommendation, and optimal post time — tuned to your brand voice.

**4. AI Campaign Creative**
OpenAI gpt-image-1 generates a photorealistic campaign image from the brief. Cinematic. Platform-ready. No watermarks.

**5. One-Tap Publish**
Review, edit the caption if needed, and publish across Instagram, X (Twitter), and LinkedIn simultaneously.

---

## Screenshots

| Trend Intelligence | Campaign Generation | AI Creative |
|---|---|---|
| Live signals ranked by relevance | Full brief in seconds | gpt-image-1 generated visual |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router v6 |
| Styling | NativeWind v4 + custom design system |
| AI Text | OpenRouter → GPT-4o-mini |
| AI Image | OpenAI gpt-image-1 |
| Trend Data | Google Trends (SerpAPI), YouTube Data API v3, Reddit API |
| Storage | Expo FileSystem (local campaign assets) |
| Build | EAS Build |

---

## Getting Started

**Prerequisites:** Node.js 18+, Expo CLI, an Android device or emulator

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Fill in your `.env`:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-...
EXPO_PUBLIC_YOUTUBE_API_KEY=AIza...
EXPO_PUBLIC_SERP_API_KEY=...
```

```bash
# Start development server
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` to open in Android emulator.

---

## Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build production APK
eas build -p android --profile production
```

EAS builds on the cloud — no local Android SDK required. Download link arrives in ~10 minutes.

---

## Project Structure

```
brandforge/
├── app/                    # Expo Router screens
│   ├── index.tsx           # Entry / splash
│   ├── onboarding.tsx      # Brand setup
│   ├── analyzing.tsx       # Live signal fetch + analysis
│   ├── dashboard.tsx       # Trend intelligence feed
│   ├── trend/[id].tsx      # Trend deep-dive
│   ├── campaign/[id].tsx   # Campaign generation + AI creative
│   └── approve.tsx         # Review + publish
├── lib/
│   ├── signalEngine.ts     # Parallel trend fetching + synthesis
│   ├── trendSignals/       # Google, YouTube, Reddit connectors
│   ├── imageGeneration.ts  # OpenAI gpt-image-1 pipeline
│   ├── openrouter.ts       # LLM client
│   ├── prompts.ts          # Prompt templates
│   └── queryBuilder.ts     # Brand-aware query strategy
├── components/             # UI component library
├── constants/              # Colors, mock data
└── store/                  # Global brand + campaign state
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_OPENAI_API_KEY` | Campaign creative image generation |
| `EXPO_PUBLIC_OPENROUTER_API_KEY` | Brand analysis + campaign text generation |
| `EXPO_PUBLIC_YOUTUBE_API_KEY` | YouTube trend signal fetching |
| `EXPO_PUBLIC_SERP_API_KEY` | Google Trends data via SerpAPI |

---

## Built With

- [Expo](https://expo.dev)
- [OpenAI](https://platform.openai.com)
- [OpenRouter](https://openrouter.ai)
- [SerpAPI](https://serpapi.com)
- [YouTube Data API](https://developers.google.com/youtube/v3)
