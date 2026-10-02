import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/theme';
import AppButton from './AppButton';

export default function EmptyState({
  icon = 'file-tray-outline',
  title = 'No items found',
  message = 'There is nothing to display here at the moment.',
  actionTitle,
  onActionPress,
  compact = false,
  style,
}) {
  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        style,
      ]}
      accessibilityRole="text"
    >
      <View
        style={[
          styles.iconCircle,
          compact && styles.iconCircleCompact,
        ]}
      >
        <Ionicons
          name={icon}
          size={compact ? 28 : 36}
          color={COLORS.primary}
        />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>
        {title}
      </Text>
      <Text style={[styles.message, compact && styles.messageCompact]}>
        {message}
      </Text>
      {actionTitle && onActionPress && (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          variant="outline"
          size="sm"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  containerCompact: {
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconCircleCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  titleCompact: {
    fontSize: 15,
  },
  message: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 290,
  },
  messageCompact: {
    fontSize: 12,
    lineHeight: 16,
    maxWidth: 240,
  },
  actionBtn: {
    marginTop: SPACING.md,
  },
});
