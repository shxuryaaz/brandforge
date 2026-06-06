import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  glow?: 'yellow' | 'none';
};

export function Card({ children, style, glow = 'none' }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.card,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: glow === 'yellow' ? `${Colors.yellow}22` : Colors.border,
          padding: 20,
          shadowColor: glow === 'yellow' ? Colors.yellow : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: glow === 'yellow' ? 0.07 : 0.15,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
