import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useBrand } from '@/store/useBrand';
import { AIStep } from '@/components/AIStep';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BRAND_PRESETS } from '@/constants/mock';
import { chatCompletion } from '@/lib/openrouter';
import { brandAnalysisPrompt } from '@/lib/prompts';
import { fetchAllSignals, synthesizeTrends, SignalSources } from '@/lib/signalEngine';

type StepStatus = 'pending' | 'active' | 'done';

const STEPS = [
  'Analyzing brand context',
  'Fetching Google Trends signals',
  'Scanning YouTube discussions',
  'Analyzing Reddit momentum',
  'Synthesizing opportunities',
  'Scoring brand relevance',
];

function getMockAnalysis(name: string) {
  const key = name.toLowerCase();
  if (BRAND_PRESETS[key]) return BRAND_PRESETS[key];
  return {
    tone: ['Authentic', 'Direct', 'Relatable'],
    keywords: [name, `${name} Experience`, `${name} Community`, 'Everyday Moments', 'Real People'],
    positioning: `${name} connects with people through real experiences and genuine value — no filler, no fluff.`,
  };
}

export default function AnalyzingScreen() {
  const router = useRouter();
  const { brand, setBrand, setTrends } = useBrand();
  const [steps, setSteps] = useState<StepStatus[]>(STEPS.map(() => 'pending'));
  const [done, setDone] = useState(false);
  const [aiMode, setAiMode] = useState<'AI' | 'MOCK'>('MOCK');
  const [analysis, setAnalysis] = useState<{ tone: string[]; keywords: string[]; positioning: string } | null>(null);
  const resultsY = useRef(new Animated.Value(20)).current;

  // Mark a specific step without touching others
  function mark(idx: number, status: StepStatus) {
    setSteps(prev => prev.map((s, i) => (i === idx ? status : s)));
  }

  useEffect(() => {
    runPipeline();
  }, []);

  async function runPipeline() {
    // ── Step 0: Brand analysis ──────────────────────────────────────────────
    mark(0, 'active');
    let result = getMockAnalysis(brand?.companyName ?? '');
    let usedAI = false;

    try {
      if (brand) {
        const raw = await chatCompletion([
          { role: 'user', content: brandAnalysisPrompt(brand.companyName, brand.goal, brand.focus) },
        ]);
        const json = JSON.parse(raw.replace(/```json\n?|```/g, '').trim());
        result = json;
        usedAI = true;
        console.log('[ANALYZING] brand analysis — AI');
      }
    } catch (e: any) {
      console.log('[ANALYZING] brand analysis — mock:', e?.message);
    }
    mark(0, 'done');

    const updatedBrand = brand
      ? { ...brand, tone: result.tone, keywords: result.keywords, positioning: result.positioning }
      : brand;

    setAnalysis(result);
    if (updatedBrand) setBrand(updatedBrand);

    if (!updatedBrand) {
      setSteps(STEPS.map(() => 'done'));
      setDone(true);
      return;
    }

    // ── Steps 1–3: Parallel signal fetch (all activate simultaneously) ──────
    mark(1, 'active');
    mark(2, 'active');
    mark(3, 'active');

    const signals: SignalSources = await fetchAllSignals(updatedBrand);

    const gotSignals =
      signals.google.length + signals.youtube.length + signals.reddit.length > 0;
    if (gotSignals) usedAI = true;

    mark(1, 'done');
    mark(2, 'done');
    mark(3, 'done');

    // ── Step 4: Signal synthesis via OpenRouter ─────────────────────────────
    mark(4, 'active');
    const trends = await synthesizeTrends(updatedBrand, signals);
    mark(4, 'done');

    // ── Step 5: Local scoring (runs inside synthesizeTrends, show visually) ─
    mark(5, 'active');
    await new Promise(r => setTimeout(r, 200));
    mark(5, 'done');

    setTrends(trends);
    setAiMode(usedAI ? 'AI' : 'MOCK');
    setDone(true);
    Animated.timing(resultsY, { toValue: 0, duration: 500, useNativeDriver: true }).start();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 16, marginBottom: 40 }}>
          <Text style={{ color: Colors.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.8 }}>
            Analyzing{'\n'}
            <Text style={{ color: Colors.yellow }}>{brand?.companyName}</Text>
          </Text>
        </View>

        {/* Pipeline steps */}
        <Card style={{ marginBottom: 28 }}>
          {STEPS.map((label, i) => (
            <AIStep key={label} label={label} status={steps[i]} />
          ))}
        </Card>

        {/* Results */}
        {done && analysis && (
          <Animated.View style={{ transform: [{ translateY: resultsY }] }}>
            {/* AI/MOCK badge */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 }}>
              <View style={{
                backgroundColor: aiMode === 'AI' ? Colors.success + '20' : Colors.card,
                borderRadius: 99,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: aiMode === 'AI' ? Colors.success + '40' : Colors.border,
              }}>
                <Text style={{ color: aiMode === 'AI' ? Colors.success : Colors.sub, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                  {aiMode === 'AI' ? 'Generated Insight' : 'Demo Mode'}
                </Text>
              </View>
            </View>

            {/* Brand Tone */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, fontWeight: '600' }}>
                Brand Tone
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {analysis.tone.map((t) => (
                  <View key={t} style={{ backgroundColor: Colors.card, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border }}>
                    <Text style={{ color: Colors.yellow, fontSize: 13, fontWeight: '600' }}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Brand Keywords */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, fontWeight: '600' }}>
                Brand Keywords
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {analysis.keywords.map((k) => (
                  <View key={k} style={{ backgroundColor: Colors.card, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border }}>
                    <Text style={{ color: Colors.white, fontSize: 13 }}>{k}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Positioning */}
            <Card style={{ marginBottom: 32 }}>
              <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                Positioning
              </Text>
              <Text style={{ color: Colors.white, fontSize: 15, lineHeight: 23, fontWeight: '400' }}>
                {analysis.positioning}
              </Text>
            </Card>

            <Button label="Continue to Dashboard →" onPress={() => router.push('/dashboard')} />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
