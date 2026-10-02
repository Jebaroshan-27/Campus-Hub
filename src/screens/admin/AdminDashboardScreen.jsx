import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AppCard, AppButton } from '../../components';

export default function AdminDashboardScreen({ navigation }) {
  const { user, switchRole } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.portalLabel}>Admin Console</Text>
          <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
        </View>
        <View style={styles.sysStatusBadge}>
          <View style={styles.sysDot} />
          <Text style={styles.sysText}>Live</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* System Overview Banner */}
        <AppCard style={styles.bannerCard} padding="md">
          <View style={styles.bannerRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="shield-checkmark" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>CampusHub System Administration</Text>
              <Text style={styles.bannerSubtitle}>
                Control user credentials, courseware moderation, and campus announcements
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Global Statistics Grid */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminUsersTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statVal}>3,420</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminNotesTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="documents" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.statVal}>1,280</Text>
            <Text style={styles.statLabel}>Course Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminPlacementsTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="briefcase" size={20} color={COLORS.warning} />
            </View>
            <Text style={styles.statVal}>28</Text>
            <Text style={styles.statLabel}>Active Drives</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('AdminManageEvents')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="calendar" size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statLabel}>College Events</Text>
          </TouchableOpacity>
        </View>

        {/* Administrative Management Hub */}
        <Text style={styles.sectionTitle}>Administrative Modules</Text>
        <AppCard style={styles.menuCard} padding="none">
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminUsersTab')}
          >
            <View style={[styles.itemIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="person-circle-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuHeading}>Manage Users & Roles</Text>
              <Text style={styles.menuDesc}>
                Add, verify, or suspend student and faculty accounts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminNotesTab')}
          >
            <View style={[styles.itemIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="folder-open-outline" size={22} color={COLORS.success} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuHeading}>Moderate Notes Repository</Text>
              <Text style={styles.menuDesc}>
                Approve uploaded courseware and manage archives
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminPlacementsTab')}
          >
            <View style={[styles.itemIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="briefcase-outline" size={22} color={COLORS.warning} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuHeading}>Manage Placement Drives</Text>
              <Text style={styles.menuDesc}>
                Publish corporate drives and monitor student applicants
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminManageEvents')}
          >
            <View style={[styles.itemIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuHeading}>Manage Campus Events</Text>
              <Text style={styles.menuDesc}>
                Approve symposiums, hackathons and hall bookings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AppCard>

        {/* Role Demo Switcher */}
        <View style={styles.rolePreviewContainer}>
          <Text style={styles.rolePreviewTitle}>Switch View (Demo Preview)</Text>
          <View style={styles.rolePreviewButtons}>
            <AppButton
              title="Student View"
              size="sm"
              variant="outline"
              onPress={() => switchRole('student')}
              style={styles.switchBtn}
            />
            <AppButton
              title="Faculty View"
              size="sm"
              variant="outline"
              onPress={() => switchRole('faculty')}
              style={styles.switchBtn}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  portalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  sysStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  sysDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  sysText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '700',
    fontSize: 10,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  bannerCard: {
    marginBottom: SPACING.lg,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
  },
  bannerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statVal: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  menuCard: {
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuHeading: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: SPACING.md + 42 + SPACING.md,
  },
  rolePreviewContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rolePreviewTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  rolePreviewButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  switchBtn: {
    flex: 1,
  },
});
