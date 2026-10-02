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
import { MOCK_NOTES } from '../../constants/mockData';

const TAGS = ['All', 'Cloud', 'Core CS', 'AI/ML', 'ECE'];

export default function NotesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const filteredNotes = MOCK_NOTES.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'All' || item.tag === selectedTag;

    return matchesQuery && matchesTag;
  });

  const handleDownload = (noteTitle) => {
    Alert.alert('Download Started', `Downloading "${noteTitle}" to your device storage.`);
  };

  const renderNoteItem = ({ item }) => (
    <AppCard style={styles.noteCard} padding="md">
      <View style={styles.cardHeader}>
        <View style={styles.badgeWrap}>
          <Text style={styles.subjectCode}>{item.subject}</Text>
        </View>
        <View style={styles.tagWrap}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      </View>

      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.authorText}>Uploaded by {item.author}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.metaLeft}>
          <Text style={styles.metaText}>{item.fileSize}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.downloads} downloads</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.date}</Text>
        </View>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => handleDownload(item.title)}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-download-outline" size={16} color="#FFFFFF" />
          <Text style={styles.downloadBtnText}>Get</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Notes & Study Hub"
        subtitle="Access semester courseware and lecture archives"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
        rightAction={
          <TouchableOpacity
            style={styles.uploadIconBtn}
            onPress={() =>
              Alert.alert(
                'Upload Notes',
                'Upload feature will connect to campus document storage.'
              )
            }
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, subject code, or faculty..."
          style={styles.searchBar}
        />

        {/* Filter Pills */}
        <View style={styles.tagScroll}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                selectedTag === tag && styles.tagButtonActive,
              ]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text
                style={[
                  styles.tagButtonText,
                  selectedTag === tag && styles.tagButtonTextActive,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes List */}
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No Study Material Found"
              message="Try searching with a different keyword or select another department tag."
              actionTitle="Clear Filters"
              onActionPress={() => {
                setSearchQuery('');
                setSelectedTag('All');
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
  tagScroll: {
    flexDirection: 'row',
    gap: SPACING.xs + 4,
    marginBottom: SPACING.md,
  },
  tagButton: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tagButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  noteCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeWrap: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  subjectCode: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  tagWrap: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  noteTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 16,
    marginTop: 2,
  },
  authorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  metaDot: {
    marginHorizontal: 4,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  downloadBtnText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uploadIconBtn: {
    padding: SPACING.xs,
  },
});
