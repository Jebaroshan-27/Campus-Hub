import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Faculty Screens
import FacultyDashboardScreen from '../screens/faculty/FacultyDashboardScreen';
import FacultyNotesScreen from '../screens/faculty/FacultyNotesScreen';
import UploadNoteScreen from '../screens/faculty/UploadNoteScreen';
import NoteDetailsScreen from '../screens/student/NoteDetailsScreen';
import FacultyEventsScreen from '../screens/faculty/FacultyEventsScreen';
import CreateEventScreen from '../screens/faculty/CreateEventScreen';
import EditEventScreen from '../screens/faculty/EditEventScreen';
import EventRegistrationsScreen from '../screens/admin/EventRegistrationsScreen';
import EventDetailsScreen from '../screens/student/EventDetailsScreen';
import FacultyProfileScreen from '../screens/faculty/FacultyProfileScreen';
import FacultyNotificationsScreen from '../screens/faculty/FacultyNotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function FacultyTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="FacultyDashboardTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'FacultyDashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FacultyNotesTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'FacultyEventsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'FacultyProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="FacultyDashboardTab"
        component={FacultyDashboardScreen}
        options={{ tabBarLabel: 'Faculty Home' }}
      />
      <Tab.Screen
        name="FacultyNotesTab"
        component={FacultyNotesScreen}
        options={{ tabBarLabel: 'Courseware' }}
      />
      <Tab.Screen
        name="FacultyEventsTab"
        component={FacultyEventsScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="FacultyProfileTab"
        component={FacultyProfileScreen}
        options={{ tabBarLabel: 'Staff Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function FacultyNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="FacultyMainTabs" component={FacultyTabNavigator} />
      <Stack.Screen
        name="FacultyNotifications"
        component={FacultyNotificationsScreen}
      />
      <Stack.Screen name="UploadNoteScreen" component={UploadNoteScreen} />
      <Stack.Screen name="UploadNote" component={UploadNoteScreen} />
      <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
      <Stack.Screen name="NoteDetailsScreen" component={NoteDetailsScreen} />
      <Stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EditEventScreen" component={EditEventScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
      <Stack.Screen name="EventRegistrationsScreen" component={EventRegistrationsScreen} />
      <Stack.Screen name="EventRegistrations" component={EventRegistrationsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}
