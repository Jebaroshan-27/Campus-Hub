import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AppButton, AppInput, AppCard } from '../../components';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    // Clear previous errors
    setErrorMessage('');

    const cleanId = identifier.trim();
    const cleanPw = password.trim();

    // Form validation
    if (!cleanId) {
      setErrorMessage('Please enter your register number or campus email.');
      return;
    }

    if (!cleanPw) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (cleanPw.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await login(cleanId, cleanPw);
      // Navigation is automatically handled by RootNavigator reacting to auth state
    } catch (err) {
      setErrorMessage(err.message || 'Invalid register number/email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const DEMO_ACCOUNTS = {
    student: { identifier: '21BCS0142', password: 'password123' },
    faculty: { identifier: 'FAC-CSE-109', password: 'password123' },
    admin: { identifier: 'ADM-IT-001', password: 'password123' },
  };

  const handleDemoLogin = async (roleKey) => {
    const creds = DEMO_ACCOUNTS[roleKey];
    if (!creds) return;
    setErrorMessage('');
    setIdentifier(creds.identifier);
    setPassword(creds.password);
    try {
      setIsSubmitting(true);
      await login(creds.identifier, creds.password);
    } catch (err) {
      setErrorMessage(err.message || 'Could not log in with demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="school" size={34} color={COLORS.primary} />
            </View>
            <Text style={styles.brandTitle}>CampusHub</Text>
            <Text style={styles.brandSubtitle}>
              Students Collaborative & Academic Platform
            </Text>
          </View>

          {/* Login Card */}
          <AppCard style={styles.loginCard} padding="lg">
            <Text style={styles.cardHeading}>Sign In</Text>
            <Text style={styles.cardSubheading}>
              Enter your college credentials to access your portal
            </Text>

            {/* Error Message Box */}
            {errorMessage ? (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <AppInput
              label="Register Number / Campus Email"
              placeholder="e.g. 21BCS0142 or student@campushub.edu"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="mail-outline"
              autoCapitalize="none"
              editable={!isSubmitting}
            />

            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="lock-closed-outline"
              isPassword
              editable={!isSubmitting}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordContainer}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Navigate to forgot password screen"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Action Button */}
            <AppButton
              title="Sign In"
              onPress={handleLogin}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.loginBtn}
              icon="log-in-outline"
            />

            {/* Register Option */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Don't have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Register')}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Navigate to account registration"
              >
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </AppCard>

          {/* Quick Demo Sign-in for Development Testing */}
          <View style={styles.devSection}>
            <View style={styles.devHeader}>
              <Ionicons name="flask-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.devTitle}>Demo Quick Sign-In (Real Backend Accounts)</Text>
            </View>
            <View style={styles.quickButtonsRow}>
              <AppButton
                title="Student"
                size="sm"
                variant="outline"
                onPress={() => handleDemoLogin('student')}
                disabled={isSubmitting}
                style={styles.quickBtn}
              />
              <AppButton
                title="Faculty"
                size="sm"
                variant="outline"
                onPress={() => handleDemoLogin('faculty')}
                disabled={isSubmitting}
                style={styles.quickBtn}
              />
              <AppButton
                title="Admin"
                size="sm"
                variant="outline"
                onPress={() => handleDemoLogin('admin')}
                disabled={isSubmitting}
                style={styles.quickBtn}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  brandTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  loginCard: {
    marginBottom: SPACING.xl,
  },
  cardHeading: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  cardSubheading: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBoxText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 17,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xs,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  loginBtn: {
    marginBottom: SPACING.lg,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPrompt: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
  registerLink: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  devSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  devTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: SPACING.sm,
  },
  quickBtn: {
    flex: 1,
  },
});
