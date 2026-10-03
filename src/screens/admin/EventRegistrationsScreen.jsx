import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, AppCard, Avatar, EmptyState, LoadingIndicator } from '../../components';
import eventService from '../../services/eventService';

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export default function EventRegistrationsScreen({ route, navigation }) {
  const { eventId, eventTitle } = route.params || {};

  const [eventData, setEventData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoster = useCallback(async () => {
    if (!eventId) return;
    try {
      setError(null);
      const res = await eventService.getEventRegistrations(eventId);
      if (res && res.success) {
        setEventData(res.event);
        setRegistrations(res.registrations || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve registrations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoster();
  };

  const renderRegistrationItem = ({ item }) => {
    const student = item.student || {};
    const isPaid = item.paymentStatus === 'paid';

    return (
      <AppCard style={styles.attendeeCard} padding="md">
        <View style={styles.topRow}>
          <View style={styles.studentInfoRow}>
            <Avatar name={student.name || 'Student'} size="md" />
            <View style={styles.nameCol}>
              <Text style={styles.studentName} numberOfLines={1}>
                {student.name || 'Enrolled Student'}
              </Text>
              <Text style={styles.regNoText}>
                Reg No: <Text style={{ fontWeight: '700' }}>{student.registerNumber || 'N/A'}</Text>
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.paymentBadge,
              isPaid ? styles.paidBadge : styles.freeBadge,
            ]}
          >
            <Ionicons
              name={isPaid ? 'checkmark-circle' : 'ticket-outline'}
              size={13}
              color={isPaid ? '#059669' : '#2563EB'}
            />
            <Text
              style={[
                styles.paymentBadgeText,
                isPaid ? styles.paidBadgeText : styles.freeBadgeText,
              ]}
            >
              {isPaid ? 'Paid' : 'RSVP'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="mail-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {student.email || 'Email not provided'}
            </Text>
          </View>

          {student.department && (
            <View style={styles.metaItem}>
              <Ionicons name="school-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>
                {student.department} {student.year ? `(${student.year})` : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.registeredTime}>
            Registered on {formatDate(item.registeredAt)}
          </Text>
          <Text
            style={[
              styles.statusPillText,
              item.registrationStatus === 'registered'
                ? styles.statusActive
                : styles.statusCancelled,
            ]}
          >
            {item.registrationStatus.toUpperCase()}
          </Text>
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title={eventTitle || 'Attendee Roster'}
        subtitle="Registered participants list"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.container}>
        {/* Event Summary Strip */}
        {eventData && (
          <View style={styles.summaryStrip}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{registrations.length}</Text>
              <Text style={styles.summaryLabel}>Total Registered</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>
                {eventData.capacity > 0 ? eventData.capacity : 'Unlimited'}
              </Text>
              <Text style={styles.summaryLabel}>Seat Capacity</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>
                {eventData.isPaid ? `₹${eventData.price}` : 'Free'}
              </Text>
              <Text style={styles.summaryLabel}>Entry Fee</Text>
            </View>
          </View>
        )}

        {loading && !refreshing ? (
          <LoadingIndicator message="Fetching attendee roster..." />
        ) : (
          <FlatList
            data={registrations}
            keyExtractor={(item) => item._id}
            renderItem={renderRegistrationItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No Registrations Yet"
                message={
                  error ||
                  'No students have registered for this event yet. Once registrations begin, attendees will appear here.'
                }
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.primary,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderLight,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  attendeeCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  nameCol: {
    flex: 1,
  },
  studentName: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.text,
  },
  regNoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  freeBadge: {
    backgroundColor: '#EFF6FF',
  },
  paidBadge: {
    backgroundColor: '#ECFDF5',
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  freeBadgeText: {
    color: '#2563EB',
  },
  paidBadgeText: {
    color: '#059669',
  },
  metaRow: {
    gap: 4,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  registeredTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusActive: {
    color: '#15803D',
  },
  statusCancelled: {
    color: COLORS.danger,
  },
});
