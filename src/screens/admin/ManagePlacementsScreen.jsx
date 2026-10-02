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

export default function ManagePlacementsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [drives, setDrives] = useState(MOCK_PLACEMENTS);

  const filteredDrives = drives.filter((d) =>
    d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDrive = () => {
    Alert.alert(
      'New Placement Drive',
      'Corporate recruitment drive creation wizard will open here.'
    );
  };

  const renderDriveItem = ({ item }) => (
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

      <View style={styles.metaRow}>
        <Text style={styles.packageText}>Package: {item.package}</Text>
        <Text style={styles.deadlineText}>Deadline: {item.deadline}</Text>
      </View>

      <Text style={styles.eligibilityText}>Eligibility: {item.eligibility}</Text>

      <View style={styles.actionsFooter}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            Alert.alert(
              'Applicant Roster',
              `Viewing registered student applicants for ${item.company}.`
            )
          }
        >
          <Ionicons name="people-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Applicants</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            Alert.alert('Edit Drive', `Editing parameters for ${item.company}`)
          }
        >
          <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Placement Drives"
        subtitle="Publish & oversee corporate recruitment notifications"
        rightAction={
          <AppButton
            title="New Drive"
            size="sm"
            icon="add"
            onPress={handleCreateDrive}
          />
        }
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by company or role..."
          style={styles.searchBar}
        />

        <FlatList
          data={filteredDrives}
          keyExtractor={(item) => item.id}
          renderItem={renderDriveItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title="No Drives Found"
              message="Create a new placement drive to begin accepting applications."
              actionTitle="Create Drive"
              onActionPress={handleCreateDrive}
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
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  packageText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deadlineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
  },
  eligibilityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  actionBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
