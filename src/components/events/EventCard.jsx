import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import AppCard from '../AppCard';

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'TBA';
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

const getCategoryColor = (type = '') => {
  switch (type.toLowerCase()) {
    case 'hackathon':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    case 'workshop':
      return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
    case 'seminar':
      return { bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF' };
    case 'technical':
      return { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' };
    case 'cultural':
      return { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3' };
    case 'sports':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
  }
};

export default function EventCard({
  event,
  onPress,
  onEdit,
  onDelete,
  onViewRegistrations,
  showManageActions = false,
  isRegistered = false,
  style,
}) {
  if (!event) return null;

  const categoryColor = getCategoryColor(event.eventType);
  const formattedDate = formatDisplayDate(event.eventDate);
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.effectiveStatus === 'completed' || event.status === 'completed';
  const isFull = event.isFull;

  let statusBadgeText = 'Upcoming';
  let statusBadgeStyle = styles.badgeUpcoming;
  let statusTextStyle = styles.badgeTextUpcoming;

  if (isCancelled) {
    statusBadgeText = 'Cancelled';
    statusBadgeStyle = styles.badgeCancelled;
    statusTextStyle = styles.badgeTextCancelled;
  } else if (isCompleted) {
    statusBadgeText = 'Completed';
    statusBadgeStyle = styles.badgeCompleted;
    statusTextStyle = styles.badgeTextCompleted;
  } else if (event.status === 'ongoing') {
    statusBadgeText = 'Live Now';
    statusBadgeStyle = styles.badgeLive;
    statusTextStyle = styles.badgeTextLive;
  }

  return (
    <AppCard style={[styles.card, style]} padding="md" onPress={onPress}>
      {/* 1. Header: Type Badge, Paid/Free Pill & Status */}
      <View style={styles.topRow}>
        <View style={styles.leftPills}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: categoryColor.bg,
                borderColor: categoryColor.border,
              },
            ]}
          >
            <Text
              style={[styles.typeBadgeText, { color: categoryColor.text }]}
              numberOfLines={1}
            >
              {event.eventType}
            </Text>
          </View>

          <View
            style={[
              styles.pricingBadge,
              event.isPaid ? styles.paidBadge : styles.freeBadge,
            ]}
          >
            <Text
              style={[
                styles.pricingBadgeText,
                event.isPaid ? styles.paidText : styles.freeText,
              ]}
            >
              {event.isPaid ? `₹${event.price}` : 'FREE'}
            </Text>
          </View>

          {isRegistered && (
            <View style={styles.registeredBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#15803D" />
              <Text style={styles.registeredBadgeText}>Registered</Text>
            </View>
          )}
        </View>

        <View style={[styles.statusBadge, statusBadgeStyle]}>
          <Text style={[styles.statusBadgeText, statusTextStyle]}>
            {statusBadgeText}
          </Text>
        </View>
      </View>

      {/* 2. Event Title */}
      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>

      {/* 3. Organizer & Department */}
      <View style={styles.metaRow}>
        <Ionicons name="school-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.metaText} numberOfLines={1}>
          {event.organizer} {event.department ? `• ${event.department}` : ''}
        </Text>
      </View>

      {/* 4. Schedule & Venue Details */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCol}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.infoText}>{formattedDate}</Text>
        </View>

        <View style={styles.infoCol}>
          <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          <Text style={styles.infoText}>{event.startTime || 'TBA'}</Text>
        </View>

        <View style={styles.infoColWide}>
          <Ionicons name="location-outline" size={14} color={COLORS.primary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>
      </View>

      {/* 5. Capacity / Attendees Info */}
      <View style={styles.capacityRow}>
        <View style={styles.capacityCol}>
          <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.capacityText}>
            {event.registeredCount !== undefined
              ? `${event.registeredCount} registered`
              : 'Registrations open'}
            {event.capacity > 0 ? ` / ${event.capacity} seats` : ' (Unlimited)'}
          </Text>
        </View>

        {isFull && !isCompleted && !isCancelled && (
          <Text style={styles.fullNotice}>Seats Full</Text>
        )}
      </View>

      {/* 6. Footer Action Bar */}
      <View style={styles.footerRow}>
        {showManageActions ? (
          <View style={styles.manageActionsRow}>
            {onViewRegistrations && (
              <TouchableOpacity
                style={styles.rosterBtn}
                onPress={onViewRegistrations}
                activeOpacity={0.7}
              >
                <Ionicons name="list" size={15} color={COLORS.primary} />
                <Text style={styles.rosterBtnText}>Registrations</Text>
              </TouchableOpacity>
            )}

            <View style={styles.editDeleteGroup}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={onEdit}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-outline" size={15} color={COLORS.textSecondary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={15} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  leftPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pricingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  freeBadge: {
    backgroundColor: '#ECFDF5',
  },
  paidBadge: {
    backgroundColor: '#EFF6FF',
  },
  pricingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  freeText: {
    color: '#059669',
  },
  paidText: {
    color: '#1D4ED8',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  registeredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeUpcoming: {
    backgroundColor: '#F1F5F9',
  },
  badgeTextUpcoming: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeLive: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextLive: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeCompleted: {
    backgroundColor: '#F3F4F6',
  },
  badgeTextCompleted: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeCancelled: {
    backgroundColor: '#FEE2E2',
  },
  badgeTextCancelled: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: SPACING.sm,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginBottom: 6,
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoColWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 110,
  },
  infoText: {
    ...TYPOGRAPHY.body2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  capacityCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  fullNotice: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewDetailsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  manageActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rosterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryTint,
  },
  rosterBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  editDeleteGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
});
