import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { AppHeader, AppCard, AppButton, SearchBar, EmptyState } from '../../components';
import { MOCK_EVENTS } from '../../constants/mockData';

export default function FacultyEventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState(MOCK_EVENTS);

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateEvent = () => {
    Alert.alert(
      'Schedule Academic Event',
      'Event scheduling form will open to configure title, hall venue, and student capacity.'
    );
  };

  const renderEventItem = ({ item }) => (
    <AppCard style={styles.card} padding="lg">
      <View style={styles.headerRow}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{item.category}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
        <Text style={styles.rowText}>{item.date}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color={COLORS.primary} />
        <Text style={styles.rowText}>{item.venue}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.rowText}>{item.attendees} Registered Students</Text>
      </View>

      <View style={styles.footerRow}>
        <AppButton
          title="View Attendees List"
          size="sm"
          variant="outline"
          onPress={() =>
            Alert.alert(
              'Attendee Roster',
              `Showing ${item.attendees} student registrations for "${item.title}".`
            )
          }
          icon="list-outline"
          style={styles.rosterBtn}
        />
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Department Events"
        subtitle="Organize workshops, guest lectures & technical meets"
        rightAction={
          <AppButton
            title="Create"
            size="sm"
            icon="add"
            onPress={handleCreateEvent}
          />
        }
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter scheduled events..."
          style={styles.searchBar}
        />

        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No Department Events"
              message="Schedule workshops or symposiums for your department."
              actionTitle="Schedule Event"
              onActionPress={handleCreateEvent}
            />
          }
        />
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
    marginVertical: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  catBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  catText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  statusBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 6,
  },
  rowText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  footerRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  rosterBtn: {
    alignSelf: 'flex-start',
  },
});
