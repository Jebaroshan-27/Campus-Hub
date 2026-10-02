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
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { AppButton, AppInput, AppCard } from '../../components';
import { requestPasswordReset, resetPasswordWithOtp } from '../../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  // Steps: 1 = Request OTP, 2 = Verify OTP & Set New Password, 3 = Success
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState('');

  // Step 1: Request OTP code
  const handleRequestOtp = async () => {
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered campus email or roll number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await requestPasswordReset(identifier.trim());
      if (res.testCode) {
        setDemoCodeHint(res.testCode);
        setOtp(res.testCode); // Auto-fill for seamless testing
      }
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Could not request reset code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Validate OTP and update password
  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPasswordWithOtp({
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Password reset failed.');
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
          {/* Back Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 2) {
                setStep(1);
                setErrorMessage('');
              } else {
                navigation.navigate('Login');
              }
            }}
            activeOpacity={0.7}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Back button"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            <Text style={styles.backText}>
              {step === 2 ? 'Back to Step 1' : 'Back to Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons
                name={step === 3 ? 'checkmark-circle' : step === 2 ? 'shield-checkmark' : 'key-outline'}
                size={34}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.title}>
              {step === 3
                ? 'Password Reset Complete'
                : step === 2
                ? 'Verify & Set Password'
                : 'Forgot Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 3
                ? 'Your account password has been updated. You can now log in with your new credentials.'
                : step === 2
                ? `Enter the 6-digit verification code sent for ${identifier} and choose your new password.`
                : 'Enter your registered campus email or roll number to receive password recovery instructions.'}
            </Text>
          </View>

          <AppCard style={styles.card} padding="lg">
            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* STEP 1: Enter email / regNo */}
            {step === 1 && (
              <View>
                <AppInput
                  label="Registered Email or Roll Number"
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

                <AppButton
                  title="Send Verification Code"
                  onPress={handleRequestOtp}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                  icon="arrow-forward-outline"
                />

                <View style={styles.hintBox}>
                  <Ionicons name="information-circle-outline" size={18} color={COLORS.info} />
                  <Text style={styles.hintText}>
                    Temporary development preview: Password reset flow is fully simulated on the client until the email backend service is connected.
                  </Text>
                </View>
              </View>
            )}

            {/* STEP 2: Enter OTP & New Password */}
            {step === 2 && (
              <View>
                {demoCodeHint ? (
                  <View style={styles.devCodeBox}>
                    <Ionicons name="key" size={16} color={COLORS.warning} />
                    <Text style={styles.devCodeText}>
                      Development Test OTP: <Text style={styles.bold}>{demoCodeHint}</Text>
                    </Text>
                  </View>
                ) : null}

                <AppInput
                  label="6-Digit Verification Code"
                  placeholder="Enter 6-digit OTP code"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  icon="shield-outline"
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                />

                <AppInput
                  label="New Password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  icon="lock-closed-outline"
                  isPassword
                  editable={!isSubmitting}
                />

                <AppInput
                  label="Confirm New Password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  icon="checkmark-circle-outline"
                  isPassword
                  editable={!isSubmitting}
                />

                <AppButton
                  title="Update Password"
                  onPress={handleResetPassword}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                  icon="checkmark-outline"
                />
              </View>
            )}

            {/* STEP 3: Success Screen */}
            {step === 3 && (
              <View style={styles.successContainer}>
                <View style={styles.successIconBadge}>
                  <Ionicons name="checkmark-circle" size={54} color={COLORS.success} />
                </View>
                <Text style={styles.successTitle}>Password Updated!</Text>
                <Text style={styles.successMessage}>
                  You can now return to the sign in screen and enter your newly configured password.
                </Text>
                <AppButton
                  title="Return to Sign In"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.returnBtn}
                  icon="log-in-outline"
                />
              </View>
            )}
          </AppCard>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    maxWidth: 320,
    lineHeight: 19,
  },
  card: {
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
  devCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
  },
  devCodeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
    color: '#92400E',
  },
  submitBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  hintText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.info,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 17,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  successIconBadge: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  successMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  returnBtn: {
    width: '100%',
  },
});
