import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, AppCard, AppButton, LoadingIndicator } from '../../components';
import { getPlacementById } from '../../services/placementService';
import { useAuth } from '../../context/AuthContext';

const formatDeadline = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function PlacementDetailsScreen({ route, navigation }) {
  const { placementId, placement: initialPlacement } = route.params || {};
  const { user } = useAuth();

  const [placement, setPlacement] = useState(initialPlacement || null);
  const [loading, setLoading] = useState(!initialPlacement);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    const id = placementId || initialPlacement?._id || initialPlacement?.id;
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getPlacementById(id);
      if (res?.placement) {
        setPlacement(res.placement);
      }
    } catch (err) {
      setError(err.message || 'Unable to load placement drive details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [placementId]);

  const handleApply = async () => {
    const url = placement?.applicationUrl;
    if (!url) {
      Alert.alert('No Application Link', 'The application URL is not specified for this drive.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err) {
      Alert.alert(
        'Unable to Open URL',
        'Could not open the company application link. Please check your browser or internet connection.'
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          title="Placement Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <LoadingIndicator message="Loading placement drive..." fullScreen />
      </SafeAreaView>
    );
  }

  if (error || !placement) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          title="Placement Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Drive Not Found</Text>
          <Text style={styles.errorMessage}>{error || 'The requested placement drive is unavailable.'}</Text>
          <AppButton
            title="Try Again"
            size="sm"
            onPress={fetchDetails}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const now = new Date();
  const isDeadlinePassed =
    placement.applicationDeadline && new Date(placement.applicationDeadline) < now;
  const isClosed = placement.status === 'closed' || isDeadlinePassed;
  const formattedDeadline = formatDeadline(placement.applicationDeadline);

  // Evaluate student eligibility against stored student profile data
  const studentDept = user?.department;
  const studentYear = user?.year;
  const eligibleDepts = placement.eligibleDepartments || [];
  const eligibleYrs = placement.eligibleYears || [];

  const deptMatch =
    eligibleDepts.length === 0 || (studentDept && eligibleDepts.includes(studentDept));
  const yearMatch =
    eligibleYrs.length === 0 || (studentYear && eligibleYrs.includes(studentYear));
  const isEligible = deptMatch && yearMatch;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Placement Drive"
        subtitle={placement.companyName}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Main Header Card */}
        <AppCard style={styles.mainCard} padding="lg">
          <View style={styles.headerTop}>
            <View style={styles.companyBadge}>
              <Text style={styles.companyBadgeText}>
                {placement.companyName ? placement.companyName.substring(0, 2).toUpperCase() : 'CH'}
              </Text>
            </View>

            <View style={styles.headerTitles}>
              <Text style={styles.companyName}>{placement.companyName}</Text>
              <Text style={styles.jobTitle}>{placement.jobTitle}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isClosed ? styles.statusBadgeClosed : styles.statusBadgeOpen,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isClosed ? styles.statusTextClosed : styles.statusTextOpen,
                ]}
              >
                {isClosed ? 'Closed' : 'Active Drive'}
              </Text>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PACKAGE</Text>
              <Text style={styles.metricVal}>{placement.salary}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>LOCATION</Text>
              <Text style={styles.metricValText}>{placement.location}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>WORK MODE</Text>
              <Text style={styles.metricValText}>{placement.workMode || 'On-site'}</Text>
            </View>
          </View>
        </AppCard>

        {/* 2. Job Description */}
        <AppCard style={styles.sectionCard} padding="lg">
          <Text style={styles.sectionTitle}>Role Overview & Responsibilities</Text>
          <Text style={styles.descriptionText}>{placement.description}</Text>
        </AppCard>

        {/* 3. Eligibility Criteria */}
        <AppCard style={styles.sectionCard} padding="lg">
          <View style={styles.eligibilityHeader}>
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>

            {user?.role === 'student' && (
              <View
                style={[
                  styles.matchBadge,
                  isEligible ? styles.matchBadgeEligible : styles.matchBadgeWarning,
                ]}
              >
                <Ionicons
                  name={isEligible ? 'checkmark-circle' : 'information-circle'}
                  size={14}
                  color={isEligible ? COLORS.success : COLORS.warning}
                />
                <Text
                  style={[
                    styles.matchBadgeText,
                    isEligible ? styles.matchTextEligible : styles.matchTextWarning,
                  ]}
                >
                  {isEligible ? 'Eligible for your profile' : 'Review requirements'}
                </Text>
              </View>
            )}
          </View>

          {/* Criteria Grid */}
          <View style={styles.criteriaGrid}>
            <View style={styles.criteriaItem}>
              <Ionicons name="ribbon-outline" size={18} color={COLORS.primary} />
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>Minimum CGPA</Text>
                <Text style={styles.criteriaValue}>
                  {placement.minimumCGPA > 0
                    ? `${placement.minimumCGPA} CGPA or higher`
                    : 'No minimum cutoff'}
                </Text>
              </View>
            </View>

            <View style={styles.criteriaItem}>
              <Ionicons name="school-outline" size={18} color={COLORS.primary} />
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>Eligible Departments</Text>
                <Text style={styles.criteriaValue}>
                  {eligibleDepts.length > 0
                    ? eligibleDepts.join(', ')
                    : 'All Academic Departments'}
                </Text>
              </View>
            </View>

            <View style={styles.criteriaItem}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>Eligible Batches / Years</Text>
                <Text style={styles.criteriaValue}>
                  {eligibleYrs.length > 0
                    ? eligibleYrs.join(', ')
                    : 'All Academic Years'}
                </Text>
              </View>
            </View>
          </View>

          {/* Required Skills */}
          {placement.skills && placement.skills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.skillsLabel}>Recommended Skills & Tech Stack</Text>
              <View style={styles.skillsWrap}>
                {placement.skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Other Eligibility Notes */}
          {placement.eligibility ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Additional Guidelines</Text>
              <Text style={styles.notesText}>{placement.eligibility}</Text>
            </View>
          ) : null}
        </AppCard>

        {/* 4. Application Timeline & Deadline */}
        <AppCard style={styles.sectionCard} padding="md">
          <View style={styles.timelineRow}>
            <View style={[styles.timelineIcon, isClosed && { backgroundColor: COLORS.dangerLight }]}>
              <Ionicons
                name="time-outline"
                size={22}
                color={isClosed ? COLORS.danger : COLORS.warning}
              />
            </View>

            <View style={styles.timelineInfo}>
              <Text style={styles.timelineTitle}>
                {isClosed ? 'Applications Closed' : 'Application Deadline'}
              </Text>
              <Text
                style={[
                  styles.timelineDate,
                  isClosed && { color: COLORS.danger, fontWeight: '700' },
                ]}
              >
                {formattedDeadline}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* 5. External Application Button */}
        <View style={styles.actionContainer}>
          <AppButton
            title={isClosed ? 'Applications Closed' : 'Apply on Company Website'}
            icon={isClosed ? 'lock-closed-outline' : 'open-outline'}
            size="lg"
            variant={isClosed ? 'secondary' : 'primary'}
            onPress={handleApply}
            disabled={isClosed}
            style={styles.applyBtn}
          />

          {!isClosed && (
            <Text style={styles.redirectNotice}>
              You will be redirected to {placement.companyName}&apos;s official career portal to complete your application.
            </Text>
          )}
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
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl + 20,
  },
  mainCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  companyBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  companyBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  headerTitles: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  companyName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  jobTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusBadgeOpen: {
    backgroundColor: COLORS.successLight,
  },
  statusBadgeClosed: {
    backgroundColor: COLORS.dangerLight,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: COLORS.success,
  },
  statusTextClosed: {
    color: COLORS.danger,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHover,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricVal: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 13,
  },
  metricValText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 12,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  matchBadgeEligible: {
    backgroundColor: COLORS.successLight,
  },
  matchBadgeWarning: {
    backgroundColor: COLORS.warningLight,
  },
  matchBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  matchTextEligible: {
    color: COLORS.success,
  },
  matchTextWarning: {
    color: COLORS.warning,
  },
  criteriaGrid: {
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  criteriaContent: {
    flex: 1,
  },
  criteriaLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 1,
  },
  criteriaValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  skillsSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  skillsLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  skillChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  notesLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  notesText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  timelineIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timelineDate: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  actionContainer: {
    marginTop: SPACING.md,
  },
  applyBtn: {
    width: '100%',
  },
  redirectNotice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
