import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  AppHeader,
  AppCard,
  AppButton,
  AppInput,
  Avatar,
  StatusBadge,
} from '../../components';
import { MOCK_STUDENT_USER } from '../../constants/mockStudentData';

export default function StudentProfileScreen({ navigation }) {
  const { user: authUser, logout, switchRole } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Profile data from auth state or fallback preview
  const [profile, setProfile] = useState({
    name: authUser?.name || MOCK_STUDENT_USER.name,
    regNo: authUser?.registerNumber || authUser?.regNo || MOCK_STUDENT_USER.regNo,
    department: authUser?.department || MOCK_STUDENT_USER.department,
    year: authUser?.year || MOCK_STUDENT_USER.year,
    email: authUser?.email || MOCK_STUDENT_USER.email,
    phone: authUser?.phone || MOCK_STUDENT_USER.phone,
    avatar: authUser?.avatar || MOCK_STUDENT_USER.avatar,
    gpa: authUser?.gpa || MOCK_STUDENT_USER.gpa,
    attendance: authUser?.attendance || MOCK_STUDENT_USER.attendance,
  });

  const [editForm, setEditForm] = useState({
    phone: profile.phone,
    year: profile.year,
  });

  const handleSaveProfile = () => {
    setProfile((prev) => ({
      ...prev,
      phone: editForm.phone,
      year: editForm.year,
    }));
    setIsEditModalVisible(false);
    Alert.alert('Profile Updated', 'Local profile preferences updated for preview.');
  };

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
        title="Student Profile"
        subtitle="Academic credentials & student record"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <AppCard style={styles.profileCard} padding="lg">
          <View style={styles.profileHeaderRow}>
            <Avatar
              name={profile.name}
              text={profile.avatar}
              size="lg"
              color={COLORS.primary}
            />

            <View style={styles.profileHeaderInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{profile.name}</Text>
                <StatusBadge label="Student" variant="primary" size="sm" />
              </View>
              <Text style={styles.regNoText}>ID: {profile.regNo}</Text>
              <Text style={styles.departmentText}>{profile.department}</Text>
              <Text style={styles.yearText}>{profile.year}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contact Details */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.detailText}>{profile.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="call-outline" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.detailText}>{profile.phone}</Text>
          </View>

          <View style={styles.editBtnContainer}>
            <AppButton
              title="Edit Profile Details"
              variant="outline"
              size="sm"
              icon="pencil-outline"
              onPress={() => setIsEditModalVisible(true)}
            />
          </View>
        </AppCard>

        {/* Academic Standing */}
        <Text style={styles.sectionHeader}>Academic Standing</Text>
        <View style={styles.metricsRow}>
          <AppCard style={styles.metricCard} padding="md">
            <Text style={styles.metricLabel}>CUMULATIVE GPA</Text>
            <Text style={styles.metricVal}>{profile.gpa}</Text>
            <Text style={styles.metricSub}>Scale of 10.0</Text>
          </AppCard>

          <AppCard style={styles.metricCard} padding="md">
            <Text style={styles.metricLabel}>ATTENDANCE</Text>
            <Text style={[styles.metricVal, { color: COLORS.success }]}>
              {profile.attendance}
            </Text>
            <Text style={styles.metricSub}>Above requirement</Text>
          </AppCard>
        </View>

        {/* Quick Module Links */}
        <Text style={styles.sectionHeader}>Quick Access</Text>
        <AppCard style={styles.menuCard} padding="none">
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('StudentConnections')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: COLORS.accentLight }]}>
              <Ionicons name="people-outline" size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.menuText}>Peer Connections & Collaborators</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('StudentChatTab')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryTint }]}>
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>Campus Messages & Study Channels</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('StudentNotifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: COLORS.infoLight }]}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.info} />
            </View>
            <Text style={styles.menuText}>Notification Center</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AppCard>

        {/* Demo Role Switcher */}
        <View style={styles.rolePreviewContainer}>
          <Text style={styles.rolePreviewTitle}>Multi-Role Navigation Demo</Text>
          <View style={styles.rolePreviewButtons}>
            <AppButton
              title="Faculty View"
              size="sm"
              variant="outline"
              onPress={() => switchRole('faculty')}
              style={styles.switchBtn}
              icon="briefcase-outline"
            />
            <AppButton
              title="Admin View"
              size="sm"
              variant="outline"
              onPress={() => switchRole('admin')}
              style={styles.switchBtn}
              icon="shield-checkmark-outline"
            />
          </View>
        </View>

        {/* Sign Out */}
        <AppButton
          title="Sign Out of CampusHub"
          variant="danger"
          onPress={handleLogout}
          icon="log-out-outline"
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Edit Profile Modal (UI Preview Only) */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Info</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Temporary UI preview. Read-only fields are governed by college registrar records.
            </Text>

            <AppInput
              label="Student Name"
              value={profile.name}
              editable={false}
              icon="person-outline"
            />

            <AppInput
              label="Contact Phone"
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              icon="call-outline"
              keyboardType="phone-pad"
            />

            <AppInput
              label="Academic Year"
              value={editForm.year}
              onChangeText={(text) => setEditForm({ ...editForm, year: text })}
              icon="school-outline"
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalBtn}
              />
              <AppButton
                title="Save Changes"
                size="sm"
                onPress={handleSaveProfile}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl + 20,
  },
  profileCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontSize: 18,
  },
  regNoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  departmentText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  yearText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  detailIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontSize: 13,
  },
  editBtnContainer: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  metricVal: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    marginVertical: 4,
  },
  metricSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
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
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: SPACING.md + 38 + SPACING.md,
  },
  rolePreviewContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
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
  logoutBtn: {
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontSize: 18,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
