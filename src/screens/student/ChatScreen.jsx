import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Avatar, LoadingIndicator } from '../../components';
import chatService from '../../services/chatService';
import connectionService from '../../services/connectionService';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export default function ChatScreen({ route, navigation }) {
  const {
    userId,
    partnerName,
    partnerRegNo,
    partnerAvatar,
    partnerDepartment,
    connectionId: initialConnectionId,
  } = route.params || {};

  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [connectionId, setConnectionId] = useState(initialConnectionId || null);
  const [partner, setPartner] = useState({
    _id: userId,
    name: partnerName || 'Classmate',
    registerNumber: partnerRegNo || '',
    profileImage: partnerAvatar || '',
    department: partnerDepartment || '',
  });

  const flatListRef = useRef(null);

  // 1. Fetch message history & verify connection
  const loadChatHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await chatService.getMessages(userId);
      if (res && res.success) {
        setMessages(res.messages || []);
        if (res.partner) {
          setPartner(res.partner);
        }
        if (res.connectionId) {
          setConnectionId(res.connectionId);
        }
      }
    } catch (err) {
      if (err.message?.includes('blocked')) {
        setIsBlocked(true);
      }
      Alert.alert(
        'Chat Access Notice',
        err.message || 'Cannot retrieve chat history.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  }, [userId, navigation]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // 2. Real-time Socket.IO Connection & Listener
  useEffect(() => {
    if (!userId || isBlocked) return;

    let isMounted = true;

    const setupSocket = async () => {
      // Connect and join conversation room
      await socketService.joinConversation(userId);

      // Listen for incoming real-time messages
      const handleNewMessage = (newMsg) => {
        if (!isMounted || !newMsg) return;

        // Deduplicate using message MongoDB _id
        setMessages((prev) => {
          const alreadyExists = prev.some((m) => m._id === newMsg._id);
          if (alreadyExists) return prev;
          return [...prev, newMsg];
        });

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      };

      socketService.listenForMessages(handleNewMessage);
    };

    setupSocket();

    return () => {
      isMounted = false;
      socketService.leaveConversation(userId);
      socketService.removeMessageListener();
    };
  }, [userId, isBlocked]);

  // 3. Send message handler
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || isBlocked) return;

    try {
      setSending(true);
      setInputText('');

      const res = await chatService.sendMessage(userId, text);
      if (res && res.success && res.data) {
        // Optimistically add if not already received from socket
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === res.data._id);
          if (exists) return prev;
          return [...prev, res.data];
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      Alert.alert('Send Failed', err.message || 'Could not deliver message.');
      setInputText(text); // restore typed text on failure
    } finally {
      setSending(false);
    }
  };

  // 4. Block student handler
  const handleBlockPress = () => {
    Alert.alert(
      'Block Student',
      `Are you sure you want to block ${partner.name}? You will no longer be able to message each other or see this connection.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block Student',
          style: 'destructive',
          onPress: async () => {
            try {
              if (connectionId) {
                await connectionService.blockConnection(connectionId);
                setIsBlocked(true);
                Alert.alert(
                  'Student Blocked',
                  `You have blocked ${partner.name}. Connection has been removed.`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to block student.');
            }
          },
        },
      ]
    );
  };

  const renderMessageItem = ({ item }) => {
    const senderId =
      typeof item.sender === 'object' ? item.sender?._id : item.sender;
    const isMe = String(senderId) === String(currentUserId);

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.message}
          </Text>
          <View style={styles.timeRow}>
            <Text
              style={[
                styles.timeText,
                isMe ? styles.myTimeText : styles.otherTimeText,
              ]}
            >
              {formatMessageTime(item.createdAt)}
            </Text>
            {isMe && (
              <Ionicons
                name="checkmark-done"
                size={13}
                color="rgba(255, 255, 255, 0.7)"
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Custom Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <Avatar name={partner.name} size="sm" />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerName} numberOfLines={1}>
              {partner.name}
            </Text>
            <Text style={styles.headerRegNo}>
              {partner.registerNumber} • {partner.department || 'Student'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.blockBtn}
          onPress={handleBlockPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ban-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Messages List */}
        {loading ? (
          <LoadingIndicator message="Loading conversation history..." />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={42}
                  color={COLORS.primaryLight}
                />
                <Text style={styles.emptyTitle}>Conversation Started</Text>
                <Text style={styles.emptySub}>
                  You and {partner.name} are connected. Say hello to start collaborating!
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        {isBlocked ? (
          <View style={styles.blockedBar}>
            <Ionicons name="lock-closed" size={16} color={COLORS.danger} />
            <Text style={styles.blockedText}>This connection is blocked. Chat is unavailable.</Text>
          </View>
        ) : (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              editable={!sending}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={17} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backBtn: {
    paddingRight: SPACING.sm,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerName: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.text,
  },
  headerRegNo: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  blockBtn: {
    padding: SPACING.xs,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    ...TYPOGRAPHY.body1,
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: COLORS.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTimeText: {
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  emptySub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: COLORS.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.borderDark || '#CBD5E1',
  },
  blockedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.md,
    backgroundColor: '#FEE2E2',
    borderTopWidth: 1,
    borderTopColor: '#FECDD3',
  },
  blockedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 12,
  },
});
