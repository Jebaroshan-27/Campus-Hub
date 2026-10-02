import React, { useState } from 'react';
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
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  AppCard,
  SearchBar,
  SectionHeader,
  StatCard,
  FeatureCard,
  Avatar,
  StatusBadge,
  AppButton,
} from '../../components';
import {
  MOCK_STUDENT_USER,
  MOCK_CAMPUS_STATS,
  MOCK_DASHBOARD_EVENTS,
  MOCK_DASHBOARD_PLACEMENTS,
  MOCK_DASHBOARD_NOTES,
} from '../../constants/mockStudentData';

export default function StudentDashboardScreen({ navigation }) {
  const { user: authUser, switchRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback to local temporary preview user if auth context doesn't provide student details
  const student = {
    name: authUser?.name || MOCK_STUDENT_USER.name,
    greeting: MOCK_STUDENT_USER.greeting,
    subtitle: MOCK_STUDENT_USER.welcomeSubtitle,
    avatar: authUser?.avatar || MOCK_STUDENT_USER.avatar,
    regNo: authUser?.registerNumber || authUser?.regNo || MOCK_STUDENT_USER.regNo,
    department: authUser?.department || MOCK_STUDENT_USER.department,
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      Alert.alert(
        'Campus Search',
        `Search for "${searchQuery}" is active as a UI prototype. In subsequent steps, this will filter notes, placements, and campus events.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. Dashboard Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>
            {student.greeting}, {student.name.split(' ')[0]}
          </Text>
          <Text style={styles.subGreetingText}>{student.subtitle}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('StudentNotifications')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View notifications"
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {MOCK_STUDENT_USER.unreadNotificationsCount}
              </Text>
            </View>
          </TouchableOpacity>

          <Avatar
            name={student.name}
            text={student.avatar}
            size="md"
            onPress={() => navigation.navigate('StudentProfile')}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Prominent Quick Search */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notes, placements, events..."
            onClear={() => setSearchQuery('')}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>

        {/* 3. Quick Access Shortcuts */}
        <SectionHeader
          title="Quick Access"
          subtitle="Navigate to core academic modules"
        />
        <View style={styles.quickAccessRow}>
          <FeatureCard
            title="Notes"
            subtitle="Study archive"
            icon="document-text-outline"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryTint}
            onPress={() => navigation.navigate('StudentNotesTab')}
          />
          <FeatureCard
            title="Placements"
            subtitle="Job drives"
            icon="briefcase-outline"
            iconColor={COLORS.success}
            iconBg={COLORS.successLight}
            onPress={() => navigation.navigate('StudentPlacementsTab')}
          />
          <FeatureCard
            title="Events"
            subtitle="Symposiums"
            icon="calendar-outline"
            iconColor={COLORS.warning}
            iconBg={COLORS.warningLight}
            onPress={() => navigation.navigate('StudentEventsTab')}
          />
          <FeatureCard
            title="Connections"
            subtitle="Collaborate"
            icon="people-outline"
            iconColor={COLORS.accent}
            iconBg={COLORS.accentLight}
            onPress={() => navigation.navigate('StudentConnections')}
          />
        </View>

        {/* 4. Dashboard Statistics */}
        <SectionHeader
          title="Your Campus"
          subtitle="Real-time academic snapshot"
        />
        <View style={styles.statsGrid}>
          <StatCard
            label="Available Notes"
            value={MOCK_CAMPUS_STATS.notes}
            icon="documents-outline"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryTint}
            onPress={() => navigation.navigate('StudentNotesTab')}
          />
          <StatCard
            label="Open Placements"
            value={MOCK_CAMPUS_STATS.placements}
            icon="briefcase-outline"
            iconColor={COLORS.success}
            iconBg={COLORS.successLight}
            onPress={() => navigation.navigate('StudentPlacementsTab')}
          />
          <StatCard
            label="Upcoming Events"
            value={MOCK_CAMPUS_STATS.events}
            icon="calendar-outline"
            iconColor={COLORS.warning}
            iconBg={COLORS.warningLight}
            onPress={() => navigation.navigate('StudentEventsTab')}
          />
          <StatCard
            label="Connections"
            value={MOCK_CAMPUS_STATS.connections}
            icon="people-outline"
            iconColor={COLORS.accent}
            iconBg={COLORS.accentLight}
            onPress={() => navigation.navigate('StudentConnections')}
          />
        </View>

        {/* 5. Upcoming Events */}
        <SectionHeader
          title="Upcoming Events"
          actionText="View All"
          onActionPress={() => navigation.navigate('StudentEventsTab')}
        />
        {MOCK_DASHBOARD_EVENTS.map((event) => (
          <AppCard
            key={event.id}
            style={styles.eventCard}
            padding="md"
            onPress={() => navigation.navigate('StudentEventsTab')}
          >
            <View style={styles.eventHeaderRow}>
              <StatusBadge
                label={event.category}
                variant={event.badgeVariant}
                size="sm"
              />
              <Text style={styles.eventStatusText}>{event.status}</Text>
            </View>

            <Text style={styles.eventTitle}>{event.title}</Text>

            <View style={styles.eventDetailsRow}>
              <View style={styles.eventDetailItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                <Text style={styles.eventDetailText}>{event.date}</Text>
              </View>
              <View style={styles.eventDetailItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.eventDetailText}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.eventVenueRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.eventVenueText}>{event.venue}</Text>
            </View>
          </AppCard>
        ))}

        {/* 6. Latest Placements */}
        <SectionHeader
          title="Latest Placements"
          actionText="View All"
          onActionPress={() => navigation.navigate('StudentPlacementsTab')}
        />
        {MOCK_DASHBOARD_PLACEMENTS.map((drive) => (
          <AppCard
            key={drive.id}
            style={styles.placementCard}
            padding="md"
            onPress={() => navigation.navigate('StudentPlacementsTab')}
          >
            <View style={styles.placementRow}>
              <View style={styles.companyBadge}>
                <Text style={styles.companyBadgeText}>{drive.logo}</Text>
              </View>
              <View style={styles.placementInfo}>
                <View style={styles.companyTitleRow}>
                  <Text style={styles.companyName}>{drive.company}</Text>
                  <StatusBadge
                    label={drive.package}
                    variant="success"
                    size="sm"
                  />
                </View>
                <Text style={styles.jobRoleText}>{drive.role}</Text>
                <Text style={styles.eligibilityText}>{drive.eligibility}</Text>
                <View style={styles.deadlineContainer}>
                  <Ionicons name="alarm-outline" size={13} color={COLORS.danger} />
                  <Text style={styles.deadlineText}>{drive.deadline}</Text>
                </View>
              </View>
            </View>
          </AppCard>
        ))}

        {/* 7. Recent Notes */}
        <SectionHeader
          title="Recent Notes"
          actionText="View All"
          onActionPress={() => navigation.navigate('StudentNotesTab')}
        />
        {MOCK_DASHBOARD_NOTES.map((note) => (
          <AppCard
            key={note.id}
            style={styles.noteCard}
            padding="md"
            onPress={() => navigation.navigate('StudentNotesTab')}
          >
            <View style={styles.noteRow}>
              <View style={styles.noteIconWrap}>
                <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.noteContent}>
                <View style={styles.noteSubjectRow}>
                  <Text style={styles.subjectName}>{note.subject}</Text>
                  <Text style={styles.semesterTag}>{note.semester}</Text>
                </View>
                <Text style={styles.noteTitle} numberOfLines={2}>
                  {note.title}
                </Text>
                <View style={styles.noteMetaRow}>
                  <Text style={styles.noteMetaText}>{note.date}</Text>
                  <Text style={styles.noteMetaDot}>•</Text>
                  <Text style={styles.noteMetaText}>{note.fileSize}</Text>
                </View>
              </View>
              <View style={styles.downloadIconBtn}>
                <Ionicons name="arrow-down-circle-outline" size={22} color={COLORS.primary} />
              </View>
            </View>
          </AppCard>
        ))}

        {/* Role Demo Preview Switcher */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  greetingText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
  },
  subGreetingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl + 20,
  },
  searchSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  eventCard: {
    marginBottom: SPACING.sm + 2,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventStatusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  eventTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 6,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: 4,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontSize: 12,
  },
  eventVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventVenueText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  placementCard: {
    marginBottom: SPACING.sm + 2,
  },
  placementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  companyBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  companyBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  placementInfo: {
    flex: 1,
  },
  companyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  companyName: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 15,
  },
  jobRoleText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 2,
  },
  eligibilityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deadlineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '600',
  },
  noteCard: {
    marginBottom: SPACING.sm + 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  noteContent: {
    flex: 1,
  },
  noteSubjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  subjectName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  semesterTag: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  noteTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 18,
  },
  noteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  noteMetaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  noteMetaDot: {
    marginHorizontal: 4,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  downloadIconBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  rolePreviewContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
});
