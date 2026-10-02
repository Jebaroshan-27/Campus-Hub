import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function AppCard({
  children,
  onPress,
  style,
  variant = 'elevated', // 'elevated', 'outlined', 'flat'
  padding = 'md',
  ...rest
}) {
  const getCardStyle = () => {
    const cardStyles = [styles.base, styles[`padding_${padding}`]];

    if (variant === 'elevated') {
      cardStyles.push(styles.elevated);
    } else if (variant === 'outlined') {
      cardStyles.push(styles.outlined);
    } else if (variant === 'flat') {
      cardStyles.push(styles.flat);
    }

    if (style) {
      cardStyles.push(style);
    }

    return cardStyles;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.72}
        onPress={onPress}
        style={getCardStyle()}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  // Paddings
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: SPACING.sm,
  },
  padding_md: {
    padding: SPACING.md,
  },
  padding_lg: {
    padding: SPACING.lg,
  },
  // Variants
  elevated: {
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outlined: {
    borderWidth: 1.2,
    borderColor: COLORS.border,
  },
  flat: {
    backgroundColor: COLORS.borderLight,
  },
});
