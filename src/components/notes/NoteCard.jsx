import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import AppCard from '../AppCard';

const getFileTypeDetails = (type = '') => {
  const normalized = type.toUpperCase();
  if (normalized.includes('PDF')) {
    return {
      label: 'PDF',
      icon: 'document-text',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
    };
  }
  if (normalized.includes('DOC')) {
    return {
      label: 'DOCX',
      icon: 'reader',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    };
  }
  if (normalized.includes('PNG') || normalized.includes('JPG') || normalized.includes('JPEG') || normalized.includes('IMG')) {
    return {
      label: 'IMG',
      icon: 'image',
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    };
  }
  return {
    label: normalized || 'FILE',
    icon: 'document-attach',
    color: '#6366F1',
    bg: '#EEF2FF',
    border: '#C7D2FE',
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function NoteCard({
  note,
  onPress,
  onOpen,
  onDelete,
  showDelete = false,
  style,
}) {
  if (!note) return null;

  const fileTypeMeta = getFileTypeDetails(note.fileType || note.fileName);
  const formattedDate = formatDate(note.createdAt || note.date);
  const uploaderName = note.uploadedBy?.name || note.author || 'Faculty';

  return (
    <AppCard style={[styles.card, style]} padding="md" onPress={onPress}>
      {/* 1. Header: Subject and File Type */}
      <View style={styles.headerRow}>
        <View style={styles.subjectBadge}>
          <Ionicons name="bookmark" size={12} color={COLORS.primary} />
          <Text style={styles.subjectText} numberOfLines={1}>
            {note.subject}
          </Text>
        </View>

        <View
          style={[
            styles.fileTypeBadge,
            { backgroundColor: fileTypeMeta.bg, borderColor: fileTypeMeta.border },
          ]}
        >
          <Ionicons name={fileTypeMeta.icon} size={13} color={fileTypeMeta.color} />
          <Text style={[styles.fileTypeText, { color: fileTypeMeta.color }]}>
            {fileTypeMeta.label}
          </Text>
        </View>
      </View>

      {/* 2. Note Title */}
      <Text style={styles.title} numberOfLines={2}>
        {note.title}
      </Text>

      {/* 3. Description preview if available */}
      {note.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {note.description}
        </Text>
      ) : null}

      {/* 4. Academic Metadata: Department • Year • Semester */}
      <View style={styles.academicRow}>
        <View style={styles.academicChip}>
          <Text style={styles.academicChipText}>{note.department}</Text>
        </View>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.academicSubText}>{note.year}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.academicSubText}>{note.semester}</Text>
      </View>

      {/* 5. Uploader info & Date */}
      <View style={styles.uploaderRow}>
        <View style={styles.uploaderLeft}>
          <Ionicons name="person-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.uploaderText} numberOfLines={1}>
            {uploaderName}
          </Text>
        </View>
        <View style={styles.dateRight}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      {/* 6. Action Footer */}
      <View style={styles.footerRow}>
        {showDelete && onDelete ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e?.stopPropagation?.();
              onDelete(note);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Delete Note"
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}

        <View style={styles.rightButtonsRow}>
          {onPress && (
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          {onOpen && (
            <TouchableOpacity
              style={styles.openButton}
              onPress={(e) => {
                e?.stopPropagation?.();
                onOpen(note);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Open document"
            >
              <Ionicons name="cloud-download-outline" size={15} color="#FFFFFF" />
              <Text style={styles.openButtonText}>Open</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    gap: 4,
    maxWidth: '70%',
  },
  subjectText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  fileTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 3,
  },
  fileTypeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  academicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
    marginBottom: 8,
  },
  academicChip: {
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    maxWidth: '55%',
  },
  academicChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  dot: {
    marginHorizontal: 5,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  academicSubText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  uploaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  uploaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: SPACING.sm,
  },
  uploaderText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  dateRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  spacer: {
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerLight,
  },
  deleteButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 11,
  },
  rightButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceHover,
  },
  detailsButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  openButtonText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});
