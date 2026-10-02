import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AppHeader, AppCard, AppButton } from '../../components';

export default function AdminProfileScreen() {
  const { user, logout, switchRole } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Admin Profile"
        subtitle="System administrative credentials and security logs"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.profileCard} padding="lg">
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
              <Text style={styles.userRole}>
                {user?.designation || 'Chief Systems Administrator'}
              </Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>ADMINISTRATOR</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{user?.email || 'admin@campushub.edu'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {user?.department || 'Campus IT & Administration'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{user?.phone || '+91 98765 43212'}</Text>
          </View>
        </AppCard>

        {/* System Diagnostics */}
        <Text style={styles.sectionHeader}>Platform Status</Text>
        <AppCard style={styles.diagnosticsCard} padding="md">
          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Server Architecture</Text>
            <Text style={styles.diagVal}>Expo React Native Client</Text>
          </View>
          <View style={styles.diagDivider} />
          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>App Environment</Text>
            <Text style={[styles.diagVal, { color: COLORS.success }]}>Healthy (Expo SDK 57)</Text>
          </View>
          <View style={styles.diagDivider} />
          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Storage & Cache</Text>
            <Text style={styles.diagVal}>Optimal (Local State)</Text>
          </View>
        </AppCard>

        {/* Role Demo Switching */}
        <Text style={styles.sectionHeader}>Switch Portal View (Demo)</Text>
        <View style={styles.roleSwitchRow}>
          <AppButton
            title="Student View"
            variant="outline"
            size="sm"
            onPress={() => switchRole('student')}
            style={styles.switchBtn}
            icon="school-outline"
          />
          <AppButton
            title="Faculty View"
            variant="outline"
            size="sm"
            onPress={() => switchRole('faculty')}
            style={styles.switchBtn}
            icon="briefcase-outline"
          />
        </View>

        <AppButton
          title="Sign Out of Admin Console"
          variant="danger"
          onPress={handleLogout}
          icon="log-out-outline"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  profileCard: {
    marginBottom: SPACING.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  userRole: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 6,
  },
  badgePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
  },
  sectionHeader: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  diagnosticsCard: {
    marginBottom: SPACING.lg,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  diagLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
  diagVal: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  diagDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  roleSwitchRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  switchBtn: {
    flex: 1,
  },
  logoutBtn: {
    marginTop: SPACING.xs,
  },
});
