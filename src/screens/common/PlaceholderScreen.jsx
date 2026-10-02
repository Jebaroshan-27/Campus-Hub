import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { AppHeader, EmptyState } from '../../components';

export default function PlaceholderScreen({ route, navigation }) {
  const title = route?.params?.title || 'CampusHub Section';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title={title} showBack />
      <View style={styles.container}>
        <EmptyState
          icon="construct-outline"
          title={`${title} Module`}
          message="This module is under development and ready for feature implementation."
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
    justifyContent: 'center',
  },
});
