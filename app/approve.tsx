import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useBrand } from '@/store/useBrand';
import { Card } from '@/components/ui/Card';
import { generateLocalTrends } from '@/constants/mock';

const PLATFORMS = [
  { name: 'Instagram', icon: '📸', connected: true },
  { name: 'X (Twitter)', icon: '𝕏', connected: true },
  { name: 'LinkedIn', icon: '💼', connected: true },
  { name: 'YouTube', icon: '▶', connected: false },
];

type Phase = 'review' | 'publishing' | 'success';

export default function ApproveScreen() {
  const router = useRouter();
  const { campaign, brand, trends: contextTrends } = useBrand();
  const [phase, setPhase] = useState<Phase>('review');
  const [publishStep, setPublishStep] = useState(0);

  const successScale = useRef(new Animated.Value(0.8)).current;
  const _glowBase = useRef(new Animated.Value(0));
  const glowOpacity = _glowBase.current;
  const glowOpacityDimmed = useRef(
    _glowBase.current.interpolate({ inputRange: [0, 1], outputRange: [0, 0.07] })
  ).current;

  const allTrends = contextTrends ?? (brand ? generateLocalTrends(brand) : []);
  const trend = allTrends.find((t) => t.id === campaign?.trendId) ?? allTrends[0];

  async function handlePublish() {
    setPhase('publishing');
    const connectedPlatforms = PLATFORMS.filter((p) => p.connected);
    for (let i = 0; i < connectedPlatforms.length; i++) {
      await delay(600);
      setPublishStep(i + 1);
    }
    await delay(400);
    setPhase('success');
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }

  function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  if (phase === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          {/* Glow */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: Colors.success,
              opacity: glowOpacityDimmed,
            }}
          />

          <Animated.View
            style={{ alignItems: 'center', transform: [{ scale: successScale }] }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: Colors.success + '20',
                borderWidth: 2,
                borderColor: Colors.success + '40',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
              }}
            >
              <Text style={{ fontSize: 38 }}>✓</Text>
            </View>

            <Text style={{ color: Colors.white, fontSize: 32, fontWeight: '900', letterSpacing: -0.8, marginBottom: 10, textAlign: 'center' }}>
              Campaign{'\n'}Published
            </Text>

            <Text style={{ color: Colors.sub, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 21 }}>
              Live on Instagram, X (Twitter) and LinkedIn
            </Text>

            <View
              style={{
                backgroundColor: Colors.yellowDim,
                borderRadius: 99,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: Colors.yellow + '30',
                marginBottom: 40,
              }}
            >
              <Text style={{ color: Colors.yellow, fontSize: 14, fontWeight: '700' }}>
                Trend → Campaign in under 90 seconds
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/dashboard')}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.yellow,
                borderRadius: 20,
                paddingVertical: 18,
                paddingHorizontal: 40,
                shadowColor: Colors.yellow,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.18,
                shadowRadius: 14,
              }}
            >
              <Text style={{ color: Colors.black, fontSize: 16, fontWeight: '800' }}>Back to War Room</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Back */}
        {phase === 'review' && (
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
            <Text style={{ color: Colors.sub, fontSize: 14 }}>← Back</Text>
          </TouchableOpacity>
        )}

        <View style={{ marginBottom: 28 }}>
          <Text style={{ color: Colors.sub, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Final Review
          </Text>
          <Text style={{ color: Colors.white, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 }}>
            Ready to{' '}
            <Text style={{ color: Colors.yellow }}>publish</Text>?
          </Text>
        </View>

        {/* Campaign creative image (if generated) */}
        {campaign?.imageUrl && (
          <View style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: Colors.border,
            marginBottom: 16,
          }}>
            <Image
              source={campaign.imageUrl}
              style={{ width: '100%', height: 320, borderRadius: 24 }}
              contentFit="cover"
            />
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}>
              <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                AI CAMPAIGN CREATIVE
              </Text>
            </View>
          </View>
        )}

        {/* Campaign preview */}
        <Card glow="yellow" style={{ marginBottom: 20 }}>
          <Text style={{ color: Colors.sub, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
            Campaign Summary
          </Text>
          <Text style={{ color: Colors.yellow, fontSize: 13, fontWeight: '700', marginBottom: 6 }}>
            {trend.emoji} {trend.title} · {trend.suggestedAngle}
          </Text>
          <Text style={{ color: Colors.white, fontSize: 15, lineHeight: 22, marginBottom: 12 }}>
            {campaign?.caption}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {campaign?.hashtags.map((tag) => (
              <Text key={tag} style={{ color: Colors.sub, fontSize: 12 }}>{tag}</Text>
            ))}
          </View>
          <View style={{ borderTopWidth: 1, borderColor: Colors.border, marginTop: 14, paddingTop: 12, flexDirection: 'row', gap: 20 }}>
            <View>
              <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Platform</Text>
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>{campaign?.platform}</Text>
            </View>
            <View>
              <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Post Time</Text>
              <Text style={{ color: Colors.yellow, fontSize: 13, fontWeight: '600' }}>{campaign?.postTime}</Text>
            </View>
          </View>
        </Card>

        {/* Platforms */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, fontWeight: '600' }}>
            Connected Platforms
          </Text>
          {PLATFORMS.map((platform, i) => (
            <View
              key={platform.name}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: Colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: phase === 'publishing' && i < publishStep
                  ? Colors.success + '40'
                  : Colors.border,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 20 }}>{platform.icon}</Text>
                <Text style={{ color: platform.connected ? Colors.white : Colors.muted, fontSize: 15, fontWeight: '500' }}>
                  {platform.name}
                </Text>
              </View>
              {phase === 'publishing' && i < publishStep ? (
                <Text style={{ color: Colors.success, fontSize: 13, fontWeight: '700' }}>Published ✓</Text>
              ) : platform.connected ? (
                <View style={{ backgroundColor: Colors.success + '15', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.success + '25' }}>
                  <Text style={{ color: Colors.success, fontSize: 11, fontWeight: '500' }}>Connected</Text>
                </View>
              ) : (
                <Text style={{ color: Colors.muted, fontSize: 12 }}>Not connected</Text>
              )}
            </View>
          ))}
        </View>

        {/* CTA */}
        {phase === 'review' && (
          <TouchableOpacity
            onPress={handlePublish}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.yellow,
              borderRadius: 20,
              paddingVertical: 20,
              alignItems: 'center',
              shadowColor: Colors.yellow,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 14,
            }}
          >
            <Text style={{ color: Colors.black, fontSize: 17, fontWeight: '800' }}>
              Approve & Publish →
            </Text>
          </TouchableOpacity>
        )}

        {phase === 'publishing' && (
          <View style={{ alignItems: 'center', padding: 16 }}>
            <Text style={{ color: Colors.yellow, fontSize: 15, fontWeight: '600' }}>Publishing campaign...</Text>
            <Text style={{ color: Colors.sub, fontSize: 13, marginTop: 6 }}>
              {publishStep} of {PLATFORMS.filter((p) => p.connected).length} platforms done
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
