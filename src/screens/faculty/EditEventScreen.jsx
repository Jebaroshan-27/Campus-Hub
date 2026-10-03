import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { AppHeader, EventForm, LoadingIndicator } from '../../components';
import eventService from '../../services/eventService';

export default function EditEventScreen({ route, navigation }) {
  const { event: passedEvent, eventId } = route.params || {};
  const [event, setEvent] = useState(passedEvent || null);
  const [loading, setLoading] = useState(!passedEvent && Boolean(eventId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!passedEvent && eventId) {
      (async () => {
        try {
          const res = await eventService.getEventById(eventId);
          if (res && res.success) {
            setEvent(res.event);
          }
        } catch (err) {
          Alert.alert('Error', 'Unable to fetch current event data.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [passedEvent, eventId]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const targetId = event?._id || eventId;
      const res = await eventService.updateEvent(targetId, formData);
      if (res && res.success) {
        Alert.alert(
          'Event Updated',
          `"${res.event.title}" details have been updated successfully.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader title="Edit Event" showBack onBackPress={() => navigation.goBack()} />
        <LoadingIndicator message="Loading event details..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title={`Edit: ${event.title}`}
        subtitle="Update schedules, venue or registration fees"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <EventForm
          initialValues={event}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          isEdit={true}
          submitButtonText="Save Changes"
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
