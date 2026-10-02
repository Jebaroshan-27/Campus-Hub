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
import { MOCK_NOTES } from '../../constants/mockData';

export default function FacultyNotesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(MOCK_NOTES);

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to remove "${title}" from the student course archive?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setNotes((prev) => prev.filter((item) => item.id !== id)),
        },
      ]
    );
  };

  const renderNoteItem = ({ item }) => (
    <AppCard style={styles.card} padding="md">
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.subject}</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconAction}
            onPress={() => Alert.alert('Edit Courseware', `Updating: ${item.title}`)}
          >
            <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconAction}
            onPress={() => handleDelete(item.id, item.title)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.metaSub}>Department: {item.department}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="cloud-download-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.downloads} downloads</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="folder-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.fileSize}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.date}</Text>
        </View>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Faculty Courseware"
        subtitle="Upload and manage lecture archives for students"
        rightAction={
          <AppButton
            title="Upload"
            size="sm"
            icon="add"
            onPress={() =>
              Alert.alert(
                'Upload Courseware',
                'Select syllabus PDF / lecture PPT from device to publish.'
              )
            }
          />
        }
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter notes by title or course code..."
          style={styles.searchBar}
        />

        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No Courseware Uploaded"
              message="Upload lecture slides, syllabus, or lab manuals for your students."
              actionTitle="Upload New Note"
              onActionPress={() =>
                Alert.alert(
                  'Upload',
                  'Document upload modal will open here once storage service is configured.'
                )
              }
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
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  iconAction: {
    padding: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
    marginTop: 2,
  },
  metaSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
