import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { Eye, EyeOff, Flame } from 'lucide-react-native';

const SLIDES = [
  {
    img: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_05fb0494-2afe-4c3f-bce6-c1237d257f8a.jpg',
    title: 'Track Your Calories',
    sub: 'Log every meal in seconds and stay on top of your daily nutrition goals.',
  },
  {
    img: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_37e2b810-1ae2-46a1-a25d-6ca58095e3e3.jpg',
    title: 'Stay Motivated',
    sub: 'See real progress with beautiful analytics and weekly streaks.',
  },
  {
    img: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0bb8b8a9-9293-4c65-a1b8-36a89572c952.jpg',
    title: 'Eat Smart, Live Better',
    sub: 'AI-powered food recognition helps you log meals with just a photo.',
  },
];

export default function LoginScreen({ navigation }: any) {
  const { t } = useI18n();
  const { signIn, authEnabled } = useAuth();
  const [slide, setSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error);
    }
  };

  if (showAuth) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.authContainer}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Flame size={20} color="#fff" />
            </View>
            <Text style={styles.logoText}>CalorAI</Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.title}>{t('sign_in')}</Text>
            <Text style={styles.subtitle}>{t('have_account')}</Text>
            {!authEnabled && (
              <Text style={styles.notice}>
                EXPO_PUBLIC_SUPABASE_URL и EXPO_PUBLIC_SUPABASE_ANON_KEY не настроены.
              </Text>
            )}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('email')}
              style={styles.input}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
            <View style={styles.passwordWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('password')}
                style={styles.passwordInput}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.textMuted} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('sign_in_btn')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>{t('sign_up')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const current = SLIDES[slide];
  return (
    <ImageBackground source={{ uri: current.img }} style={styles.hero} imageStyle={styles.heroImage}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.heroSafe} edges={['top']}>
        <View style={styles.heroContent}>
          <View style={styles.heroBrand}>
            <View style={styles.heroBrandBadge}>
              <Flame size={18} color="#fff" />
            </View>
            <Text style={styles.heroBrandText}>CalorAI</Text>
          </View>

          <View style={styles.heroBottom}>
            <View style={styles.dots}>
              {SLIDES.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dot, index === slide ? styles.dotActive : undefined]}
                  onPress={() => setSlide(index)}
                />
              ))}
            </View>

            <Text style={styles.heroTitle}>{current.title}</Text>
            <Text style={styles.heroSubtitle}>{current.sub}</Text>

            <View style={styles.heroButtons}>
              {slide < SLIDES.length - 1 ? (
                <>
                  <TouchableOpacity style={styles.secondaryHeroButton} onPress={() => setShowAuth(true)}>
                    <Text style={styles.secondaryHeroButtonText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryHeroButton} onPress={() => setSlide((value) => Math.min(value + 1, SLIDES.length - 1))}>
                    <Text style={styles.primaryHeroButtonText}>{t('next')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.primaryHeroButtonFull} onPress={() => setShowAuth(true)}>
                  <Text style={styles.primaryHeroButtonText}>{t('finish')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  authContainer: { flex: 1, justifyContent: 'center', padding: SIZES.xxl },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 },
  logoBadge: { width: 40, height: 40, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.text },
  authCard: { backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: COLORS.cardBorder },
  title: { fontSize: 32, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: SIZES.xl },
  notice: { fontSize: 12, color: COLORS.danger, marginBottom: SIZES.lg, lineHeight: 18 },
  input: { backgroundColor: COLORS.card, borderRadius: 14, padding: SIZES.md, fontSize: 15, color: COLORS.text, marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  passwordWrap: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SIZES.md, paddingHorizontal: SIZES.md, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, height: 50, fontSize: 15, color: COLORS.text },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: SIZES.md, alignItems: 'center', marginTop: SIZES.sm },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: FONTS.semibold },
  link: { textAlign: 'center', color: COLORS.primary, fontWeight: FONTS.semibold, marginTop: SIZES.lg },
  hero: { flex: 1 },
  heroImage: { resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroSafe: { flex: 1 },
  heroContent: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  heroBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroBrandBadge: { width: 36, height: 36, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  heroBrandText: { color: '#fff', fontSize: 22, fontWeight: FONTS.bold },
  heroBottom: { marginTop: 'auto' },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 18, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { width: 36, backgroundColor: COLORS.primary },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: FONTS.bold, lineHeight: 38 },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22, marginTop: 12 },
  heroButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  secondaryHeroButton: { flex: 1, height: 54, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  secondaryHeroButtonText: { color: '#fff', fontSize: 15, fontWeight: FONTS.semibold },
  primaryHeroButton: { flex: 1, height: 54, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  primaryHeroButtonFull: { width: '100%', height: 54, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  primaryHeroButtonText: { color: '#fff', fontSize: 16, fontWeight: FONTS.bold },
});
