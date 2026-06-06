import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const glowScale = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(glowScale, { toValue: 1, friction: 7, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 650, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.black }}>
      {/* Ambient glow — very subtle */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: height * 0.2,
          alignSelf: 'center',
          width: width * 0.6,
          height: width * 0.6,
          borderRadius: width * 0.3,
          backgroundColor: Colors.yellow,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      />
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.black, opacity: 0.94 }}
      />

      {/* Logo + subtitle — upper-center */}
      <Animated.View
        style={{
          position: 'absolute',
          top: height * 0.22,
          left: 0,
          right: 0,
          alignItems: 'center',
          transform: [{ translateY: logoY }],
        }}
      >
        <Image
          source={require('../assets/logo.png')}
          style={{ width: width * 0.88, height: width * 0.88, resizeMode: 'contain' }}
        />
        <Text
          style={{
            color: Colors.sub,
            fontSize: 11,
            letterSpacing: 4.5,
            textTransform: 'uppercase',
            marginTop: 8,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          Autonomous AI Social Engine
        </Text>
      </Animated.View>

      {/* CTA — pinned to bottom */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 28, paddingBottom: 56 }}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/onboarding')}
          style={{
            backgroundColor: Colors.yellow,
            borderRadius: 18,
            paddingVertical: 20,
            alignItems: 'center',
            shadowColor: Colors.yellow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.black, letterSpacing: 0.2 }}>
            Get Started →
          </Text>
        </TouchableOpacity>

        <Text style={{ color: Colors.sub, fontSize: 12, textAlign: 'center', marginTop: 16, letterSpacing: 0.3 }}>
          Trend → Campaign in under 90 seconds
        </Text>
      </View>
    </View>
  );
}
