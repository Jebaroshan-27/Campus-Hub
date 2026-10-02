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
import { MOCK_NOTES, MOCK_EVENTS } from '../../constants/mockData';

export default function FacultyDashboardScreen({ navigation }) {
  const { user, switchRole } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>Faculty Portal</Text>
          <Text style={styles.userName}>{user?.name || 'Dr. Mitchell'}</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('FacultyNotifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Faculty Profile Banner */}
        <AppCard style={styles.profileBanner} padding="md">
          <View style={styles.bannerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.avatar || 'FC'}</Text>
            </View>
            <View style={styles.bannerInfo}>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>FACULTY & HOD</Text>
              </View>
              <Text style={styles.bannerDept}>
                {user?.department || 'Computer Science & Engineering'}
              </Text>
              <Text style={styles.bannerOffice}>
                {user?.office || 'Room 304, CS Block'}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Academic Overview Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="document-text" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.metricVal}>14</Text>
            <Text style={styles.metricLabel}>Notes Uploaded</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="people" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.metricVal}>180</Text>
            <Text style={styles.metricLabel}>Enrolled Students</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar" size={20} color={COLORS.warning} />
            </View>
            <Text style={styles.metricVal}>3</Text>
            <Text style={styles.metricLabel}>Active Events</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="cloud-download" size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.metricVal}>940+</Text>
            <Text style={styles.metricLabel}>Note Downloads</Text>
          </View>
        </View>

        {/* Quick Faculty Tools */}
        <Text style={styles.sectionTitle}>Course Management</Text>
        <View style={styles.actionRow}>
          <AppButton
            title="Upload Material"
            size="sm"
            icon="cloud-upload-outline"
            onPress={() => navigation.navigate('FacultyNotesTab')}
            style={styles.actionBtn}
          />
          <AppButton
            title="Create Event"
            size="sm"
            variant="outline"
            icon="calendar-outline"
            onPress={() => navigation.navigate('FacultyEventsTab')}
            style={styles.actionBtn}
          />
        </View>

        {/* Department Notes */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your Uploaded Notes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FacultyNotesTab')}>
            <Text style={styles.seeAllText}>Manage All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_NOTES.slice(0, 2).map((note) => (
          <AppCard key={note.id} style={styles.itemCard} padding="md">
            <View style={styles.itemRow}>
              <View style={styles.itemIconWrap}>
                <Ionicons name="book-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{note.title}</Text>
                <Text style={styles.itemSub}>
                  {note.subject} • {note.fileSize} • {note.downloads} downloads
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Edit Note', `Editing ${note.title}`)}
                style={styles.editBtn}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </AppCard>
        ))}

        {/* Academic Events */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Organized Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FacultyEventsTab')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_EVENTS.slice(0, 1).map((ev) => (
          <AppCard key={ev.id} style={styles.itemCard} padding="md">
            <View style={styles.itemRow}>
              <View style={styles.eventIconWrap}>
                <Ionicons name="easel-outline" size={22} color={COLORS.warning} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{ev.title}</Text>
                <Text style={styles.itemSub}>
                  {ev.date} • {ev.venue}
                </Text>
                <Text style={styles.attendeesText}>{ev.attendees} Registered Students</Text>
              </View>
            </View>
          </AppCard>
        ))}

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
              title="Admin View"
              size="sm"
              variant="outline"
              onPress={() => switchRole('admin')}
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
  greetingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  profileBanner: {
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
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
  bannerInfo: {
    flex: 1,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: 4,
  },
  roleTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  bannerDept: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
  },
  bannerOffice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  metricVal: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  seeAllText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  itemCard: {
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  eventIconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  attendeesText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },
  editBtn: {
    padding: SPACING.xs,
  },
  rolePreviewContainer: {
    marginTop: SPACING.xl,
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
