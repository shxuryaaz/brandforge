import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Trend } from '@/constants/mock';
import { Colors } from '@/constants/colors';
import { StatusPill } from '@/components/ui/StatusPill';

type Props = { trend: Trend };

export function TrendCard({ trend }: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/trend/${trend.id}`)}
      style={{
        backgroundColor: Colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 20,
        marginBottom: 12,
      }}
    >
      {/* Top row: title + score */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 4 }}>
            {trend.emoji} {trend.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: Colors.sub, fontSize: 13 }}>
              Peak <Text style={{ color: Colors.yellow, fontWeight: '600' }}>{trend.peakIn}</Text>
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 13 }}>·</Text>
            <Text style={{ color: Colors.sub, fontSize: 13 }}>
              {trend.searchGrowth ?? `+${trend.spike}%`}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <StatusPill score={trend.score} />
          <Text style={{ color: Colors.muted, fontSize: 11 }}>
            {trend.audienceOverlap} match
          </Text>
        </View>
      </View>

      {/* Reasoning preview */}
      <Text style={{ color: Colors.muted, fontSize: 13, lineHeight: 19 }} numberOfLines={2}>
        {trend.reasoning}
      </Text>

      {/* Footer: source + platform */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <Text style={{ color: Colors.muted, fontSize: 11 }}>
          {trend.source ? trend.source : trend.platform}
        </Text>
        <Text style={{ color: Colors.sub, fontSize: 12, fontWeight: '500' }}>
          {trend.platform} ›
        </Text>
      </View>
    </TouchableOpacity>
  );
}
