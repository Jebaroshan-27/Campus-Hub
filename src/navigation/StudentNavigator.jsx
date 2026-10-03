import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Student Screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import NotesScreen from '../screens/student/NotesScreen';
import NoteDetailsScreen from '../screens/student/NoteDetailsScreen';
import PlacementsScreen from '../screens/student/PlacementsScreen';
import PlacementDetailsScreen from '../screens/student/PlacementDetailsScreen';
import EventsScreen from '../screens/student/EventsScreen';
import EventDetailsScreen from '../screens/student/EventDetailsScreen';
import MyRegistrationsScreen from '../screens/student/MyRegistrationsScreen';
import ChatListScreen from '../screens/student/ChatListScreen';
import ChatScreen from '../screens/student/ChatScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import ConnectionsScreen from '../screens/student/ConnectionsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="StudentDashboardTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'StudentDashboardTab' || route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'StudentNotesTab' || route.name === 'Notes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'StudentPlacementsTab' || route.name === 'Placements') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'StudentEventsTab' || route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'StudentChatTab' || route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="StudentDashboardTab"
        component={StudentDashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="StudentNotesTab"
        component={NotesScreen}
        options={{ tabBarLabel: 'Notes' }}
      />
      <Tab.Screen
        name="StudentPlacementsTab"
        component={PlacementsScreen}
        options={{ tabBarLabel: 'Placements' }}
      />
      <Tab.Screen
        name="StudentEventsTab"
        component={EventsScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="StudentChatTab"
        component={ChatListScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
    </Tab.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Primary bottom tab host */}
      <Stack.Screen name="StudentMainTabs" component={StudentTabNavigator} />

      {/* Profile & Notifications accessed via header/dashboard */}
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="StudentProfileScreen" component={StudentProfileScreen} />
      <Stack.Screen name="StudentNotifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />

      {/* Networking & connections */}
      <Stack.Screen name="StudentConnections" component={ConnectionsScreen} />
      <Stack.Screen name="ConnectionsScreen" component={ConnectionsScreen} />

      {/* Chat & messaging */}
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="StudentChat" component={ChatScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />

      {/* Fallback stack screen targets */}
      <Stack.Screen name="NotesScreen" component={NotesScreen} />
      <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
      <Stack.Screen name="NoteDetailsScreen" component={NoteDetailsScreen} />
      <Stack.Screen name="PlacementsScreen" component={PlacementsScreen} />
      <Stack.Screen name="PlacementDetails" component={PlacementDetailsScreen} />
      <Stack.Screen name="PlacementDetailsScreen" component={PlacementDetailsScreen} />
      <Stack.Screen name="EventsScreen" component={EventsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
      <Stack.Screen name="MyRegistrations" component={MyRegistrationsScreen} />
      <Stack.Screen name="MyRegistrationsScreen" component={MyRegistrationsScreen} />
    </Stack.Navigator>
  );
}
