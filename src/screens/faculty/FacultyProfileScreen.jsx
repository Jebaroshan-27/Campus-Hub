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

export default function FacultyProfileScreen() {
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
        title="Faculty Profile"
        subtitle="Staff credentials and departmental designations"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.profileCard} padding="lg">
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.avatar || 'SM'}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.userName}>{user?.name || 'Dr. Sarah Mitchell'}</Text>
              <Text style={styles.userRole}>
                {user?.designation || 'Associate Professor & HOD'}
              </Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>FACULTY</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{user?.email || 's.mitchell@campushub.edu'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {user?.department || 'Computer Science & Engineering'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{user?.office || 'Room 304, CS Block'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{user?.phone || '+91 98765 43211'}</Text>
          </View>
        </AppCard>

        {/* Assigned Courses */}
        <Text style={styles.sectionHeader}>Current Semester Courses</Text>
        <AppCard style={styles.coursesCard} padding="md">
          <View style={styles.courseItem}>
            <View style={styles.courseCodeBadge}>
              <Text style={styles.courseCodeText}>CS403</Text>
            </View>
            <View style={styles.courseDetails}>
              <Text style={styles.courseTitle}>Compiler Design & AST Construction</Text>
              <Text style={styles.courseMeta}>Year 4 • 62 Enrolled Students</Text>
            </View>
          </View>

          <View style={styles.courseDivider} />

          <View style={styles.courseItem}>
            <View style={styles.courseCodeBadge}>
              <Text style={styles.courseCodeText}>CS401</Text>
            </View>
            <View style={styles.courseDetails}>
              <Text style={styles.courseTitle}>Distributed Cloud Systems Lab</Text>
              <Text style={styles.courseMeta}>Year 4 • 58 Enrolled Students</Text>
            </View>
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
            title="Admin View"
            variant="outline"
            size="sm"
            onPress={() => switchRole('admin')}
            style={styles.switchBtn}
            icon="shield-checkmark-outline"
          />
        </View>

        <AppButton
          title="Sign Out of Faculty Portal"
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
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
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
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 6,
  },
  badgePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
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
  coursesCard: {
    marginBottom: SPACING.lg,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  courseCodeBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  courseCodeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  courseDetails: {
    flex: 1,
  },
  courseTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  courseMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  courseDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
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
