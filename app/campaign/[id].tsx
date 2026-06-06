import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useBrand } from '@/store/useBrand';
import { generateLocalTrends, generateLocalCampaign } from '@/constants/mock';
import { Card } from '@/components/ui/Card';
import { AIStep } from '@/components/AIStep';
import { Button } from '@/components/ui/Button';
import { chatCompletion } from '@/lib/openrouter';
import { campaignGenerationPrompt } from '@/lib/prompts';
import { generateCampaignCreative } from '@/lib/imageGeneration';

type StepStatus = 'pending' | 'active' | 'done';

const GEN_STEPS = [
  'Analyzing trend data',
  'Retrieving brand voice',
  'Crafting campaign angle',
  'Writing caption + hashtags',
  'Directing creative brief',
];

type GeneratedCampaign = {
  caption: string;
  hashtags: string[];
  creativeDirection: string;
  platform: string;
  postTime: string;
};

export default function CampaignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { brand, setCampaign, trends: contextTrends } = useBrand();
  const allTrends = contextTrends ?? (brand ? generateLocalTrends(brand) : []);
  const trend = allTrends.find((t) => t.id === id) ?? allTrends[0];

  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(GEN_STEPS.map(() => 'pending'));
  const [generating, setGenerating] = useState(true);
  const [campaign, setLocalCampaign] = useState<GeneratedCampaign | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editing, setEditing] = useState(false);
  const [aiMode, setAiMode] = useState<'AI' | 'MOCK'>('MOCK');

  // Campaign creative image state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const resultsY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    setGenerating(true);
    setLocalCampaign(null);
    setImageUrl(null);
    setImageError(false);
    setImageLoading(false);

    const freshStatuses: StepStatus[] = GEN_STEPS.map(() => 'pending');
    setStepStatuses(freshStatuses);

    for (let i = 0; i < GEN_STEPS.length; i++) {
      setStepStatuses((prev) => prev.map((_s, idx) => (idx === i ? 'active' : idx < i ? 'done' : 'pending')));
      await delay(600 + Math.random() * 500);
    }
    setStepStatuses(GEN_STEPS.map(() => 'done'));

    let result: GeneratedCampaign = generateLocalCampaign(brand, trend);
    let usedAI = false;

    try {
      if (brand && trend) {
        const raw = await chatCompletion([
          { role: 'user', content: campaignGenerationPrompt(brand, trend) },
        ]);
        const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
        result = json;
        usedAI = true;
        console.log('[CAMPAIGN] real AI result used');
      }
    } catch (e: any) {
      console.log('[CAMPAIGN] using local fallback — reason:', e?.message ?? e);
    }

    setAiMode(usedAI ? 'AI' : 'MOCK');
    setLocalCampaign(result);
    setEditCaption(result.caption);
    setGenerating(false);

    resultsY.setValue(20);
    Animated.timing(resultsY, { toValue: 0, duration: 500, useNativeDriver: true }).start();

    // Kick off campaign creative generation after text is ready (non-blocking)
    if (brand && trend) {
      setImageLoading(true);
      generateCampaignCreative({
        brandName: brand.companyName,
        trendTitle: trend.title,
        campaignAngle: trend.suggestedAngle ?? '',
        creativeDirection: result.creativeDirection,
        brandTone: brand.tone,
        focusArea: brand.focus,
      })
        .then(({ imageUrl: creativeUrl }) => setImageUrl(creativeUrl))
        .catch(() => {
          setImageLoading(false);
          setImageError(true);
        });
    }
  }

  function handleRegenerateImage() {
    if (!brand || !campaign) return;
    setImageError(false);
    setImageLoading(true);
    setImageUrl(null);
    generateCampaignCreative({
      brandName: brand.companyName,
      trendTitle: trend.title,
      campaignAngle: trend.suggestedAngle ?? '',
      creativeDirection: campaign.creativeDirection,
      brandTone: brand.tone,
      focusArea: brand.focus,
    })
      .then(({ imageUrl: creativeUrl }) => setImageUrl(creativeUrl))
      .catch(() => {
        setImageLoading(false);
        setImageError(true);
      });
  }

  function handleImageLoad() {
    setImageLoading(false);
    console.log('[IMAGE] render mounted — uri:', imageUrl?.slice(0, 80));
    console.log('[IMAGE] image render success');
  }

  function handleImageError() {
    setImageLoading(false);
    setImageError(true);
    console.log('[IMAGE] fallback triggered');
  }

  function handleApprove() {
    if (!campaign) return;
    setCampaign({
      trendId: trend.id,
      caption: editCaption,
      hashtags: campaign.hashtags,
      creativeDirection: campaign.creativeDirection,
      platform: campaign.platform,
      postTime: campaign.postTime,
      imageUrl: imageUrl ?? undefined,
    });
    router.push('/approve');
  }

  function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: Colors.sub, fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>

        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: Colors.sub, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
              Campaign Generation
            </Text>
            {!generating && (
              <View style={{
                backgroundColor: aiMode === 'AI' ? Colors.success + '20' : Colors.card,
                borderRadius: 99,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: aiMode === 'AI' ? Colors.success + '40' : Colors.border,
              }}>
                <Text style={{ color: aiMode === 'AI' ? Colors.success : Colors.sub, fontSize: 11, fontWeight: '600' }}>
                  {aiMode === 'AI' ? 'Generated Insight' : 'Demo'}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ color: Colors.white, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 }}>
            {trend?.emoji} {trend?.title}
          </Text>
          <Text style={{ color: Colors.yellow, fontSize: 14, fontWeight: '600', marginTop: 4 }}>
            Angle: {trend?.suggestedAngle}
          </Text>
        </View>

        {/* Generation steps */}
        {generating && (
          <Card style={{ marginBottom: 28 }}>
            <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
              Generating
            </Text>
            {GEN_STEPS.map((label, i) => (
              <AIStep key={label} label={label} status={stepStatuses[i]} />
            ))}
          </Card>
        )}

        {/* Results */}
        {!generating && campaign && (
          <Animated.View style={{ transform: [{ translateY: resultsY }] }}>
            {/* Platform + Time row */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14 }}>
                <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Platform</Text>
                <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '700' }}>{campaign.platform}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14 }}>
                <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Post Time</Text>
                <Text style={{ color: Colors.yellow, fontSize: 15, fontWeight: '700' }}>{campaign.postTime}</Text>
              </View>
            </View>

            {/* Caption */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' }}>
                  Caption
                </Text>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                  <Text style={{ color: Colors.yellow, fontSize: 13, fontWeight: '600' }}>
                    {editing ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>
              {editing ? (
                <TextInput
                  value={editCaption}
                  onChangeText={setEditCaption}
                  multiline
                  style={{
                    backgroundColor: Colors.card,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: Colors.yellow + '35',
                    padding: 16,
                    color: Colors.white,
                    fontSize: 15,
                    lineHeight: 22,
                  }}
                />
              ) : (
                <Card>
                  <Text style={{ color: Colors.white, fontSize: 16, lineHeight: 24, fontWeight: '500' }}>
                    {editCaption}
                  </Text>
                </Card>
              )}
            </View>

            {/* Hashtags */}
            <View style={{ marginBottom: 18 }}>
              <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: '600' }}>
                Hashtags
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {campaign.hashtags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: Colors.card,
                      borderRadius: 99,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                  >
                    <Text style={{ color: Colors.yellow, fontSize: 13, fontWeight: '600' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Creative Direction */}
            <View style={{ marginBottom: 18 }}>
              <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: '600' }}>
                Creative Direction
              </Text>
              <Card>
                <Text style={{ color: Colors.sub, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  Creative Brief
                </Text>
                <Text style={{ color: Colors.white, fontSize: 14, lineHeight: 22 }}>
                  {campaign.creativeDirection}
                </Text>
              </Card>
            </View>

            {/* Campaign Creative — AI generated image */}
            <View style={{ marginBottom: 28 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' }}>
                  Campaign Creative
                </Text>
                {!imageLoading && !imageError && imageUrl && (
                  <TouchableOpacity onPress={handleRegenerateImage} activeOpacity={0.7}>
                    <Text style={{ color: Colors.yellow, fontSize: 13, fontWeight: '600' }}>↺ Regenerate</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Loading state */}
              {imageLoading && (
                <View style={{
                  backgroundColor: Colors.card,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                }}>
                  <View style={{ marginBottom: 16, alignItems: 'center' }}>
                    <AIStep label="Campaign generated" status="done" />
                    <AIStep label="Strategy finalized" status="done" />
                    <AIStep label="Creating campaign creative" status="active" />
                  </View>
                  <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 8 }}>
                    Powered by AI · FLUX model
                  </Text>
                </View>
              )}

              {/* Generated image — expo-image */}
              {imageUrl && !imageError && (
                <View style={{
                  marginTop: 12,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}>
                  <Image
                    source={imageUrl}
                    style={{ width: '100%', height: 320, borderRadius: 24 }}
                    contentFit="cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                      AI CAMPAIGN CREATIVE
                    </Text>
                    <Text style={{ color: Colors.sub, fontSize: 11 }}>gpt-image-1 · {campaign.platform}</Text>
                  </View>
                </View>
              )}

              {/* Error fallback */}
              {imageError && (
                <View style={{
                  backgroundColor: Colors.card,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 32,
                  alignItems: 'center',
                }}>
                  <Text style={{ color: Colors.muted, fontSize: 14, marginBottom: 16 }}>
                    Creative preview unavailable
                  </Text>
                  <TouchableOpacity
                    onPress={handleRegenerateImage}
                    activeOpacity={0.7}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                  >
                    <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Action row */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={generate}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  borderRadius: 20,
                  paddingVertical: 18,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '600' }}>↺ Regen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApprove}
                activeOpacity={0.85}
                style={{
                  flex: 2,
                  borderRadius: 20,
                  paddingVertical: 18,
                  backgroundColor: Colors.yellow,
                  alignItems: 'center',
                  shadowColor: Colors.yellow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                }}
              >
                <Text style={{ color: Colors.black, fontSize: 15, fontWeight: '800' }}>Approve →</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
