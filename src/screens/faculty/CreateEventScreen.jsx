import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { AppHeader, EventForm } from '../../components';
import eventService from '../../services/eventService';

export default function CreateEventScreen({ navigation }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await eventService.createEvent(formData);
      if (res && res.success) {
        Alert.alert(
          'Event Published!',
          `"${res.event.title}" has been published to the student events catalog.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Publishing Error', err.message || 'Could not create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Schedule Event"
        subtitle="Configure title, venue, date, capacity and fees"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <EventForm
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          submitButtonText="Publish Event"
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
  content: {
    flex: 1,
  },
});
