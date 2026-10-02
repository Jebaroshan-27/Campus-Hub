import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, AppCard, AppButton, LoadingIndicator } from '../../components';
import { getNoteById, deleteNote } from '../../services/noteService';
import { useAuth } from '../../context/AuthContext';

const getFileTypeDetails = (type = '') => {
  const normalized = type.toUpperCase();
  if (normalized.includes('PDF')) {
    return { label: 'PDF Document', icon: 'document-text', color: '#DC2626', bg: '#FEF2F2' };
  }
  if (normalized.includes('DOC')) {
    return { label: 'Word Document', icon: 'reader', color: '#2563EB', bg: '#EFF6FF' };
  }
  if (normalized.includes('PNG') || normalized.includes('JPG') || normalized.includes('JPEG') || normalized.includes('IMG')) {
    return { label: 'Image Material', icon: 'image', color: '#059669', bg: '#ECFDF5' };
  }
  return { label: 'Study Document', icon: 'document-attach', color: '#6366F1', bg: '#EEF2FF' };
};

const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function NoteDetailsScreen({ route, navigation }) {
  const { noteId, note: initialNote } = route.params || {};
  const { user } = useAuth();

  const [note, setNote] = useState(initialNote || null);
  const [loading, setLoading] = useState(!initialNote);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    const id = noteId || initialNote?._id || initialNote?.id;
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getNoteById(id);
      if (res?.note) {
        setNote(res.note);
      }
    } catch (err) {
      setError(err.message || 'Unable to load note details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [noteId]);

  const handleOpenDocument = async () => {
    const url = note?.fileUrl;
    if (!url) {
      Alert.alert('File Unavailable', 'No document URL found for this study material.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Attempt openURL directly if canOpenURL reports false for certain protocols
        await Linking.openURL(url);
      }
    } catch (err) {
      Alert.alert(
        'Unable to Open Document',
        'Could not open the file link in your device browser or reader. Please check your internet connection.'
      );
    }
  };

  const handleDelete = () => {
    const id = note?._id || note?.id;
    if (!id) return;

    Alert.alert(
      'Delete Note',
      `Are you sure you want to permanently delete "${note.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteNote(id);
              Alert.alert('Deleted', 'Note successfully deleted.', [
                {
                  text: 'OK',
                  onPress: () => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    }
                  },
                },
              ]);
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Unable to delete note.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          title="Note Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <LoadingIndicator message="Loading document details..." fullScreen />
      </SafeAreaView>
    );
  }

  if (error || !note) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          title="Note Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Document Not Found</Text>
          <Text style={styles.errorMessage}>{error || 'The requested note is unavailable.'}</Text>
          <AppButton
            title="Try Again"
            size="sm"
            onPress={fetchDetails}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const fileMeta = getFileTypeDetails(note.fileType || note.fileName);
  const uploader = note.uploadedBy || {};
  const isOwner =
    user && (user._id === uploader._id || user.id === uploader._id || user._id === uploader);
  const isAdmin = user && user.role === 'admin';
  const canDelete = isOwner || isAdmin;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Study Material"
        subtitle={note.subject}
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          canDelete ? (
            <TouchableOpacity
              style={styles.deleteHeaderBtn}
              onPress={handleDelete}
              disabled={deleting}
              accessibilityRole="button"
              accessibilityLabel="Delete this note"
            >
              {deleting ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Main Document Info Card */}
        <AppCard style={styles.mainCard} padding="lg">
          <View style={styles.badgeRow}>
            <View style={styles.subjectBadge}>
              <Ionicons name="bookmark" size={13} color={COLORS.primary} />
              <Text style={styles.subjectText}>{note.subject}</Text>
            </View>

            <View style={[styles.fileTypeBadge, { backgroundColor: fileMeta.bg }]}>
              <Ionicons name={fileMeta.icon} size={14} color={fileMeta.color} />
              <Text style={[styles.fileTypeText, { color: fileMeta.color }]}>
                {note.fileType || fileMeta.label}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{note.title}</Text>

          {note.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>Description / Topics Covered</Text>
              <Text style={styles.descriptionText}>{note.description}</Text>
            </View>
          ) : null}
        </AppCard>

        {/* 2. Academic Classification Grid */}
        <AppCard style={styles.metaCard} padding="md">
          <Text style={styles.cardHeaderTitle}>Academic Metadata</Text>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Department</Text>
              <Text style={styles.gridValue}>{note.department}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Academic Year</Text>
              <Text style={styles.gridValue}>{note.year}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Semester</Text>
              <Text style={styles.gridValue}>{note.semester}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Subject / Course</Text>
              <Text style={styles.gridValue}>{note.subject}</Text>
            </View>
          </View>
        </AppCard>

        {/* 3. File & Cloud Storage Info */}
        <AppCard style={styles.metaCard} padding="md">
          <Text style={styles.cardHeaderTitle}>Attached Document</Text>

          <View style={styles.fileRow}>
            <View style={[styles.fileIconWrap, { backgroundColor: fileMeta.bg }]}>
              <Ionicons name={fileMeta.icon} size={28} color={fileMeta.color} />
            </View>

            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={2}>
                {note.fileName || 'Document File'}
              </Text>
              <Text style={styles.fileFormat}>
                Format: {note.fileType || 'Document'} • Verified on Cloudinary
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonContainer}>
            <AppButton
              title="Open / Download Document"
              icon="cloud-download-outline"
              size="lg"
              onPress={handleOpenDocument}
              style={styles.openFullBtn}
            />
          </View>
        </AppCard>

        {/* 4. Contributor / Uploader Card */}
        <AppCard style={styles.metaCard} padding="md">
          <Text style={styles.cardHeaderTitle}>Published By</Text>
          <View style={styles.uploaderBox}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(uploader.name || 'F').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.uploaderDetails}>
              <Text style={styles.uploaderName}>{uploader.name || 'Campus Faculty'}</Text>
              <Text style={styles.uploaderDept}>
                {uploader.department || note.department}
                {uploader.role ? ` • ${uploader.role.toUpperCase()}` : ''}
              </Text>
              {uploader.email ? (
                <Text style={styles.uploaderEmail}>{uploader.email}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.uploadDateRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} />
            <Text style={styles.uploadDateText}>Uploaded on {formatDate(note.createdAt)}</Text>
          </View>
        </AppCard>

        {/* 5. Danger Zone if authorized */}
        {canDelete && (
          <TouchableOpacity
            style={styles.deleteOutlineBtn}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text style={styles.deleteOutlineText}>Delete This Study Material</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl + 20,
  },
  deleteHeaderBtn: {
    padding: SPACING.xs,
  },
  mainCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  subjectText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  fileTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  fileTypeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 26,
    marginVertical: SPACING.xs,
  },
  descriptionSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    marginBottom: 4,
  },
  descriptionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  metaCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cardHeaderTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  gridItem: {
    width: '46%',
  },
  gridLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  gridValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  fileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  fileFormat: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  actionButtonContainer: {
    marginTop: SPACING.md,
  },
  openFullBtn: {
    width: '100%',
  },
  uploaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarInitial: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  uploaderDetails: {
    flex: 1,
  },
  uploaderName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  uploaderDept: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  uploaderEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  uploadDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  uploadDateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  deleteOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerLight,
  },
  deleteOutlineText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
