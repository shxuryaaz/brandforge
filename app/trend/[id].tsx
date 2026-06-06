import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { generateLocalTrends } from '@/constants/mock';
import { useBrand } from '@/store/useBrand';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';

export default function TrendScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { brand, trends: contextTrends } = useBrand();
  const allTrends = contextTrends ?? (brand ? generateLocalTrends(brand) : []);
  const trend = allTrends.find((t) => t.id === id) ?? allTrends[0];

  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.timing(slideUp, { toValue: 0, duration: 450, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: Colors.sub, fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ translateY: slideUp }] }}>
          {/* Header */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <Text style={{ color: Colors.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.6, flex: 1, lineHeight: 34 }}>
                {trend.emoji} {trend.title}
              </Text>
              <StatusPill score={trend.score} />
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View>
                <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Search Growth</Text>
                <Text style={{ color: Colors.orange, fontSize: 15, fontWeight: '700' }}>
                  {trend.searchGrowth ?? `+${trend.spike ?? 0}%`}
                </Text>
              </View>
              <View>
                <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Peak In</Text>
                <Text style={{ color: Colors.yellow, fontSize: 15, fontWeight: '700' }}>{trend.peakIn}</Text>
              </View>
              <View>
                <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Platform</Text>
                <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '700' }}>{trend.platform}</Text>
              </View>
            </View>
            {/* Source attribution */}
            {trend.source && (
              <View style={{ marginTop: 10 }}>
                <View style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ color: Colors.muted, fontSize: 10, letterSpacing: 0.5, fontWeight: '600' }}>
                    SOURCE: {trend.source.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Search momentum chart */}
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ color: Colors.sub, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Search Momentum
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 52 }}>
              {[18, 24, 20, 30, 28, 50, 44, 100].map((h, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: 4,
                    backgroundColor: i === 7 ? Colors.yellow : Colors.border,
                  }}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: Colors.muted, fontSize: 11 }}>7-day trend · live signals</Text>
              <Text style={{ color: Colors.yellow, fontSize: 11, fontWeight: '700' }}>
                {trend.searchGrowth ?? `+${trend.spike ?? 0}%`} this week ↑
              </Text>
            </View>
          </Card>

          {/* Why it matters */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, fontWeight: '600' }}>
              Why This Matters
            </Text>
            {trend.whyItMatters.map((point, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text style={{ color: Colors.success, fontSize: 14, marginRight: 10, marginTop: 1 }}>✓</Text>
                <Text style={{ color: Colors.white, fontSize: 15, flex: 1, lineHeight: 22 }}>{point}</Text>
              </View>
            ))}
          </View>

          {/* Reasoning */}
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Signal Analysis
            </Text>
            <Text style={{ color: Colors.white, fontSize: 15, lineHeight: 23 }}>{trend.reasoning}</Text>
          </Card>

          {/* Suggested Angle */}
          <Card style={{ marginBottom: 32 }}>
            <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Suggested Angle
            </Text>
            <Text style={{ color: Colors.yellow, fontSize: 20, fontWeight: '700', letterSpacing: -0.3, lineHeight: 28 }}>
              {trend.suggestedAngle}
            </Text>
          </Card>

          <Button
            label="Generate Campaign →"
            onPress={() => router.push(`/campaign/${trend.id}`)}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
