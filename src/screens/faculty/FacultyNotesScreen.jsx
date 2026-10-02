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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { AppHeader, AppButton, SearchBar, EmptyState } from '../../components';
import NoteCard from '../../components/notes/NoteCard';
import { getNotes, deleteNote } from '../../services/noteService';
import { useAuth } from '../../context/AuthContext';

export default function FacultyNotesScreen({ navigation }) {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState('mine'); // 'mine' | 'all'

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
        if (scope === 'mine') {
          params.myNotes = 'true';
        }

        const res = await getNotes(params);
        if (res && res.notes) {
          setNotes(res.notes);
        } else {
          setNotes([]);
        }
      } catch (err) {
        setError(err.message || 'Unable to load courseware.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, scope]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadNotes]);

  const handleDelete = (note) => {
    Alert.alert(
      'Delete Course Material',
      `Are you sure you want to remove "${note.title}"? This will delete the document from campus storage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(note._id || note.id);
              setNotes((prev) => prev.filter((item) => (item._id || item.id) !== (note._id || note.id)));
              Alert.alert('Success', 'Study material removed successfully.');
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

  const handleNavigateToUpload = () => {
    navigation.navigate('UploadNoteScreen', {
      onUploadSuccess: () => loadNotes(true),
    });
  };

  const renderNoteItem = ({ item }) => {
    const isOwner =
      user &&
      (user._id === item.uploadedBy?._id ||
        user.id === item.uploadedBy?._id ||
        user._id === item.uploadedBy);

    return (
      <NoteCard
        note={item}
        onPress={() =>
          navigation.navigate('NoteDetails', { noteId: item._id, note: item })
        }
        onOpen={handleOpen}
        onDelete={handleDelete}
        showDelete={isOwner || user?.role === 'admin'}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Faculty Courseware"
        subtitle="Manage lecture notes, lab manuals, and syllabus files"
        rightAction={
          <AppButton
            title="Upload Note"
            size="sm"
            icon="cloud-upload"
            onPress={handleNavigateToUpload}
          />
        }
      />

      <View style={styles.container}>
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter notes by title or course code..."
          onClear={() => setSearchQuery('')}
          style={styles.searchBar}
        />

        {/* Scope Tabs: My Uploads vs All Campus */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, scope === 'mine' && styles.tabBtnActive]}
            onPress={() => setScope('mine')}
          >
            <Ionicons
              name={scope === 'mine' ? 'folder' : 'folder-outline'}
              size={15}
              color={scope === 'mine' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabBtnText, scope === 'mine' && styles.tabBtnTextActive]}
            >
              My Uploaded Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, scope === 'all' && styles.tabBtnActive]}
            onPress={() => setScope('all')}
          >
            <Ionicons
              name={scope === 'all' ? 'library' : 'library-outline'}
              size={15}
              color={scope === 'all' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabBtnText, scope === 'all' && styles.tabBtnTextActive]}
            >
              All Campus Notes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading courseware...</Text>
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
                icon="document-text-outline"
                title={scope === 'mine' ? 'No Uploaded Courseware' : 'No Notes Found'}
                message={
                  scope === 'mine'
                    ? 'You have not uploaded any study documents yet. Tap "Upload Note" above to share course materials.'
                    : 'No documents match your search.'
                }
                actionTitle="Upload Note"
                onActionPress={handleNavigateToUpload}
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
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryTint,
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
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
