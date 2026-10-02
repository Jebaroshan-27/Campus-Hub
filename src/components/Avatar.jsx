import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { getInitials } from '../utils/helpers';

export default function Avatar({
  name = 'User',
  text,
  size = 'md', // 'sm', 'md', 'lg', 'xl' or number
  color = COLORS.primary,
  textColor = '#FFFFFF',
  badge,
  badgeColor = COLORS.success,
  onPress,
  style,
}) {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 52;
      case 'xl':
        return 68;
      case 'md':
      default:
        return 42;
    }
  };

  const dimension = getDimension();
  const initials = text || getInitials(name);

  const getTextSize = () => {
    if (dimension <= 32) return 12;
    if (dimension <= 42) return 15;
    if (dimension <= 54) return 18;
    return 24;
  };

  const content = (
    <View
      style={[
        styles.circle,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: color,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: getTextSize(),
            color: textColor,
          },
        ]}
        numberOfLines={1}
      >
        {initials}
      </Text>
      {badge && (
        <View
          style={[
            styles.badgeDot,
            {
              backgroundColor: badgeColor,
              width: Math.max(8, dimension * 0.22),
              height: Math.max(8, dimension * 0.22),
              borderRadius: dimension * 0.11,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${name}`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  initials: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  badgeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
