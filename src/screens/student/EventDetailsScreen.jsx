import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, AppCard, AppButton, LoadingIndicator } from '../../components';
import eventService from '../../services/eventService';
import { launchRazorpayCheckout } from '../../services/razorpayMobileService';

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId, eventTitle } = route.params || {};

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    if (!eventId) return;
    try {
      setError(null);
      const res = await eventService.getEventById(eventId);
      if (res && res.success) {
        setEvent(res.event);
        setIsRegistered(Boolean(res.event.isUserRegistered));
        setRegistrationData(res.event.userRegistration || null);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve event information.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Handle Free Registration
  const handleFreeRegistration = async () => {
    try {
      setRegistering(true);
      const res = await eventService.registerFreeEvent(eventId);
      if (res && res.success) {
        setIsRegistered(true);
        setRegistrationData(res.registration);
        Alert.alert(
          'Registration Confirmed! 🎉',
          `You have successfully registered for "${event.title}". View your confirmed passes under My RSVPs.`,
          [
            {
              text: 'View My RSVPs',
              onPress: () => navigation.navigate('MyRegistrations'),
            },
            { text: 'OK' },
          ]
        );
        fetchDetails();
      }
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not register for this event.');
    } finally {
      setRegistering(false);
    }
  };

  // Handle Paid Event Registration with Razorpay
  const handlePaidRegistration = async () => {
    try {
      setRegistering(true);

      // Step 1: Create Razorpay Order on Backend
      const orderRes = await eventService.createPaymentOrder(eventId);
      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || 'Could not generate Razorpay order.');
      }

      // Step 2: Open Mobile Razorpay Checkout
      const paymentResult = await launchRazorpayCheckout(orderRes);

      // Step 3: Backend Cryptographic Signature Verification
      const verifyRes = await eventService.verifyPayment(eventId, {
        razorpayOrderId: paymentResult.razorpayOrderId,
        razorpayPaymentId: paymentResult.razorpayPaymentId,
        razorpaySignature: paymentResult.razorpaySignature,
      });

      if (verifyRes && verifyRes.success) {
        setIsRegistered(true);
        setRegistrationData(verifyRes.registration);
        Alert.alert(
          'Payment & Registration Confirmed! 🎉',
          `Payment of ₹${event.price} verified successfully. Your booking is confirmed.`,
          [
            {
              text: 'View Pass',
              onPress: () => navigation.navigate('MyRegistrations'),
            },
            { text: 'Done' },
          ]
        );
        fetchDetails();
      }
    } catch (err) {
      Alert.alert(
        'Payment Incomplete',
        err.message || 'Payment verification was not completed.'
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterPress = () => {
    if (!event) return;
    if (event.isPaid) {
      handlePaidRegistration();
    } else {
      handleFreeRegistration();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          title={eventTitle || 'Event Details'}
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <LoadingIndicator message="Loading event details..." />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader title="Event Details" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Event Unavailable</Text>
          <Text style={styles.errorMessage}>{error || 'Event could not be found.'}</Text>
          <AppButton
            title="Go Back"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Determine state of registration button
  const now = new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < now;
  const isCancelled = event.status === 'cancelled';
  const isCompleted =
    event.effectiveStatus === 'completed' || event.status === 'completed';
  const isFull = event.isFull;

  let buttonDisabled = false;
  let buttonTitle = '';
  let buttonVariant = 'primary';
  let buttonIcon = 'ticket-outline';

  if (isRegistered) {
    buttonDisabled = true;
    buttonTitle = 'Registered';
    buttonVariant = 'success';
    buttonIcon = 'checkmark-circle';
  } else if (isCancelled) {
    buttonDisabled = true;
    buttonTitle = 'Event Cancelled';
    buttonVariant = 'danger';
    buttonIcon = 'close-circle-outline';
  } else if (isCompleted) {
    buttonDisabled = true;
    buttonTitle = 'Event Concluded';
    buttonVariant = 'secondary';
    buttonIcon = 'time-outline';
  } else if (isDeadlinePassed) {
    buttonDisabled = true;
    buttonTitle = 'Registration Closed';
    buttonVariant = 'secondary';
    buttonIcon = 'alarm-outline';
  } else if (isFull) {
    buttonDisabled = true;
    buttonTitle = 'Event Full';
    buttonVariant = 'secondary';
    buttonIcon = 'people-outline';
  } else if (event.isPaid) {
    buttonTitle = `Register & Pay ₹${event.price}`;
    buttonVariant = 'primary';
    buttonIcon = 'card-outline';
  } else {
    buttonTitle = 'Register';
    buttonVariant = 'primary';
    buttonIcon = 'checkmark-circle-outline';
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title={event.title}
        subtitle={`${event.eventType} • ${event.organizer}`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Registration Status Banner if student registered */}
        {isRegistered && (
          <View style={styles.registeredBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#15803D" />
            <View style={styles.registeredBannerTextCol}>
              <Text style={styles.registeredBannerTitle}>
                You're Registered for this Event!
              </Text>
              <Text style={styles.registeredBannerSub}>
                Payment Status:{' '}
                <Text style={{ fontWeight: '700' }}>
                  {registrationData?.paymentStatus === 'paid'
                    ? 'Paid (Verified)'
                    : 'Free RSVP'}
                </Text>
              </Text>
            </View>
          </View>
        )}

        {/* 1. Header Hero Card */}
        <AppCard style={styles.heroCard} padding="lg">
          <View style={styles.badgesRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{event.eventType}</Text>
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
                {event.isPaid ? `₹${event.price} (Paid)` : 'FREE ENTRY'}
              </Text>
            </View>
            {event.status === 'cancelled' && (
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledBadgeText}>Cancelled</Text>
              </View>
            )}
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.organizerRow}>
            <Ionicons name="school-outline" size={16} color={COLORS.primary} />
            <Text style={styles.organizerText}>
              Organized by <Text style={{ fontWeight: '700' }}>{event.organizer}</Text>
            </Text>
          </View>
          {event.department && (
            <Text style={styles.deptText}>Department: {event.department}</Text>
          )}
        </AppCard>

        {/* 2. Key Logistics Grid */}
        <AppCard style={styles.sectionCard} padding="md">
          <Text style={styles.sectionHeading}>Date, Time & Venue</Text>

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>EVENT DATE</Text>
              <Text style={styles.detailValue}>{formatDate(event.eventDate)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>TIMINGS</Text>
              <Text style={styles.detailValue}>
                {event.startTime} - {event.endTime}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>VENUE / AUDITORIUM</Text>
              <Text style={styles.detailValue}>{event.venue}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="alarm" size={18} color={COLORS.warning} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>REGISTRATION DEADLINE</Text>
              <Text style={styles.detailValue}>
                {formatDate(event.registrationDeadline)}
              </Text>
              {isDeadlinePassed && (
                <Text style={styles.deadlinePassedNote}>
                  Registration deadline has passed
                </Text>
              )}
            </View>
          </View>
        </AppCard>

        {/* 3. Capacity & Pricing */}
        <AppCard style={styles.sectionCard} padding="md">
          <Text style={styles.sectionHeading}>Participation & Seats</Text>

          <View style={styles.statsTwoCol}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>REGISTERED</Text>
              <Text style={styles.statBoxVal}>{event.registeredCount || 0}</Text>
              <Text style={styles.statBoxSub}>students attending</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>CAPACITY</Text>
              <Text style={styles.statBoxVal}>
                {event.capacity > 0 ? event.capacity : '∞'}
              </Text>
              <Text style={styles.statBoxSub}>
                {event.capacity > 0 ? 'maximum seats' : 'unlimited seats'}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* 4. Event Description */}
        <AppCard style={styles.sectionCard} padding="md">
          <Text style={styles.sectionHeading}>About the Event</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </AppCard>
      </ScrollView>

      {/* Floating Registration Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceColumn}>
          <Text style={styles.bottomBarFeeLabel}>REGISTRATION FEE</Text>
          <Text style={styles.bottomBarPrice}>
            {event.isPaid ? `₹${event.price}` : 'FREE'}
          </Text>
        </View>

        <View style={styles.buttonColumn}>
          <AppButton
            title={buttonTitle}
            onPress={handleRegisterPress}
            disabled={buttonDisabled || registering}
            loading={registering}
            variant={buttonVariant}
            icon={buttonIcon}
            size="md"
          />
        </View>
      </View>
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
    paddingTop: SPACING.sm,
    paddingBottom: 110,
  },
  registeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  registeredBannerTextCol: {
    flex: 1,
  },
  registeredBannerTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: '#15803D',
  },
  registeredBannerSub: {
    ...TYPOGRAPHY.caption,
    color: '#166534',
    marginTop: 2,
  },
  heroCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryTint,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pricingBadge: {
    paddingHorizontal: 8,
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
  cancelledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FEE2E2',
  },
  cancelledBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  eventTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 6,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  organizerText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  deptText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
  },
  deadlinePassedNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
    marginTop: 2,
  },
  statsTwoCol: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBoxLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  statBoxVal: {
    ...TYPOGRAPHY.h2,
    fontSize: 22,
    color: COLORS.primary,
    marginVertical: 2,
  },
  statBoxSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  descriptionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.md,
  },
  priceColumn: {
    justifyContent: 'center',
  },
  bottomBarFeeLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  bottomBarPrice: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.primary,
  },
  buttonColumn: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  errorMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
