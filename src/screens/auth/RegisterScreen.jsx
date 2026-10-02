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
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import { AppButton, AppInput, AppCard } from '../../components';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNo, setRegNo] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email format validator
  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleRegister = async () => {
    setErrorMessage('');

    // Field Validations
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!regNo.trim()) {
      setErrorMessage(
        role === ROLES.STUDENT
          ? 'Student register number is required.'
          : 'Faculty employee ID is required.'
      );
      return;
    }

    if (!email.trim() || !isValidEmail(email.trim())) {
      setErrorMessage('Please enter a valid campus email address.');
      return;
    }

    if (!department.trim()) {
      setErrorMessage('Department / Specialization is required.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        registerNumber: regNo.trim(),
        department: department.trim(),
        role,
        password,
      });
      // RootNavigator automatically navigates upon authentication
    } catch (err) {
      setErrorMessage(err.message || 'Registration could not be completed.');
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Join CampusHub</Text>
            <Text style={styles.subtitle}>
              Create your institutional account to collaborate with peers and faculty
            </Text>
          </View>

          <AppCard style={styles.card} padding="lg">
            {/* Temporary Development-Only Role Selector */}
            <View style={styles.devRoleSection}>
              <View style={styles.roleHeaderRow}>
                <Text style={styles.sectionLabel}>Select Account Role</Text>
                <Text style={styles.devTag}>Dev Testing Only</Text>
              </View>
              <Text style={styles.devNotice}>
                * In production, roles are assigned and verified by the registrar.
              </Text>

              <View style={styles.roleTabsContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.roleTab,
                    role === ROLES.STUDENT && styles.roleTabActive,
                  ]}
                  onPress={() => setRole(ROLES.STUDENT)}
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name="school-outline"
                    size={17}
                    color={role === ROLES.STUDENT ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleTabText,
                      role === ROLES.STUDENT && styles.roleTabTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.roleTab,
                    role === ROLES.FACULTY && styles.roleTabActive,
                  ]}
                  onPress={() => setRole(ROLES.FACULTY)}
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={17}
                    color={role === ROLES.FACULTY ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleTabText,
                      role === ROLES.FACULTY && styles.roleTabTextActive,
                    ]}
                  >
                    Faculty
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.roleTab,
                    role === ROLES.ADMIN && styles.roleTabActive,
                  ]}
                  onPress={() => setRole(ROLES.ADMIN)}
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color={role === ROLES.ADMIN ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleTabText,
                      role === ROLES.ADMIN && styles.roleTabTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input Form Fields */}
            <AppInput
              label="Full Name"
              placeholder="e.g. Karthikeyan R"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="person-outline"
              autoCapitalize="words"
              editable={!isSubmitting}
            />

            <AppInput
              label={
                role === ROLES.STUDENT
                  ? 'Register Number / Roll No'
                  : role === ROLES.FACULTY
                  ? 'Faculty Employee ID'
                  : 'Admin Employee ID'
              }
              placeholder={
                role === ROLES.STUDENT ? 'e.g. 21BCS0142' : 'e.g. FAC-CSE-109'
              }
              value={regNo}
              onChangeText={(text) => {
                setRegNo(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="card-outline"
              autoCapitalize="characters"
              editable={!isSubmitting}
            />

            <AppInput
              label="Campus Email"
              placeholder="e.g. student@campushub.edu"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
            />

            <AppInput
              label="Department / Program"
              placeholder="e.g. Computer Science & Engineering"
              value={department}
              onChangeText={(text) => {
                setDepartment(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="business-outline"
              autoCapitalize="words"
              editable={!isSubmitting}
            />

            <AppInput
              label="Password"
              placeholder="Create password (min 6 characters)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="lock-closed-outline"
              isPassword
              editable={!isSubmitting}
            />

            <AppInput
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="shield-checkmark-outline"
              isPassword
              editable={!isSubmitting}
            />

            <AppButton
              title="Create Account"
              onPress={handleRegister}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.registerBtn}
              icon="person-add-outline"
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Already have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Login')}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Navigate to sign in"
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.xl,
  },
  devRoleSection: {
    marginBottom: SPACING.md,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  devTag: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  devNotice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.xs + 2,
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: 3,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  roleTabActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  roleTabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  roleTabTextActive: {
    color: COLORS.primary,
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
  registerBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPrompt: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
  footerLink: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
