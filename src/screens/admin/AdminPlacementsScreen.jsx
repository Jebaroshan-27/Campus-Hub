import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { AppHeader, AppButton, SearchBar, EmptyState } from '../../components';
import PlacementCard from '../../components/placements/PlacementCard';
import { getPlacements, deletePlacement } from '../../services/placementService';

export default function AdminPlacementsScreen({ navigation }) {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadPlacements = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = {};
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (statusFilter !== 'All') params.status = statusFilter;

        const res = await getPlacements(params);
        if (res && res.placements) {
          setPlacements(res.placements);
        } else {
          setPlacements([]);
        }
      } catch (err) {
        setError(err.message || 'Unable to load placement drives.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlacements();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadPlacements]);

  const handleDelete = (placement) => {
    Alert.alert(
      'Delete Placement Drive',
      `Are you sure you want to permanently delete the recruitment drive for "${placement.companyName}" (${placement.jobTitle})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlacement(placement._id || placement.id);
              setPlacements((prev) =>
                prev.filter((item) => (item._id || item.id) !== (placement._id || placement.id))
              );
              Alert.alert('Deleted', 'Placement drive removed successfully.');
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Could not delete placement drive.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (placement) => {
    navigation.navigate('EditPlacementScreen', {
      placementId: placement._id,
      placement,
      onUpdateSuccess: () => loadPlacements(true),
    });
  };

  const handleCreate = () => {
    navigation.navigate('CreatePlacementScreen', {
      onCreateSuccess: () => loadPlacements(true),
    });
  };

  const renderPlacementItem = ({ item }) => (
    <PlacementCard
      placement={item}
      onPress={() =>
        navigation.navigate('PlacementDetails', {
          placementId: item._id,
          placement: item,
        })
      }
      onEdit={handleEdit}
      onDelete={handleDelete}
      showAdminActions={true}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. Header */}
      <AppHeader
        title="Placement Drives"
        subtitle="Manage and oversee corporate campus recruitments"
        rightAction={
          <AppButton
            title="+ Add Drive"
            size="sm"
            onPress={handleCreate}
          />
        }
      />

      <View style={styles.container}>
        {/* 2. Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search corporate drives by company or role..."
          onClear={() => setSearchQuery('')}
          style={styles.searchBar}
        />

        {/* 3. Status Filters */}
        <View style={styles.filterRow}>
          {['All', 'open', 'closed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                statusFilter === status && styles.filterTabActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  statusFilter === status && styles.filterTabTextActive,
                ]}
              >
                {status === 'All' ? 'All Drives' : status === 'open' ? 'Active' : 'Closed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. List Content */}
        {loading && !refreshing ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading recruitment drives...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Ionicons name="alert-circle-outline" size={44} color={COLORS.danger} />
            <Text style={styles.errorTitle}>Failed to load drives</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadPlacements()}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={placements}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={renderPlacementItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadPlacements(true)}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="briefcase-outline"
                title="No Placement Drives"
                message="Click '+ Add Drive' above to publish a new recruitment notification."
                actionTitle="Create Drive"
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
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginVertical: SPACING.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  filterTabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxxl + 20,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.danger,
    marginTop: SPACING.md,
  },
  errorMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  retryBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  retryBtnText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
