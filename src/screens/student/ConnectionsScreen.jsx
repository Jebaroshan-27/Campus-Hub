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
import { MOCK_CONNECTIONS } from '../../constants/mockData';

export default function ConnectionsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const [filter, setFilter] = useState('all');

  const filteredList = connections.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'connected') return matchesSearch && item.status === 'connected';
    if (filter === 'pending') return matchesSearch && item.status === 'pending';
    return matchesSearch;
  });

  const handleToggleConnect = (id) => {
    setConnections((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus =
            c.status === 'connected'
              ? 'connect'
              : c.status === 'pending'
              ? 'connected'
              : 'pending';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const renderConnectionItem = ({ item }) => (
    <AppCard style={styles.card} padding="md">
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.dept}>{item.department}</Text>
          <View style={styles.mutualRow}>
            <Ionicons name="people-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.mutualText}>
              {item.mutual} mutual student connections
            </Text>
          </View>
        </View>

        <AppButton
          title={
            item.status === 'connected'
              ? 'Message'
              : item.status === 'pending'
              ? 'Pending'
              : 'Connect'
          }
          variant={
            item.status === 'connected'
              ? 'outline'
              : item.status === 'pending'
              ? 'secondary'
              : 'primary'
          }
          size="sm"
          onPress={() => {
            if (item.status === 'connected') {
              navigation.navigate('StudentChat');
            } else {
              handleToggleConnect(item.id);
            }
          }}
          icon={
            item.status === 'connected'
              ? 'chatbubble-outline'
              : item.status === 'pending'
              ? 'time-outline'
              : 'person-add-outline'
          }
        />
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Student Connections"
        subtitle="Network and collaborate with campus peers"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search peers by name or branch..."
          style={styles.searchBar}
        />

        <View style={styles.filterTabs}>
          {[
            { id: 'all', label: 'All Peers' },
            { id: 'connected', label: 'Connected' },
            { id: 'pending', label: 'Requests' },
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
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderConnectionItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Connections Found"
              message="Invite classmates or search for colleagues in your department."
              actionTitle="View All"
              onActionPress={() => {
                setSearchQuery('');
                setFilter('all');
              }}
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
  filterTabs: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  dept: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  mutualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  mutualText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
