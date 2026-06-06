# BrandForge

AI-powered social media campaign generator. Drop in your brand, get real-time trend intelligence, and ship a full campaign in under 90 seconds.

## What it does

- Analyzes your brand voice and keywords using GPT-4o
- Fetches live trend signals from Google Trends, YouTube, and Reddit
- Synthesizes the top opportunities ranked by brand relevance
- Generates a full campaign: caption, hashtags, platform, post time, and AI creative image
- One-tap publish flow across Instagram, X, and LinkedIn

## Tech Stack

- React Native + Expo SDK 54
- Expo Router v6
- NativeWind v4
- OpenAI gpt-image-1 (campaign creative generation)
- OpenRouter (GPT-4o-mini for text generation)
- Google Trends via SerpAPI
- YouTube Data API v3
- Reddit search API

## Getting Started

```bash
npm install
```

Create a `.env` file in the root:

```
EXPO_PUBLIC_OPENAI_API_KEY=your_key
EXPO_PUBLIC_OPENROUTER_API_KEY=your_key
EXPO_PUBLIC_YOUTUBE_API_KEY=your_key
EXPO_PUBLIC_SERP_API_KEY=your_key
```

Then run:

```bash
npx expo start
```

## Build

```bash
eas build -p android --profile production
```

Outputs an installable APK via EAS cloud build.
