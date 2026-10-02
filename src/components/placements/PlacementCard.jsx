import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import AppCard from '../AppCard';

const formatDeadline = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const getCompanyInitials = (name = '') => {
  if (!name) return 'CH';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function PlacementCard({
  placement,
  onPress,
  onEdit,
  onDelete,
  showAdminActions = false,
  style,
}) {
  if (!placement) return null;

  const now = new Date();
  const isDeadlinePassed = placement.applicationDeadline && new Date(placement.applicationDeadline) < now;
  const isClosed = placement.status === 'closed' || isDeadlinePassed;
  const formattedDeadline = formatDeadline(placement.applicationDeadline);
  const initials = getCompanyInitials(placement.companyName);

  return (
    <AppCard style={[styles.card, style]} padding="md" onPress={onPress}>
      {/* 1. Header: Company Badge, Name, Role & Status */}
      <View style={styles.headerRow}>
        <View style={styles.companyBadge}>
          <Text style={styles.companyBadgeText}>{initials}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {placement.companyName}
          </Text>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {placement.jobTitle}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isClosed ? styles.statusClosed : styles.statusOpen,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isClosed ? COLORS.danger : COLORS.success },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isClosed ? styles.statusTextClosed : styles.statusTextOpen,
            ]}
          >
            {isClosed ? 'Closed' : 'Active'}
          </Text>
        </View>
      </View>

      {/* 2. Compensation & Location Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>SALARY PACKAGE</Text>
          <Text style={styles.salaryText} numberOfLines={1}>
            {placement.salary}
          </Text>
        </View>

        <View style={styles.dividerVertical} />

        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>LOCATION & MODE</Text>
          <View style={styles.modeRow}>
            <Text style={styles.locationText} numberOfLines={1}>
              {placement.location}
            </Text>
            {placement.workMode ? (
              <View style={styles.workModeChip}>
                <Text style={styles.workModeText}>{placement.workMode}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* 3. Eligibility Summary */}
      {placement.eligibility ? (
        <View style={styles.eligibilityRow}>
          <Ionicons name="school-outline" size={15} color={COLORS.textSecondary} />
          <Text style={styles.eligibilityText} numberOfLines={1}>
            {placement.eligibility}
          </Text>
        </View>
      ) : null}

      {/* 4. Application Deadline */}
      <View style={styles.deadlineRow}>
        <Ionicons
          name="alarm-outline"
          size={15}
          color={isClosed ? COLORS.danger : COLORS.warning}
        />
        <Text
          style={[
            styles.deadlineText,
            isClosed && { color: COLORS.danger, fontWeight: '700' },
          ]}
        >
          Deadline: {formattedDeadline}
          {isDeadlinePassed ? ' (Expired)' : ''}
        </Text>
      </View>

      {/* 5. Footer Actions */}
      <View style={styles.footerRow}>
        {showAdminActions ? (
          <View style={styles.adminActions}>
            {onEdit && (
              <TouchableOpacity
                style={styles.adminEditBtn}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  onEdit(placement);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={15} color={COLORS.primary} />
                <Text style={styles.adminEditBtnText}>Edit</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.adminDeleteBtn}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  onDelete(placement);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                <Text style={styles.adminDeleteBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.spacer} />
        )}

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  companyBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  companyBadgeText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  headerInfo: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  companyName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  jobTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusOpen: {
    backgroundColor: COLORS.successLight,
  },
  statusClosed: {
    backgroundColor: COLORS.dangerLight,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
  },
  statusText: {
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
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHover,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  statColumn: {
    flex: 1,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  salaryText: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 13,
  },
  locationText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '65%',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workModeChip: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
  },
  workModeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  dividerVertical: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  eligibilityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  deadlineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  spacer: {
    flex: 1,
  },
  adminActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  adminEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceHover,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adminEditBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  adminDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerLight,
  },
  adminDeleteBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 11,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  viewDetailsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
