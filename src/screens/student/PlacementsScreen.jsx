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
import { MOCK_PLACEMENTS } from '../../constants/mockData';

export default function PlacementsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredPlacements = MOCK_PLACEMENTS.filter((item) => {
    const matchesSearch =
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleApply = (company) => {
    Alert.alert(
      'Application Submitted',
      `Your resume and academic profile have been submitted for ${company}. Check notifications for interview schedule updates.`
    );
  };

  const renderPlacementItem = ({ item }) => (
    <AppCard style={styles.card} padding="lg">
      <View style={styles.headerRow}>
        <View style={styles.companyBadge}>
          <Text style={styles.companyBadgeText}>{item.logo}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.roleTitle}>{item.role}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            item.status === 'Open' ? styles.statusOpen : styles.statusUpcoming,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'Open'
                ? styles.statusTextOpen
                : styles.statusTextUpcoming,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.packageBanner}>
        <View style={styles.packageItem}>
          <Text style={styles.packageLabel}>PACKAGE</Text>
          <Text style={styles.packageVal}>{item.package}</Text>
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.packageItem}>
          <Text style={styles.packageLabel}>LOCATION</Text>
          <Text style={styles.locationVal}>{item.location}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="school-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.detailText}>{item.eligibility}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={16} color={COLORS.danger} />
        <Text style={[styles.detailText, { color: COLORS.danger }]}>
          Application Deadline: {item.deadline}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <AppButton
          title={item.status === 'Open' ? 'Submit Application' : 'Set Reminder'}
          variant={item.status === 'Open' ? 'primary' : 'outline'}
          size="sm"
          onPress={() => handleApply(item.company)}
          icon={item.status === 'Open' ? 'send' : 'notifications-outline'}
        />
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Campus Placements"
        subtitle="Active campus recruitments & internship drives"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by company or job role..."
          style={styles.searchBar}
        />

        <View style={styles.tabsRow}>
          {['All', 'Open', 'Upcoming'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                filterStatus === tab && styles.tabBtnActive,
              ]}
              onPress={() => setFilterStatus(tab)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  filterStatus === tab && styles.tabBtnTextActive,
                ]}
              >
                {tab} Drives
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredPlacements}
          keyExtractor={(item) => item.id}
          renderItem={renderPlacementItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title="No Placement Drives Found"
              message="Check back soon for new corporate recruitment drives."
              actionTitle="Reset Search"
              onActionPress={() => {
                setSearchQuery('');
                setFilterStatus('All');
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
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.xs + 4,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  companyBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  companyBadgeText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  roleTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusOpen: {
    backgroundColor: COLORS.successLight,
  },
  statusUpcoming: {
    backgroundColor: COLORS.warningLight,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: COLORS.success,
  },
  statusTextUpcoming: {
    color: COLORS.warning,
  },
  packageBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  packageItem: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  packageLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  packageVal: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.primary,
  },
  locationVal: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  dividerVertical: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 6,
  },
  detailText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  cardActions: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
