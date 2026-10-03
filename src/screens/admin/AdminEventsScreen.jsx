import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import {
  AppHeader,
  AppButton,
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

export default function AdminEventsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
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

      const res = await eventService.getEvents(params);
      if (res && res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Refetch when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });
    return unsubscribe;
  }, [navigation, fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleCreate = () => {
    navigation.navigate('CreateEventScreen');
  };

  const handleEdit = (event) => {
    navigation.navigate('EditEventScreen', {
      event,
      eventId: event._id,
    });
  };

  const handleDelete = (event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to permanently delete "${event.title}"? Associated student registrations will also be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await eventService.deleteEvent(event._id);
              if (res && res.success) {
                Alert.alert('Deleted', 'Event deleted successfully.');
                setEvents((prev) => prev.filter((e) => e._id !== event._id));
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not delete event.');
            }
          },
        },
      ]
    );
  };

  const handleViewRegistrations = (event) => {
    navigation.navigate('EventRegistrationsScreen', {
      eventId: event._id,
      eventTitle: event.title,
    });
  };

  const renderEventItem = ({ item }) => (
    <EventCard
      event={item}
      showManageActions={true}
      onPress={() =>
        navigation.navigate('EventDetails', {
          eventId: item._id,
          eventTitle: item.title,
        })
      }
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
      onViewRegistrations={() => handleViewRegistrations(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Events Administration"
        subtitle="Manage campus symposiums, hackathons & guest talks"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
        onBackPress={() => navigation.goBack()}
        rightAction={
          <AppButton
            title="+ Create Event"
            size="sm"
            onPress={handleCreate}
            icon="add"
          />
        }
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search all institutional events..."
          style={styles.searchBar}
          onClear={() => setSearchQuery('')}
        />

        {/* Type Filter */}
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
                <Text
                  style={[styles.typeBtnText, active && styles.typeBtnTextActive]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && !refreshing ? (
          <LoadingIndicator message="Fetching all campus events..." />
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
                  (searchQuery || selectedType !== 'All'
                    ? 'No events match your criteria.'
                    : 'No campus events have been created yet.')
                }
                actionTitle="+ Create First Event"
                onActionPress={handleCreate}
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
  searchBar: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  typeFilterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
    marginBottom: SPACING.xs,
  },
  typeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  typeBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxxl,
  },
});
