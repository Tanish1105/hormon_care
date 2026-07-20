import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { brandLogo } from '../assets/brand';
import { legalDocuments } from '../content/legal';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, layout, radius, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LegalWeb'>;

export default function LegalWebScreen({ route }: Props) {
  const doc = legalDocuments[route.params.kind];

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={styles.scroll}
      testID="legal-web-screen">
      <View style={styles.logoCard}>
        <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.guTitle}>{doc.guTitle}</Text>
      <Text style={styles.title}>{doc.title}</Text>

      <Text style={styles.intro}>{doc.intro}</Text>

      {doc.sections.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}

      <View style={styles.footerBox}>
        <Text style={styles.footerText}>{doc.footer}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { ...layout.screen },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  logoCard: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadows.soft,
  },
  logo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  guTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.primary,
    opacity: 0.85,
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  intro: {
    marginTop: 24,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSoft,
  },
  section: {
    marginTop: 22,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSoft,
  },
  footerBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
