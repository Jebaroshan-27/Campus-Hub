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
import { MOCK_USERS_ADMIN } from '../../constants/mockData';

export default function ManageUsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState(MOCK_USERS_ADMIN);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.regNo.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedRole === 'student') return matchesSearch && u.role === 'student';
    if (selectedRole === 'faculty') return matchesSearch && u.role === 'faculty';
    return matchesSearch;
  });

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );
  };

  const renderUserItem = ({ item }) => (
    <AppCard style={styles.card} padding="md">
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </Text>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View
              style={[
                styles.roleBadge,
                item.role === 'faculty' ? styles.facultyRole : styles.studentRole,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  item.role === 'faculty'
                    ? styles.facultyRoleText
                    : styles.studentRoleText,
                ]}
              >
                {item.role.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.emailText}>{item.email}</Text>
          <Text style={styles.regText}>ID: {item.regNo}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.statusBtn,
            item.status === 'Active' ? styles.statusActive : styles.statusSuspended,
          ]}
          onPress={() => handleToggleStatus(item.id, item.status)}
        >
          <Text
            style={[
              styles.statusBtnText,
              item.status === 'Active'
                ? styles.statusActiveText
                : styles.statusSuspendedText,
            ]}
          >
            {item.status}
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="User Accounts"
        subtitle="Manage student and faculty directory access"
        rightAction={
          <AppButton
            title="Add User"
            size="sm"
            icon="person-add-outline"
            onPress={() =>
              Alert.alert(
                'Enroll User',
                'User creation dialog will open to enroll student/faculty member.'
              )
            }
          />
        }
      />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, ID or email..."
          style={styles.searchBar}
        />

        <View style={styles.filterTabs}>
          {[
            { id: 'all', label: 'All Users' },
            { id: 'student', label: 'Students' },
            { id: 'faculty', label: 'Faculty' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabBtn,
                selectedRole === tab.id && styles.tabBtnActive,
              ]}
              onPress={() => setSelectedRole(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedRole === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Users Found"
              message="No users match your query."
              actionTitle="Reset"
              onActionPress={() => {
                setSearchQuery('');
                setSelectedRole('all');
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
  filterTabs: {
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
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
  },
  studentRole: {
    backgroundColor: COLORS.accentLight,
  },
  facultyRole: {
    backgroundColor: COLORS.secondaryLight,
  },
  roleText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: '700',
  },
  studentRoleText: {
    color: COLORS.primary,
  },
  facultyRoleText: {
    color: COLORS.secondary,
  },
  emailText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  regText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusActive: {
    backgroundColor: COLORS.successLight,
  },
  statusSuspended: {
    backgroundColor: COLORS.dangerLight,
  },
  statusBtnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  statusActiveText: {
    color: COLORS.success,
  },
  statusSuspendedText: {
    color: COLORS.danger,
  },
});
