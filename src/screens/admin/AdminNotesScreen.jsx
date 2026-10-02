import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, SearchBar, EmptyState } from '../../components';
import NoteCard from '../../components/notes/NoteCard';
import { getNotes, deleteNote } from '../../services/noteService';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical & Electronics',
];

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function AdminNotesScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const loadNotes = useCallback(
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
        if (selectedDept !== 'All') params.department = selectedDept;
        if (selectedYear !== 'All') params.year = selectedYear;

        const res = await getNotes(params);
        if (res && res.notes) {
          setNotes(res.notes);
        } else {
          setNotes([]);
        }
      } catch (err) {
        setError(err.message || 'Unable to load notes archive.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, selectedDept, selectedYear]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadNotes]);

  const handleDelete = (note) => {
    Alert.alert(
      'Admin Moderation: Delete Note',
      `Permanently delete "${note.title}" (${note.subject}) by ${
        note.uploadedBy?.name || 'Faculty'
      }? This removes the file from Cloudinary and database.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(note._id || note.id);
              setNotes((prev) =>
                prev.filter((item) => (item._id || item.id) !== (note._id || note.id))
              );
              Alert.alert('Moderation Success', 'Note and cloud file removed.');
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Could not delete note.');
            }
          },
        },
      ]
    );
  };

  const handleOpen = async (note) => {
    if (!note?.fileUrl) {
      Alert.alert('File Error', 'Document link is not available.');
      return;
    }
    try {
      await Linking.openURL(note.fileUrl);
    } catch {
      Alert.alert('Unable to Open File', 'Please verify your internet connection.');
    }
  };

  const renderNoteItem = ({ item }) => (
    <NoteCard
      note={item}
      onPress={() =>
        navigation.navigate('NoteDetails', { noteId: item._id, note: item })
      }
      onOpen={handleOpen}
      onDelete={handleDelete}
      showDelete={true}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Notes Management"
        subtitle="Review, audit, and moderate campus syllabus uploads"
        rightAction={
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search all notes by title, subject or faculty..."
          onClear={() => setSearchQuery('')}
          style={styles.searchBar}
        />

        {/* Department Pills */}
        <View style={styles.pillsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DEPARTMENTS.slice(0, 4).map((dept) => {
              const active = selectedDept === dept;
              const label =
                dept === 'All'
                  ? 'All Depts'
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
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSelectedDept(dept)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading notes archive...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Ionicons name="alert-circle-outline" size={44} color={COLORS.danger} />
            <Text style={styles.errorTitle}>Failed to load notes</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadNotes()}>
              <Text style={styles.retryBtnText}>Retry</Text>
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
                icon="documents-outline"
                title="No Notes Found"
                message="No study materials match your search or department filter."
                actionTitle="Reset Filters"
                onActionPress={() => {
                  setSearchQuery('');
                  setSelectedDept('All');
                  setSelectedYear('All');
                }}
              />
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Archives</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginVertical: SPACING.md }}>
              <Text style={styles.filterTitle}>Department</Text>
              <View style={styles.filterGrid}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[styles.filterChip, selectedDept === dept && styles.filterChipActive]}
                    onPress={() => setSelectedDept(dept)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedDept === dept && styles.filterChipTextActive,
                      ]}
                    >
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterTitle}>Year</Text>
              <View style={styles.filterGrid}>
                {YEARS.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[styles.filterChip, selectedYear === yr && styles.filterChipActive]}
                    onPress={() => setSelectedYear(yr)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedYear === yr && styles.filterChipTextActive,
                      ]}
                    >
                      {yr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyBtnText}>Done</Text>
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
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBar: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pillsRow: {
    marginVertical: SPACING.xs,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
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
  filterTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryTint,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 12,
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalFooter: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
