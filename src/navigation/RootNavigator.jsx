import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { LoadingIndicator } from '../components';

// Navigators
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import FacultyNavigator from './FacultyNavigator';
import AdminNavigator from './AdminNavigator';

export default function RootNavigator() {
  const { isAuthenticated, role, loading } = useAuth();

  // Show clean splash/loading indicator during AsyncStorage session restoration
  if (loading) {
    return <LoadingIndicator message="Restoring CampusHub session..." fullScreen />;
  }

  const renderCurrentNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (role) {
      case ROLES.FACULTY:
        return <FacultyNavigator />;
      case ROLES.ADMIN:
        return <AdminNavigator />;
      case ROLES.STUDENT:
      default:
        return <StudentNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {renderCurrentNavigator()}
    </NavigationContainer>
  );
}
