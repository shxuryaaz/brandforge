import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Colors } from '@/constants/colors';

type Status = 'pending' | 'active' | 'done';

type Props = {
  label: string;
  status: Status;
};

export function AIStep({ label, status }: Props) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(status === 'done' ? 1 : 0.3);
    }
  }, [status]);

  const color =
    status === 'done' ? Colors.success : status === 'active' ? Colors.yellow : Colors.muted;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
      <Animated.View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          marginRight: 12,
          opacity: pulse,
        }}
      />
      <Text
        style={{
          color: status === 'pending' ? Colors.muted : status === 'done' ? Colors.sub : Colors.white,
          fontSize: 14,
          fontWeight: status === 'active' ? '500' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
