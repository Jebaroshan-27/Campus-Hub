import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, SearchBar, EmptyState } from '../../components';
import NoteCard from '../../components/notes/NoteCard';
import { getNotes } from '../../services/noteService';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical & Electronics',
];

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

const SEMESTERS = [
  'All',
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export default function NotesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Fetch notes from server with current active filters
  const loadNotes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedYear !== 'All') params.year = selectedYear;
      if (selectedSem !== 'All') params.semester = selectedSem;
      if (selectedSubject.trim()) params.subject = selectedSubject.trim();

      const res = await getNotes(params);
      if (res && res.notes) {
        setNotes(res.notes);
      } else {
        setNotes([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load notes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedDept, selectedYear, selectedSem, selectedSubject]);

  useEffect(() => {
    // Debounce search slightly or fetch on change
    const timer = setTimeout(() => {
      loadNotes();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadNotes]);

  const handleOpenDocument = async (note) => {
    if (!note?.fileUrl) {
      Alert.alert('Link Error', 'Document link is not available.');
      return;
    }

    try {
      await Linking.openURL(note.fileUrl);
    } catch (err) {
      Alert.alert(
        'Unable to Open Document',
        'Could not open document URL. Please check your internet connection.'
      );
    }
  };

  const activeFiltersCount =
    (selectedDept !== 'All' ? 1 : 0) +
    (selectedYear !== 'All' ? 1 : 0) +
    (selectedSem !== 'All' ? 1 : 0) +
    (selectedSubject ? 1 : 0);

  const resetFilters = () => {
    setSelectedDept('All');
    setSelectedYear('All');
    setSelectedSem('All');
    setSelectedSubject('');
    setSearchQuery('');
  };

  const renderNoteItem = ({ item }) => (
    <NoteCard
      note={item}
      onPress={() => navigation.navigate('NoteDetails', { noteId: item._id, note: item })}
      onOpen={handleOpenDocument}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. Header */}
      <AppHeader
        title="Notes Hub"
        subtitle="Explore lecture notes, courseware, and syllabus archives"
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
            accessibilityLabel="Filter notes"
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
        {/* 2. Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, subject, or description..."
          onClear={() => setSearchQuery('')}
          style={styles.searchBar}
        />

        {/* 3. Quick Department Pills */}
        <View style={styles.quickPillsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPillsContent}
          >
            {DEPARTMENTS.slice(0, 4).map((dept) => {
              const isActive = selectedDept === dept;
              const label =
                dept === 'All'
                  ? 'All Notes'
                  : dept === 'Computer Science & Engineering'
                  ? 'CSE'
                  : dept === 'Information Technology'
                  ? 'IT'
                  : dept === 'Electronics & Communication'
                  ? 'ECE'
                  : dept;
              return (
                <TouchableOpacity
                  key={dept}
                  style={[styles.pill, isActive && styles.pillActive]}
                  onPress={() => setSelectedDept(dept)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.moreFilterPill}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={14} color={COLORS.primary} />
              <Text style={styles.moreFilterText}>
                {activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : 'All Filters'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 4. Active Filters Bar (when any are set) */}
        {activeFiltersCount > 0 && (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterLabel}>Filtered by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              {selectedDept !== 'All' && (
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setSelectedDept('All')}
                >
                  <Text style={styles.chipText}>{selectedDept}</Text>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              {selectedYear !== 'All' && (
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setSelectedYear('All')}
                >
                  <Text style={styles.chipText}>{selectedYear}</Text>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              {selectedSem !== 'All' && (
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setSelectedSem('All')}
                >
                  <Text style={styles.chipText}>{selectedSem}</Text>
                  <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
              <Text style={styles.clearAllText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Notes List or States */}
        {loading && !refreshing ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Ionicons name="cloud-offline-outline" size={44} color={COLORS.danger} />
            <Text style={styles.errorTitle}>Unable to load notes</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadNotes()}
              activeOpacity={0.7}
            >
              <Text style={styles.retryBtnText}>Please try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={renderNoteItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadNotes(true)}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="document-text-outline"
                title="No notes found"
                message="No study materials match your search keyword or selected filters."
                actionTitle={activeFiltersCount > 0 || searchQuery ? 'Clear All Filters' : 'Refresh'}
                onActionPress={activeFiltersCount > 0 || searchQuery ? resetFilters : () => loadNotes(true)}
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
                <Text style={styles.modalTitle}>Filter Notes</Text>
                <Text style={styles.modalSubtitle}>Refine documents by course taxonomy</Text>
              </View>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Department */}
              <Text style={styles.filterSectionTitle}>Department</Text>
              <View style={styles.filterOptionsGrid}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.modalOption,
                      selectedDept === dept && styles.modalOptionSelected,
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

              {/* Academic Year */}
              <Text style={styles.filterSectionTitle}>Academic Year</Text>
              <View style={styles.filterOptionsRow}>
                {YEARS.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[
                      styles.modalOptionSmall,
                      selectedYear === yr && styles.modalOptionSelected,
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

              {/* Semester */}
              <Text style={styles.filterSectionTitle}>Semester</Text>
              <View style={styles.filterOptionsGrid}>
                {SEMESTERS.map((sem) => (
                  <TouchableOpacity
                    key={sem}
                    style={[
                      styles.modalOptionSmall,
                      selectedSem === sem && styles.modalOptionSelected,
                    ]}
                    onPress={() => setSelectedSem(sem)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedSem === sem && styles.modalOptionTextSelected,
                      ]}
                    >
                      {sem}
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
                  loadNotes();
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
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
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
  quickPillsWrapper: {
    marginVertical: SPACING.xs,
  },
  quickPillsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 4,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  moreFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryTint,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moreFilterText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
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
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
    marginRight: 6,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  clearAllBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearAllText: {
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
    maxHeight: '82%',
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
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  modalOption: {
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalOptionSmall: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalOptionSelected: {
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
