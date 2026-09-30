import React, { useState } from 'react';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_LOGO, APP_NAME } from '../../config/branding';
import { AppButton } from '../components/AppButton';
import { FormField } from '../components/FormField';
import { useAuth } from '../hooks/useAuth';
import { colors, radius, spacing } from '../theme';

export function LoginScreen(): React.JSX.Element {
  const {
    login,
    loginWithGoogle,
    register,
    status,
    errorMessage,
    dismissError,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const isLoading = status === 'authenticating';

  const submit = async () => {
    dismissError();
    if (isRegistering) {
      await register(email, password);
    } else {
      await login(email, password);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            accessibilityLabel={`${APP_NAME} logo`}
            accessibilityIgnoresInvertColors
            source={APP_LOGO}
            resizeMode="contain"
            style={styles.brandLogo}
          />

          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>{APP_NAME.toUpperCase()}</Text>
            <Text style={styles.title}>
              {isRegistering ? 'Create an account' : 'Welcome back'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              inputMode="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              editable={!isLoading}
            />
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={() => {
                submit().catch(() => undefined);
              }}
              editable={!isLoading}
            />

            {errorMessage ? (
              <View accessibilityLiveRegion="polite" style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <AppButton
              label={isRegistering ? 'Create account' : 'Sign in'}
              onPress={() => {
                submit().catch(() => undefined);
              }}
              loading={isLoading}
            />

            <View accessibilityElementsHidden style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSigninButton
              accessibilityLabel="Sign in with Google"
              color={GoogleSigninButton.Color.Light}
              disabled={isLoading}
              onPress={() => {
                dismissError();
                loginWithGoogle().catch(() => undefined);
              }}
              size={GoogleSigninButton.Size.Wide}
              style={styles.googleButton}
            />
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountTitle}>
              {isRegistering ? 'Already registered?' : `New to ${APP_NAME}?`}
            </Text>
            <AppButton
              label={isRegistering ? 'Sign in' : 'Register'}
              onPress={() => {
                setIsRegistering(current => !current);
                dismissError();
              }}
              disabled={isLoading}
              variant="secondary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    minHeight: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  brandLogo: {
    width: 108,
    height: 108,
    alignSelf: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
  },
  formCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSurface,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  googleButton: {
    width: '100%',
    height: 48,
    alignSelf: 'center',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  accountTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
});
