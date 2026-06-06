import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, loading, variant = 'primary', disabled, style }: Props) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: 20,
          paddingVertical: 18,
          paddingHorizontal: 28,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: isPrimary ? Colors.yellow : isOutline ? 'transparent' : 'transparent',
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline ? Colors.border : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.black : Colors.yellow} size="small" />
      ) : (
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.3,
            color: isPrimary ? Colors.black : isGhost ? Colors.sub : Colors.white,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
