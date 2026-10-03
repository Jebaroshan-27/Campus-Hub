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
import {
  AppHeader,
  AppCard,
  Avatar,
  SearchBar,
  EmptyState,
  LoadingIndicator,
} from '../../components';
import connectionService from '../../services/connectionService';

export default function ChatListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAcceptedConnections = useCallback(async () => {
    try {
      setError(null);
      const res = await connectionService.getConnections();
      if (res && res.success) {
        setConnections(res.accepted || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAcceptedConnections();
  }, [fetchAcceptedConnections]);

  // Refetch when focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAcceptedConnections();
    });
    return unsubscribe;
  }, [navigation, fetchAcceptedConnections]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAcceptedConnections();
  };

  const filteredConnections = connections.filter((item) => {
    const partner = item.partner || {};
    const nameMatch = (partner.name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const regMatch = (partner.registerNumber || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return nameMatch || regMatch;
  });

  const handleOpenChat = (item) => {
    const partner = item.partner;
    if (!partner) return;

    navigation.navigate('ChatScreen', {
      userId: partner._id,
      partnerName: partner.name,
      partnerRegNo: partner.registerNumber,
      partnerAvatar: partner.profileImage,
      partnerDepartment: partner.department,
      connectionId: item._id,
    });
  };

  const renderChatItem = ({ item }) => {
    const partner = item.partner;
    if (!partner) return null;

    return (
      <AppCard
        style={styles.chatCard}
        padding="md"
        onPress={() => handleOpenChat(item)}
      >
        <View style={styles.cardRow}>
          <Avatar name={partner.name} size="md" />

          <View style={styles.contentCol}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={1}>
                {partner.name}
              </Text>
              <Text style={styles.regNoBadge}>
                {partner.registerNumber}
              </Text>
            </View>

            <Text style={styles.deptText} numberOfLines={1}>
              {partner.department || 'Department Student'}
            </Text>

            <View style={styles.activeChatIndicator}>
              <Ionicons name="chatbubble-ellipses-outline" size={13} color={COLORS.primary} />
              <Text style={styles.statusPrompt}>Direct peer messaging unlocked</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Student Messages"
        subtitle="Real-time peer chat with connected classmates"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
        rightAction={
          <TouchableOpacity
            style={styles.findStudentsBtn}
            onPress={() => navigation.navigate('StudentConnections')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={16} color={COLORS.primary} />
            <Text style={styles.findStudentsText}>Find Students</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by student name or register number..."
          style={styles.searchBar}
          onClear={() => setSearchQuery('')}
        />

        {loading && !refreshing ? (
          <LoadingIndicator message="Loading connected classmates..." />
        ) : (
          <FlatList
            data={filteredConnections}
            keyExtractor={(item) => item._id}
            renderItem={renderChatItem}
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
                icon="chatbubbles-outline"
                title="No Connections Yet"
                message="You have no active student connections. Connect with classmates using their register number to start chatting in real time."
                actionTitle="Find Students"
                onActionPress={() => navigation.navigate('StudentConnections')}
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
  findStudentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm + 2,
    backgroundColor: COLORS.primaryTint,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  findStudentsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  searchBar: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  listContent: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxxl,
  },
  chatCard: {
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  name: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  regNoBadge: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  deptText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  activeChatIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusPrompt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});
