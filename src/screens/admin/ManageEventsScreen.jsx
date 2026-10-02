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

export default function ManageEventsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState(MOCK_EVENTS);

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateEvent = () => {
    Alert.alert(
      'Schedule Institutional Event',
      'Event scheduling and venue reservation form will open.'
    );
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Cancel Event',
      `Are you sure you want to cancel "${title}"? Registered students will be notified.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Event',
          style: 'destructive',
          onPress: () => setEvents((prev) => prev.filter((e) => e.id !== id)),
        },
      ]
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
        <Text style={styles.rowText}>{item.attendees} Registered Attendees</Text>
      </View>

      <View style={styles.actionsFooter}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            Alert.alert('Edit Event', `Editing details for "${item.title}".`)
          }
        >
          <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.deleteBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Campus Events Admin"
        subtitle="Approve venue reservations and schedule college symposiums"
        showBack
        rightAction={
          <AppButton
            title="New Event"
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
          placeholder="Search events by title or venue..."
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
              title="No Events Found"
              message="No campus events currently registered."
              actionTitle="Create Event"
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
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  actionBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.danger,
    gap: 4,
  },
  deleteBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
  },
});
