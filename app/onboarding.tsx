import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useBrand } from '@/store/useBrand';
import { CAMPAIGN_GOALS, CampaignGoal } from '@/constants/mock';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setBrand } = useBrand();

  const [company, setCompany] = useState('');
  const [goal, setGoal] = useState<CampaignGoal>('Trendjacking');
  const [focus, setFocus] = useState('');

  const canProceed = company.trim().length > 0;

  function handleAnalyze() {
    if (!canProceed) return;
    setBrand({
      companyName: company.trim(),
      goal,
      focus: focus.trim(),
      tone: [],
      keywords: [],
      positioning: '',
    });
    router.push('/analyzing');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 28 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginTop: 16, marginBottom: 40 }}>
            <Text style={{ color: Colors.white, fontSize: 32, fontWeight: '800', letterSpacing: -0.8, lineHeight: 40 }}>
              Set up your brand
            </Text>
            <Text style={{ color: Colors.sub, fontSize: 15, marginTop: 10, lineHeight: 22 }}>
              BrandForge analyzes your brand and surfaces trending campaign opportunities in real time.
            </Text>
          </View>

          {/* Company Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: '600' }}>
              Company Name
            </Text>
            <TextInput
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. iQOO, Nike, Zomato"
              placeholderTextColor={Colors.muted}
              autoCapitalize="words"
              style={{
                backgroundColor: Colors.card,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: company ? Colors.yellow + '30' : Colors.border,
                paddingHorizontal: 18,
                paddingVertical: 16,
                color: Colors.white,
                fontSize: 16,
                fontWeight: '500',
              }}
            />
          </View>

          {/* Campaign Goal */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: '600' }}>
              Campaign Goal
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CAMPAIGN_GOALS.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGoal(g)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 99,
                    borderWidth: 1,
                    borderColor: goal === g ? Colors.yellow : Colors.border,
                    backgroundColor: goal === g ? Colors.yellowDim : Colors.card,
                  }}
                >
                  <Text style={{ color: goal === g ? Colors.yellow : Colors.sub, fontSize: 14, fontWeight: goal === g ? '700' : '400' }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Focus Area */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ color: Colors.sub, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: '600' }}>
              Focus Area <Text style={{ color: Colors.muted, textTransform: 'none', letterSpacing: 0 }}>(optional)</Text>
            </Text>
            <TextInput
              value={focus}
              onChangeText={setFocus}
              placeholder="e.g. Gaming Performance, Camera, 2K Display"
              placeholderTextColor={Colors.muted}
              style={{
                backgroundColor: Colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: focus ? Colors.yellow + '30' : Colors.border,
                paddingHorizontal: 18,
                paddingVertical: 16,
                color: Colors.white,
                fontSize: 15,
              }}
            />
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={!canProceed}
            activeOpacity={0.85}
            style={{
              backgroundColor: canProceed ? Colors.yellow : Colors.card,
              borderRadius: 20,
              paddingVertical: 20,
              alignItems: 'center',
              shadowColor: Colors.yellow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canProceed ? 0.18 : 0,
              shadowRadius: 12,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: canProceed ? Colors.black : Colors.muted }}>
              Analyze Brand →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
