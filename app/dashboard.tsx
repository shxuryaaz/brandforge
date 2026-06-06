import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useBrand } from '@/store/useBrand';
import { TrendCard } from '@/components/TrendCard';
import { Card } from '@/components/ui/Card';
import { generateLocalTrends } from '@/constants/mock';

export default function DashboardScreen() {
  const { brand, trends: contextTrends } = useBrand();
  const router = useRouter();
  const headerY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }).start();
  }, []);

  const trends = contextTrends ?? (brand ? generateLocalTrends(brand) : []);
  const topTrend = trends[0];
  const aiMode = contextTrends ? 'AI' : 'MOCK';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            transform: [{ translateY: headerY }],
          }}
        >
          <View>
            <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Campaign War Room
            </Text>
            <Text style={{ color: Colors.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 2 }}>
              Brand<Text style={{ color: Colors.yellow }}>Forge</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: Colors.card,
              borderRadius: 99,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: Colors.border,
            }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success }} />
              <Text style={{ color: Colors.sub, fontSize: 11, fontWeight: '500' }}>Live</Text>
            </View>
          </View>
        </Animated.View>

        {/* Brand Card */}
        <Card style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>
                {brand?.companyName ?? 'Your Brand'}
              </Text>
              <Text style={{ color: Colors.sub, fontSize: 13, lineHeight: 20 }}>
                {brand?.goal}{brand?.focus ? ` · ${brand.focus}` : ''}
              </Text>
              {brand?.tone?.length ? (
                <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 6 }}>
                  {brand.tone.slice(0, 3).join('  ·  ')}
                </Text>
              ) : null}
            </View>
            <View style={{
              backgroundColor: Colors.success + '15',
              borderRadius: 99,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: Colors.success + '30',
            }}>
              <Text style={{ color: Colors.success, fontSize: 11, fontWeight: '600' }}>
                Ready
              </Text>
            </View>
          </View>
        </Card>

        {/* Top Opportunity */}
        <View
          style={{
            backgroundColor: Colors.card,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 20,
            marginBottom: 28,
          }}
        >
          <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Recommended Opportunity
          </Text>
          <Text style={{ color: Colors.white, fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: 6 }}>
            {topTrend?.title ?? 'Top trend'}
          </Text>
          <Text style={{ color: Colors.sub, fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
            {topTrend?.audienceOverlap ?? 'High'} audience overlap · Peak in {topTrend?.peakIn ?? '2 hrs'} · {topTrend?.score ?? 85}% match
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/trend/${topTrend?.id ?? ''}`)}
            disabled={!topTrend}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.yellow,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.black, fontSize: 14, fontWeight: '700' }}>
              Generate Campaign
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trending Opportunities */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 }}>
              Trending Now
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 13 }}>
              {trends.length} signals
            </Text>
          </View>

          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
