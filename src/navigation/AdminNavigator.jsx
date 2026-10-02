import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ManageNotesScreen from '../screens/admin/ManageNotesScreen';
import ManagePlacementsScreen from '../screens/admin/ManagePlacementsScreen';
import ManageEventsScreen from '../screens/admin/ManageEventsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import CreatePlacementScreen from '../screens/admin/CreatePlacementScreen';
import EditPlacementScreen from '../screens/admin/EditPlacementScreen';
import NoteDetailsScreen from '../screens/student/NoteDetailsScreen';
import PlacementDetailsScreen from '../screens/student/PlacementDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="AdminDashboardTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primaryDark,
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
          if (route.name === 'AdminDashboardTab') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'AdminUsersTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AdminNotesTab') {
            iconName = focused ? 'documents' : 'documents-outline';
          } else if (route.name === 'AdminPlacementsTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'AdminProfileTab') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="AdminUsersTab"
        component={ManageUsersScreen}
        options={{ tabBarLabel: 'Users' }}
      />
      <Tab.Screen
        name="AdminNotesTab"
        component={ManageNotesScreen}
        options={{ tabBarLabel: 'Notes' }}
      />
      <Tab.Screen
        name="AdminPlacementsTab"
        component={ManagePlacementsScreen}
        options={{ tabBarLabel: 'Placements' }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={AdminProfileScreen}
        options={{ tabBarLabel: 'Admin' }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminMainTabs" component={AdminTabNavigator} />
      <Stack.Screen name="AdminManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
      <Stack.Screen name="NoteDetailsScreen" component={NoteDetailsScreen} />
      <Stack.Screen name="PlacementDetails" component={PlacementDetailsScreen} />
      <Stack.Screen name="PlacementDetailsScreen" component={PlacementDetailsScreen} />
      <Stack.Screen name="CreatePlacementScreen" component={CreatePlacementScreen} />
      <Stack.Screen name="CreatePlacement" component={CreatePlacementScreen} />
      <Stack.Screen name="EditPlacementScreen" component={EditPlacementScreen} />
      <Stack.Screen name="EditPlacement" component={EditPlacementScreen} />
    </Stack.Navigator>
  );
}
