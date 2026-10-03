import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import {
  AppHeader,
  SearchBar,
  EmptyState,
  LoadingIndicator,
  EventCard,
} from '../../components';
import eventService from '../../services/eventService';

const EVENT_TYPES = [
  'All',
  'Workshop',
  'Seminar',
  'Hackathon',
  'Technical',
  'Cultural',
  'Sports',
];

const PRICING_OPTIONS = ['All', 'Free', 'Paid'];

export default function EventsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const params = {};

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedType !== 'All') {
        params.eventType = selectedType;
      }

      if (selectedPricing === 'Free') {
        params.isPaid = false;
      } else if (selectedPricing === 'Paid') {
        params.isPaid = true;
      }

      const res = await eventService.getEvents(params);
      if (res && res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load events. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedType, selectedPricing]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedPricing('All');
  };

  const handleOpenDetails = (event) => {
    navigation.navigate('EventDetails', {
      eventId: event._id,
      eventTitle: event.title,
    });
  };

  const renderEventItem = ({ item }) => (
    <EventCard
      event={item}
      isRegistered={item.isUserRegistered}
      onPress={() => handleOpenDetails(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Events"
        subtitle="Workshops, hackathons, symposiums & college fests"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
        rightAction={
          <TouchableOpacity
            style={styles.myTicketsBtn}
            onPress={() => navigation.navigate('MyRegistrations')}
            activeOpacity={0.7}
          >
            <Ionicons name="ticket-outline" size={16} color={COLORS.primary} />
            <Text style={styles.myTicketsText}>My RSVPs</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Search Input */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search events by title, organizer, or venue..."
          style={styles.searchBar}
          onClear={() => setSearchQuery('')}
        />

        {/* Filters Row: Event Types & Pricing */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeFilterRow}
          >
            {EVENT_TYPES.map((type) => {
              const active = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, active && styles.typeBtnActive]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Pricing Chips (Free / Paid) */}
          <View style={styles.pricingRow}>
            <Text style={styles.filterLabel}>Fee:</Text>
            {PRICING_OPTIONS.map((pricing) => {
              const active = selectedPricing === pricing;
              return (
                <TouchableOpacity
                  key={pricing}
                  style={[styles.pricingPill, active && styles.pricingPillActive]}
                  onPress={() => setSelectedPricing(pricing)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pricingPillText,
                      active && styles.pricingPillTextActive,
                    ]}
                  >
                    {pricing}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Content Area */}
        {loading && !refreshing ? (
          <LoadingIndicator message="Fetching latest campus events..." />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            renderItem={renderEventItem}
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
                icon="calendar-outline"
                title="No Events Found"
                message={
                  error ||
                  (searchQuery || selectedType !== 'All' || selectedPricing !== 'All'
                    ? 'No events match your current filter settings.'
                    : 'No campus events currently scheduled. Check back soon.')
                }
                actionTitle="Reset Filters"
                onActionPress={resetFilters}
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
  myTicketsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primaryTint,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  myTicketsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  searchBar: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filterSection: {
    marginBottom: SPACING.sm,
  },
  typeFilterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  typeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  filterLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 11,
  },
  pricingPill: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pricingPillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  pricingPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  pricingPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxxl,
  },
});
