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
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { AppHeader, AppCard, EmptyState, StatusBadge } from '../../components';
import { MOCK_STUDENT_NOTIFICATIONS } from '../../constants/mockStudentData';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_STUDENT_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'placement') return item.type === 'placement';
    if (activeFilter === 'event') return item.type === 'event';
    if (activeFilter === 'message') return item.type === 'message' || item.type === 'connection';
    return true;
  });

  const getCategoryTheme = (type) => {
    switch (type) {
      case 'placement':
        return {
          icon: 'briefcase-outline',
          iconColor: COLORS.success,
          bgColor: COLORS.successLight,
          label: 'Placement',
          variant: 'success',
        };
      case 'event':
        return {
          icon: 'calendar-outline',
          iconColor: COLORS.warning,
          bgColor: COLORS.warningLight,
          label: 'Campus Event',
          variant: 'warning',
        };
      case 'connection':
        return {
          icon: 'person-add-outline',
          iconColor: COLORS.accent,
          bgColor: COLORS.accentLight,
          label: 'Network',
          variant: 'secondary',
        };
      case 'message':
        return {
          icon: 'chatbubble-ellipses-outline',
          iconColor: COLORS.primary,
          bgColor: COLORS.primaryTint,
          label: 'Message',
          variant: 'primary',
        };
      case 'notes':
      default:
        return {
          icon: 'document-text-outline',
          iconColor: COLORS.info,
          bgColor: COLORS.infoLight,
          label: 'Courseware',
          variant: 'info',
        };
    }
  };

  const renderNotificationItem = ({ item }) => {
    const config = getCategoryTheme(item.type);

    return (
      <AppCard
        style={[styles.card, !item.read && styles.unreadCard]}
        padding="md"
        onPress={() => handleToggleRead(item.id)}
      >
        <View style={styles.cardRow}>
          <View style={[styles.iconWrap, { backgroundColor: config.bgColor }]}>
            <Ionicons name={item.icon || config.icon} size={20} color={config.iconColor} />
          </View>

          <View style={styles.contentCol}>
            <View style={styles.topRow}>
              <View style={styles.badgeRow}>
                <StatusBadge label={config.label} variant={config.variant} size="sm" />
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
            </View>

            <Text style={[styles.titleText, !item.read && styles.titleUnread]}>
              {item.title}
            </Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Notification Center"
        subtitle="Academic updates, drives & peer alerts"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Filter Pills */}
        <View style={styles.filterTabs}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: 'Unread' },
            { id: 'placement', label: 'Placements' },
            { id: 'event', label: 'Events' },
            { id: 'message', label: 'Peers' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabBtn,
                activeFilter === tab.id && styles.tabBtnActive,
              ]}
              onPress={() => setActiveFilter(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={`Filter by ${tab.label}`}
            >
              <Text
                style={[
                  styles.tabText,
                  activeFilter === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="No Notifications Found"
              message={
                activeFilter === 'unread'
                  ? 'All notifications have been read. Check back soon for campus announcements.'
                  : 'There are no notifications matching your current filter.'
              }
              actionTitle={activeFilter !== 'all' ? 'View All Alerts' : undefined}
              onActionPress={() => setActiveFilter('all')}
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
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.xs,
  },
  markAllText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: SPACING.md,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
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
    fontSize: 11,
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
    borderLeftColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  timestampText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  titleText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 2,
  },
  titleUnread: {
    fontWeight: '700',
  },
  messageText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
