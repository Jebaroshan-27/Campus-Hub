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
import { AppHeader, AppCard, SearchBar, EmptyState } from '../../components';
import { MOCK_CHATS } from '../../constants/mockData';

export default function ChatScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = MOCK_CHATS.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConversation = (name) => {
    Alert.alert(
      name,
      'Real-time Socket.IO chat backend will be hooked in the next phase. Front-end foundation is active.'
    );
  };

  const renderChatItem = ({ item }) => (
    <AppCard
      style={styles.chatCard}
      padding="md"
      onPress={() => handleOpenConversation(item.name)}
    >
      <View style={styles.cardRow}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {item.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </Text>
          </View>
          {item.online && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.contentCol}>
          <View style={styles.topRow}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>

        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Campus Messages"
        subtitle="Study groups & peer collaboration discussions"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
        rightAction={
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() =>
              Alert.alert('New Chat', 'Select a classmate from your connections to start a new thread.')
            }
          >
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search chats and study channels..."
          style={styles.searchBar}
        />

        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No Conversations Yet"
              message="Start a study discussion with your classmates or project teams."
              actionTitle="Browse Connections"
              onActionPress={() => navigation.navigate('StudentConnections')}
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
  chatCard: {
    marginBottom: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 15,
  },
  onlineBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
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
  chatName: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  lastMsg: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: SPACING.sm,
  },
  unreadText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  newChatBtn: {
    padding: SPACING.xs,
  },
});
