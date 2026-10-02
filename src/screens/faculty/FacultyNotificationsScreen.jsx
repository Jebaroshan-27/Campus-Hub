import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { AppHeader, AppCard, EmptyState } from '../../components';

const FACULTY_NOTIFICATIONS = [
  {
    id: 'fn_1',
    title: 'Mid-Term Evaluation Submission',
    desc: 'Please submit CS401 internal grading marks by Friday 5:00 PM.',
    time: '45m ago',
    type: 'academic',
    read: false,
  },
  {
    id: 'fn_2',
    title: 'Academic Council Meeting',
    desc: 'HOD coordination meeting scheduled in Boardroom A on Thursday.',
    time: '3h ago',
    type: 'meeting',
    read: false,
  },
  {
    id: 'fn_3',
    title: 'Student Course Feedback',
    desc: 'Course feedback survey results for Compiler Design are now available.',
    time: 'Yesterday',
    type: 'feedback',
    read: true,
  },
];

export default function FacultyNotificationsScreen() {
  const [notifications, setNotifications] = useState(FACULTY_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const renderItem = ({ item }) => (
    <AppCard
      style={[styles.card, !item.read && styles.unreadCard]}
      padding="md"
      onPress={() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
        );
      }}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={
              item.type === 'meeting'
                ? 'calendar'
                : item.type === 'academic'
                ? 'clipboard-outline'
                : 'chatbox-ellipses-outline'
            }
            size={20}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.contentCol}>
          <View style={styles.topRow}>
            <Text style={[styles.title, !item.read && styles.titleUnread]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.dot} />}
          </View>
          <Text style={styles.desc}>{item.desc}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Faculty Alerts"
        subtitle="Department notices, meeting schedules & deadlines"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markBtn}>
            <Text style={styles.markText}>Mark read</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <View style={styles.filterTabs}>
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'unread', label: 'Unread' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabBtn,
                filter === tab.id && styles.tabBtnActive,
              ]}
              onPress={() => setFilter(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  filter === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="mail-unread-outline"
              title="No New Notices"
              message="You have read all faculty updates and academic notifications."
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
  markBtn: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
  },
  markText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.xs + 4,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  unreadCard: {
    borderLeftWidth: 3.5,
    borderLeftColor: COLORS.secondary,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontSize: 14,
  },
  titleUnread: {
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginLeft: 6,
  },
  desc: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  time: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
});
