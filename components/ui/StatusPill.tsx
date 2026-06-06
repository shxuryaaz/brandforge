import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  score: number;
};

export function StatusPill({ score }: Props) {
  const color = score >= 85 ? Colors.yellow : score >= 70 ? Colors.orange : Colors.success;
  return (
    <View
      style={{
        backgroundColor: `${color}18`,
        borderRadius: 99,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: `${color}40`,
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{score}%</Text>
    </View>
  );
}
