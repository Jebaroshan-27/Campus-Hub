import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, SearchBar, EmptyState } from '../../components';
import PlacementCard from '../../components/placements/PlacementCard';
import { getPlacements } from '../../services/placementService';

const WORK_MODES = ['All', 'On-site', 'Hybrid', 'Remote'];

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical & Electronics',
];

const YEARS = ['All', '3rd Year', '4th Year'];

export default function PlacementsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('open'); // 'All' | 'open' | 'closed'
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

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
        if (selectedStatus !== 'All') params.status = selectedStatus;
        if (selectedWorkMode !== 'All') params.workMode = selectedWorkMode;
        if (selectedDept !== 'All') params.department = selectedDept;
        if (selectedYear !== 'All') params.year = selectedYear;

        const res = await getPlacements(params);
        if (res && res.placements) {
          setPlacements(res.placements);
        } else {
          setPlacements([]);
        }
      } catch (err) {
        setError(err.message || 'Unable to load placements. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, selectedStatus, selectedWorkMode, selectedDept, selectedYear]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlacements();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadPlacements]);

  const activeFiltersCount =
    (selectedWorkMode !== 'All' ? 1 : 0) +
    (selectedDept !== 'All' ? 1 : 0) +
    (selectedYear !== 'All' ? 1 : 0) +
    (selectedStatus !== 'open' ? 1 : 0);

  const resetFilters = () => {
    setSelectedStatus('open');
    setSelectedWorkMode('All');
    setSelectedDept('All');
    setSelectedYear('All');
    setSearchQuery('');
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
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. Header */}
      <AppHeader
        title="Placements"
        subtitle="Explore verified campus recruitment drives and internships"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={[
              styles.filterIconBtn,
              activeFiltersCount > 0 && styles.filterIconBtnActive,
            ]}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Filter placements"
          >
            <Ionicons
              name={activeFiltersCount > 0 ? 'funnel' : 'funnel-outline'}
              size={19}
              color={activeFiltersCount > 0 ? '#FFFFFF' : COLORS.primary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* 2. Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by company name, job role, or keywords..."
          onClear={() => setSearchQuery('')}
          style={styles.searchBar}
        />

        {/* 3. Quick Status Tabs (Active Drives vs All vs Closed) */}
        <View style={styles.statusTabsRow}>
          {[
            { key: 'open', label: 'Active Drives' },
            { key: 'All', label: 'All Postings' },
            { key: 'closed', label: 'Closed' },
          ].map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.statusTabBtn, isActive && styles.statusTabBtnActive]}
                onPress={() => setSelectedStatus(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    isActive && styles.statusTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Active Filters Bar */}
        {activeFiltersCount > 0 && (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterLabel}>Filters:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              {selectedWorkMode !== 'All' && (
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setSelectedWorkMode('All')}
                >
                  <Text style={styles.filterChipText}>{selectedWorkMode}</Text>
                  <Ionicons name="close-circle" size={13} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              {selectedDept !== 'All' && (
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setSelectedDept('All')}
                >
                  <Text style={styles.filterChipText}>{selectedDept}</Text>
                  <Ionicons name="close-circle" size={13} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              {selectedYear !== 'All' && (
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setSelectedYear('All')}
                >
                  <Text style={styles.filterChipText}>{selectedYear}</Text>
                  <Ionicons name="close-circle" size={13} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Placements List */}
        {loading && !refreshing ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading placements...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Ionicons name="cloud-offline-outline" size={44} color={COLORS.danger} />
            <Text style={styles.errorTitle}>Unable to load placements</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadPlacements()}
              activeOpacity={0.7}
            >
              <Text style={styles.retryBtnText}>Please try again</Text>
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
                title={searchQuery ? 'No placements match your search' : 'No placement drives available'}
                message={
                  searchQuery
                    ? 'Try searching with a different job title or company name.'
                    : 'Check back soon for upcoming corporate recruitment drives.'
                }
                actionTitle={activeFiltersCount > 0 || searchQuery ? 'Reset All Filters' : 'Refresh'}
                onActionPress={
                  activeFiltersCount > 0 || searchQuery
                    ? resetFilters
                    : () => loadPlacements(true)
                }
              />
            }
          />
        )}
      </View>

      {/* 6. Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Filter Placement Drives</Text>
                <Text style={styles.modalSubtitle}>Target jobs matching your career goals</Text>
              </View>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Work Mode */}
              <Text style={styles.filterSectionTitle}>Work Mode</Text>
              <View style={styles.modalOptionRow}>
                {WORK_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modalOptionBtn,
                      selectedWorkMode === mode && styles.modalOptionBtnSelected,
                    ]}
                    onPress={() => setSelectedWorkMode(mode)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedWorkMode === mode && styles.modalOptionTextSelected,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Department */}
              <Text style={styles.filterSectionTitle}>Eligible Department</Text>
              <View style={styles.modalOptionGrid}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.modalOptionBtn,
                      selectedDept === dept && styles.modalOptionBtnSelected,
                    ]}
                    onPress={() => setSelectedDept(dept)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedDept === dept && styles.modalOptionTextSelected,
                      ]}
                    >
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Year */}
              <Text style={styles.filterSectionTitle}>Target Graduation Year</Text>
              <View style={styles.modalOptionRow}>
                {YEARS.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[
                      styles.modalOptionBtn,
                      selectedYear === yr && styles.modalOptionBtnSelected,
                    ]}
                    onPress={() => setSelectedYear(yr)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedYear === yr && styles.modalOptionTextSelected,
                      ]}
                    >
                      {yr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => {
                  resetFilters();
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.modalResetText}>Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => {
                  setFilterModalVisible(false);
                  loadPlacements();
                }}
              >
                <Text style={styles.modalApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  filterIconBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  searchBar: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statusTabsRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginVertical: SPACING.xs,
  },
  statusTabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statusTabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusTabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  statusTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  activeFilterLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
    marginRight: 6,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resetBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 11,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.text,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: SPACING.xs,
  },
  modalScroll: {
    marginVertical: SPACING.md,
  },
  filterSectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 11,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  modalOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  modalOptionBtn: {
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalOptionBtnSelected: {
    backgroundColor: COLORS.primaryTint,
    borderColor: COLORS.primary,
  },
  modalOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modalResetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceHover,
  },
  modalResetText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalApplyBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  modalApplyText: {
    ...TYPOGRAPHY.body2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
