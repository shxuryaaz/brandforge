import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet } from 'react-native';
import { BrandProvider } from '@/store/useBrand';
import { Colors } from '@/constants/colors';
import { setOpenRouterKey } from '@/lib/openrouter';

export const unstable_settings = {
  initialRouteName: 'index',
};

setOpenRouterKey(
  process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ??
  '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'
);

// expo-keep-awake throws a non-fatal unhandled rejection in Expo Go when the
// native module can't activate. Swallow it here — it has no effect on the app.
const _g = global as any;
const _origErrorHandler = _g.ErrorUtils?.getGlobalHandler?.();
_g.ErrorUtils?.setGlobalHandler?.((error: Error, isFatal: boolean) => {
  if (!isFatal && error?.message?.includes('keep awake')) return;
  _origErrorHandler?.(error, isFatal);
});

// react-native-web requires this flag to be set before dark mode is applied
if (Platform.OS === 'web') {
  (StyleSheet as any).setFlag?.('darkMode', 'class');
}

export default function RootLayout() {
  return (
    <BrandProvider>
      <View style={{ flex: 1, backgroundColor: Colors.black }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.black },
            animation: 'fade_from_bottom',
          }}
        />
      </View>
    </BrandProvider>
  );
}
