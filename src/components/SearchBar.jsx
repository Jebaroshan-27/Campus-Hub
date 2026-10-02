import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search notes, placements, events...',
  onClear,
  onPress,
  editable = true,
  showFilter = false,
  onFilterPress,
  style,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChangeText) {
      onChangeText('');
    }
  };

  const containerContent = (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        style,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={isFocused ? COLORS.primary : COLORS.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      />
      {value && value.length > 0 ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search input"
        >
          <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : null}

      {showFilter && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onFilterPress}
          style={styles.filterButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons name="options-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress && !editable) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {containerContent}
      </TouchableOpacity>
    );
  }

  return containerContent;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...SHADOWS.sm,
  },
  containerFocused: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: SPACING.sm + 2,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
    fontSize: 14,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  filterButton: {
    padding: SPACING.xs,
    marginLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borderLight,
    paddingLeft: SPACING.sm,
  },
});
