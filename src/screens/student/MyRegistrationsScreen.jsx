import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, AppCard, EmptyState, LoadingIndicator } from '../../components';
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
    });
  } catch {
    return dateString;
  }
};

const getStatusBadge = (regStatus, payStatus) => {
  if (regStatus === 'cancelled') {
    return {
      label: 'Cancelled',
      bg: '#FEE2E2',
      text: '#DC2626',
      icon: 'close-circle',
    };
  }

  if (payStatus === 'failed') {
    return {
      label: 'Payment Failed',
      bg: '#FEF2F2',
      text: '#EF4444',
      icon: 'alert-circle',
    };
  }

  if (payStatus === 'pending') {
    return {
      label: 'Payment Pending',
      bg: '#FEF3C7',
      text: '#D97706',
      icon: 'time',
    };
  }

  if (payStatus === 'paid') {
    return {
      label: 'Confirmed (Paid)',
      bg: '#ECFDF5',
      text: '#059669',
      icon: 'checkmark-circle',
    };
  }

  return {
    label: 'Registered (Free)',
    bg: '#EFF6FF',
    text: '#2563EB',
    icon: 'checkmark-circle',
  };
};

export default function MyRegistrationsScreen({ navigation }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setError(null);
      const res = await eventService.getMyRegistrations();
      if (res && res.success) {
        setRegistrations(res.registrations || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your event registrations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistrations();
  };

  const renderRegistrationItem = ({ item }) => {
    const event = item.event;
    if (!event) return null;

    const statusBadge = getStatusBadge(
      item.registrationStatus,
      item.paymentStatus
    );

    return (
      <AppCard
        style={styles.card}
        padding="md"
        onPress={() =>
          navigation.navigate('EventDetails', {
            eventId: event._id,
            eventTitle: event.title,
          })
        }
      >
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: statusBadge.bg }]}>
            <Ionicons
              name={statusBadge.icon}
              size={14}
              color={statusBadge.text}
            />
            <Text style={[styles.badgeText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>

          <Text style={styles.dateText}>{formatDate(event.eventDate)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color={COLORS.primary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={15} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            {event.startTime} - {event.endTime}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.registeredAtText}>
            Booked on {formatDate(item.registeredAt)}
          </Text>
          <View style={styles.viewPassRow}>
            <Text style={styles.viewPassText}>View Event</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="My Registrations"
        subtitle="Your confirmed passes & RSVP roster"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.container}>
        {loading && !refreshing ? (
          <LoadingIndicator message="Fetching your registrations..." />
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
                icon="ticket-outline"
                title="No Registrations Yet"
                message="You have not registered for any campus events yet. Explore upcoming hackathons and workshops to get started!"
                actionTitle="Browse Events"
                onActionPress={() => navigation.navigate('StudentEventsTab')}
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
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  card: {
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
    marginBottom: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  registeredAtText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  viewPassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewPassText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
