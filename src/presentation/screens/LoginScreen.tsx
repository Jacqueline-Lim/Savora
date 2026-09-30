import React, { useState } from 'react';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const isLoading = status === 'authenticating';

  const submit = async () => {
    dismissError();
    setValidationMessage(null);

    if (isRegistering && password !== confirmPassword) {
      setValidationMessage('Passwords do not match.');
      return;
    }

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
              {isRegistering ? 'Create account' : 'Sign in'}
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
              textContentType={isRegistering ? 'newPassword' : 'password'}
              returnKeyType={isRegistering ? 'next' : 'done'}
              onSubmitEditing={() => {
                if (!isRegistering) {
                  submit().catch(() => undefined);
                }
              }}
              editable={!isLoading}
            />

            {isRegistering ? (
              <FormField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Enter your password again"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={() => {
                  submit().catch(() => undefined);
                }}
                editable={!isLoading}
              />
            ) : null}

            {validationMessage || errorMessage ? (
              <View accessibilityLiveRegion="polite" style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {validationMessage ?? errorMessage}
                </Text>
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

            <View style={styles.googleButtonFrame}>
              <GoogleSigninButton
                accessibilityLabel="Sign in with Google"
                color={GoogleSigninButton.Color.Light}
                disabled={isLoading}
                onPress={() => {
                  dismissError();
                  setValidationMessage(null);
                  loginWithGoogle().catch(() => undefined);
                }}
                size={GoogleSigninButton.Size.Wide}
                style={styles.googleButton}
              />
            </View>
          </View>

          <View style={styles.accountPrompt}>
            <Text style={styles.accountPromptText}>
              {isRegistering
                ? 'Already have an account?'
                : `New to ${APP_NAME}?`}
            </Text>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={
                isRegistering ? 'Go to sign in' : 'Go to registration'
              }
              onPress={() => {
                setIsRegistering(current => !current);
                setPassword('');
                setConfirmPassword('');
                setValidationMessage(null);
                dismissError();
              }}
              disabled={isLoading}
              hitSlop={10}
              style={({ pressed }) => [
                pressed && styles.linkPressed,
                isLoading && styles.linkDisabled,
              ]}
            >
              <Text style={styles.accountLink}>
                {isRegistering ? 'Sign in' : 'Create account'}
              </Text>
            </Pressable>
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
    gap: 20,
    padding: spacing.lg,
  },
  brandLogo: {
    width: 92,
    height: 92,
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
    fontSize: 30,
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
  googleButtonFrame: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  googleButton: {
    width: '100%',
    height: 56,
    marginTop: -3,
  },
  accountPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  accountPromptText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  accountLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  linkPressed: {
    opacity: 0.65,
  },
  linkDisabled: {
    opacity: 0.45,
  },
});
