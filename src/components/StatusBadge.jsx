import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function StatusBadge({
  label,
  variant = 'primary', // 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'
  size = 'md', // 'sm', 'md'
  icon,
  style,
  textStyle,
}) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return { bg: COLORS.successLight, text: COLORS.success, border: '#A7F3D0' };
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.warning, border: '#FDE68A' };
      case 'danger':
        return { bg: COLORS.dangerLight, text: COLORS.danger, border: '#FECACA' };
      case 'info':
        return { bg: COLORS.infoLight, text: COLORS.info, border: '#BAE6FD' };
      case 'secondary':
        return { bg: COLORS.secondaryLight, text: COLORS.secondary, border: '#99F6E4' };
      case 'neutral':
        return { bg: COLORS.borderLight, text: COLORS.textSecondary, border: COLORS.border };
      case 'primary':
      default:
        return { bg: COLORS.primaryTint, text: COLORS.primary, border: '#BFDBFE' };
    }
  };

  const config = getBadgeStyle();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 9,
        },
        style,
      ]}
      accessibilityRole="text"
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSm ? 10 : 12}
          color={config.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSm ? 10 : 11,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...TYPOGRAPHY.badge,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
