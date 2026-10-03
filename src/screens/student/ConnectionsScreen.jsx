import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import {
  AppHeader,
  AppCard,
  AppButton,
  AppInput,
  Avatar,
  EmptyState,
  LoadingIndicator,
} from '../../components';
import connectionService from '../../services/connectionService';

export default function ConnectionsScreen({ navigation }) {
  const [searchRegNo, setSearchRegNo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionsData, setConnectionsData] = useState({
    pendingReceived: [],
    pendingSent: [],
    accepted: [],
    blocked: [],
  });

  const fetchConnections = useCallback(async () => {
    try {
      const res = await connectionService.getConnections();
      if (res && res.success) {
        setConnectionsData({
          pendingReceived: res.pendingReceived || [],
          pendingSent: res.pendingSent || [],
          accepted: res.accepted || [],
          blocked: res.blocked || [],
        });
      }
    } catch (err) {
      // Keep existing data on transient network error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConnections();
  };

  // Search by exact register number
  const handleSearch = async () => {
    const trimmed = searchRegNo.trim();
    if (!trimmed) {
      Alert.alert('Register Number Required', 'Please enter an exact student register number to search.');
      return;
    }

    try {
      setIsSearching(true);
      setSearchResult(null);
      setSearchFeedback(null);

      const res = await connectionService.searchStudent(trimmed);
      if (res && res.success) {
        setSearchResult(res);
      }
    } catch (err) {
      setSearchFeedback({
        type: 'error',
        message: err.message || 'No student found with this register number.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Send request
  const handleSendRequest = async (regNo) => {
    try {
      setSendingRequest(true);
      const res = await connectionService.sendConnectionRequest(regNo);
      if (res && res.success) {
        Alert.alert('Invitation Sent', res.message);
        if (searchResult && searchResult.student) {
          setSearchResult({
            ...searchResult,
            connectionStatus: 'pending_sent',
          });
        }
        fetchConnections();
      }
    } catch (err) {
      Alert.alert('Request Failed', err.message || 'Could not send connection invitation.');
    } finally {
      setSendingRequest(false);
    }
  };

  // Accept request
  const handleAccept = async (id, name) => {
    try {
      const res = await connectionService.acceptConnection(id);
      if (res && res.success) {
        Alert.alert('Connected! 🎉', `You and ${name || 'your classmate'} are now connected. You can start chatting.`);
        fetchConnections();
        if (searchResult && searchResult.student) {
          setSearchResult({
            ...searchResult,
            connectionStatus: 'accepted',
          });
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to accept connection.');
    }
  };

  // Reject request
  const handleReject = async (id, name) => {
    try {
      const res = await connectionService.rejectConnection(id);
      if (res && res.success) {
        Alert.alert('Declined', `Invitation from ${name || 'student'} declined.`);
        fetchConnections();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to decline connection.');
    }
  };

  // Navigate to Chat
  const handleOpenChat = (partner, connectionId) => {
    navigation.navigate('ChatScreen', {
      userId: partner._id,
      partnerName: partner.name,
      partnerRegNo: partner.registerNumber,
      partnerAvatar: partner.profileImage,
      partnerDepartment: partner.department,
      connectionId,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Student Connections"
        subtitle="Network with classmates & unlock direct peer chat"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 1. SEARCH STUDENT SECTION */}
        <AppCard style={styles.sectionCard} padding="md">
          <Text style={styles.sectionTitle}>Find Student by Register Number</Text>
          <Text style={styles.sectionSub}>
            Search using exact register number (e.g. 21BCS0142, 22CS-CH-001)
          </Text>

          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <AppInput
                placeholder="Enter Register Number"
                value={searchRegNo}
                onChangeText={(val) => {
                  setSearchRegNo(val);
                  setSearchFeedback(null);
                  if (!val.trim()) setSearchResult(null);
                }}
                autoCapitalize="characters"
                icon="search-outline"
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <AppButton
              title="Search"
              size="md"
              onPress={handleSearch}
              loading={isSearching}
              style={styles.searchBtn}
            />
          </View>

          {/* Search Feedback / Not Found */}
          {searchFeedback && (
            <View style={styles.feedbackBox}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.danger} />
              <Text style={styles.feedbackText}>{searchFeedback.message}</Text>
            </View>
          )}

          {/* Search Result Card */}
          {searchResult && searchResult.student && (
            <View style={styles.resultBox}>
              <View style={styles.studentInfoRow}>
                <Avatar name={searchResult.student.name} size="md" />
                <View style={styles.studentMeta}>
                  <Text style={styles.studentName}>{searchResult.student.name}</Text>
                  <Text style={styles.studentRegNo}>
                    Reg No: <Text style={{ fontWeight: '700' }}>{searchResult.student.registerNumber}</Text>
                  </Text>
                  <Text style={styles.studentDept}>
                    {searchResult.student.department} • {searchResult.student.year}
                  </Text>
                </View>
              </View>

              {/* State-dependent Action Pill / Button */}
              <View style={styles.resultActionRow}>
                {searchResult.connectionStatus === 'self' && (
                  <View style={styles.selfBadge}>
                    <Text style={styles.selfBadgeText}>You cannot connect with yourself</Text>
                  </View>
                )}

                {searchResult.connectionStatus === 'accepted' && (
                  <View style={styles.connectedRow}>
                    <View style={styles.alreadyConnectedBadge}>
                      <Ionicons name="checkmark-circle" size={15} color="#15803D" />
                      <Text style={styles.alreadyConnectedText}>Already Connected</Text>
                    </View>
                    <AppButton
                      title="Chat"
                      size="sm"
                      icon="chatbubbles-outline"
                      onPress={() => handleOpenChat(searchResult.student, searchResult.connectionId)}
                    />
                  </View>
                )}

                {searchResult.connectionStatus === 'pending_sent' && (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="time-outline" size={15} color="#B45309" />
                    <Text style={styles.pendingBadgeText}>Request Pending</Text>
                  </View>
                )}

                {searchResult.connectionStatus === 'pending_received' && (
                  <View style={styles.receivedActionGroup}>
                    <AppButton
                      title="Accept"
                      size="sm"
                      onPress={() => handleAccept(searchResult.connectionId, searchResult.student.name)}
                      icon="checkmark"
                    />
                    <AppButton
                      title="Decline"
                      size="sm"
                      variant="outline"
                      onPress={() => handleReject(searchResult.connectionId, searchResult.student.name)}
                    />
                  </View>
                )}

                {searchResult.connectionStatus === 'blocked' && (
                  <View style={styles.blockedBadge}>
                    <Ionicons name="ban-outline" size={15} color={COLORS.danger} />
                    <Text style={styles.blockedBadgeText}>Connection Unavailable</Text>
                  </View>
                )}

                {(searchResult.connectionStatus === 'none' ||
                  searchResult.connectionStatus === 'rejected') && (
                  <AppButton
                    title="Send Request"
                    size="sm"
                    icon="person-add-outline"
                    loading={sendingRequest}
                    onPress={() => handleSendRequest(searchResult.student.registerNumber)}
                  />
                )}
              </View>
            </View>
          )}
        </AppCard>

        {/* 2. RECEIVED INVITATIONS SECTION */}
        {connectionsData.pendingReceived.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Received Invitations ({connectionsData.pendingReceived.length})
              </Text>
            </View>

            {connectionsData.pendingReceived.map((item) => {
              const student = item.requester;
              return (
                <AppCard key={item._id} style={styles.requestCard} padding="md">
                  <View style={styles.studentInfoRow}>
                    <Avatar name={student?.name || 'Student'} size="md" />
                    <View style={styles.studentMeta}>
                      <Text style={styles.studentName}>{student?.name}</Text>
                      <Text style={styles.studentRegNo}>
                        Reg No: <Text style={{ fontWeight: '700' }}>{student?.registerNumber}</Text>
                      </Text>
                      <Text style={styles.studentDept}>
                        {student?.department} • {student?.year}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestActionsRow}>
                    <AppButton
                      title="Accept"
                      size="sm"
                      icon="checkmark"
                      onPress={() => handleAccept(item._id, student?.name)}
                      style={{ flex: 1 }}
                    />
                    <AppButton
                      title="Decline"
                      size="sm"
                      variant="outline"
                      onPress={() => handleReject(item._id, student?.name)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* 3. SENT INVITATIONS SECTION */}
        {connectionsData.pendingSent.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Sent Invitations ({connectionsData.pendingSent.length})
              </Text>
            </View>

            {connectionsData.pendingSent.map((item) => {
              const student = item.receiver;
              return (
                <AppCard key={item._id} style={styles.requestCard} padding="md">
                  <View style={styles.studentInfoRow}>
                    <Avatar name={student?.name || 'Student'} size="md" />
                    <View style={styles.studentMeta}>
                      <Text style={styles.studentName}>{student?.name}</Text>
                      <Text style={styles.studentRegNo}>
                        Reg No: <Text style={{ fontWeight: '700' }}>{student?.registerNumber}</Text>
                      </Text>
                      <Text style={styles.studentDept}>
                        {student?.department} • {student?.year}
                      </Text>
                    </View>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* 4. CONNECTED STUDENTS (ACCEPTED) */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Connected Classmates ({connectionsData.accepted.length})
            </Text>
          </View>

          {loading && !refreshing ? (
            <LoadingIndicator message="Loading your connections..." />
          ) : connectionsData.accepted.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No Connections Yet"
              message="Search students by register number above to connect and unlock real-time peer messaging."
            />
          ) : (
            connectionsData.accepted.map((item) => {
              const student = item.partner;
              return (
                <AppCard key={item._id} style={styles.acceptedCard} padding="md">
                  <View style={styles.studentInfoRow}>
                    <Avatar name={student?.name || 'Student'} size="md" />
                    <View style={styles.studentMeta}>
                      <Text style={styles.studentName}>{student?.name}</Text>
                      <Text style={styles.studentRegNo}>
                        Reg No: <Text style={{ fontWeight: '700' }}>{student?.registerNumber}</Text>
                      </Text>
                      <Text style={styles.studentDept}>
                        {student?.department} • {student?.year}
                      </Text>
                    </View>

                    <AppButton
                      title="Chat"
                      size="sm"
                      icon="chatbubble-ellipses-outline"
                      onPress={() => handleOpenChat(student, item._id)}
                    />
                  </View>
                </AppCard>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl + 20,
  },
  sectionCard: {
    marginBottom: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  sectionSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchBtn: {
    minWidth: 80,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
  },
  feedbackText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.danger,
    fontSize: 12,
    flex: 1,
  },
  resultBox: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentMeta: {
    flex: 1,
  },
  studentName: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.text,
  },
  studentRegNo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  studentDept: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  resultActionRow: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  alreadyConnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  alreadyConnectedText: {
    ...TYPOGRAPHY.caption,
    color: '#15803D',
    fontWeight: '700',
  },
  selfBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  selfBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  pendingBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#B45309',
    fontWeight: '700',
  },
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  blockedBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '700',
  },
  receivedActionGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sectionWrap: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    marginBottom: SPACING.sm,
  },
  requestCard: {
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  acceptedCard: {
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
});
