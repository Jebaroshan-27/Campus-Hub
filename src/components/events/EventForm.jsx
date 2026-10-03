import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import AppInput from '../AppInput';
import AppButton from '../AppButton';

const EVENT_TYPES = [
  'Workshop',
  'Seminar',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
];

const STATUS_OPTIONS = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const DEPARTMENTS = [
  'General',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Management Studies',
];

export default function EventForm({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  submitButtonText = 'Publish Event',
}) {
  const [formData, setFormData] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    eventType: initialValues.eventType || 'Workshop',
    venue: initialValues.venue || '',
    eventDate: initialValues.eventDate
      ? new Date(initialValues.eventDate).toISOString().split('T')[0]
      : '',
    startTime: initialValues.startTime || '10:00 AM',
    endTime: initialValues.endTime || '01:00 PM',
    registrationDeadline: initialValues.registrationDeadline
      ? new Date(initialValues.registrationDeadline).toISOString().split('T')[0]
      : '',
    organizer: initialValues.organizer || '',
    department: initialValues.department || 'General',
    capacity:
      initialValues.capacity !== undefined && initialValues.capacity !== null
        ? String(initialValues.capacity)
        : '0',
    isPaid: initialValues.isPaid || false,
    price:
      initialValues.price !== undefined && initialValues.price !== null
        ? String(initialValues.price)
        : '0',
    status: initialValues.status || 'upcoming',
  });

  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.title.trim()) {
      errs.title = 'Event title is required.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please provide an event description.';
    }

    if (!formData.venue.trim()) {
      errs.venue = 'Please specify the venue or auditorium.';
    }

    if (!formData.eventDate.trim()) {
      errs.eventDate = 'Event date is required (YYYY-MM-DD).';
    } else {
      const d = new Date(formData.eventDate.trim());
      if (isNaN(d.getTime())) {
        errs.eventDate = 'Please enter a valid date in YYYY-MM-DD format.';
      }
    }

    if (!formData.startTime.trim()) {
      errs.startTime = 'Start time is required (e.g. 10:00 AM).';
    }

    if (!formData.endTime.trim()) {
      errs.endTime = 'End time is required (e.g. 01:00 PM).';
    }

    if (!formData.registrationDeadline.trim()) {
      errs.registrationDeadline = 'Registration deadline is required (YYYY-MM-DD).';
    } else {
      const dl = new Date(formData.registrationDeadline.trim());
      if (isNaN(dl.getTime())) {
        errs.registrationDeadline = 'Please enter a valid date in YYYY-MM-DD format.';
      } else if (formData.eventDate.trim()) {
        const ed = new Date(formData.eventDate.trim());
        if (!isNaN(ed.getTime()) && dl > ed) {
          errs.registrationDeadline = 'Deadline cannot be later than the event date.';
        }
      }
    }

    if (!formData.organizer.trim()) {
      errs.organizer = 'Organizer name or club is required.';
    }

    if (formData.isPaid) {
      const p = Number(formData.price);
      if (isNaN(p) || p <= 0) {
        errs.price = 'Paid events must have a valid price greater than ₹0.';
      }
    }

    const cap = Number(formData.capacity);
    if (isNaN(cap) || cap < 0) {
      errs.capacity = 'Capacity must be 0 (unlimited) or a positive number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventType: formData.eventType,
      venue: formData.venue.trim(),
      eventDate: formData.eventDate.trim(),
      startTime: formData.startTime.trim(),
      endTime: formData.endTime.trim(),
      registrationDeadline: formData.registrationDeadline.trim(),
      organizer: formData.organizer.trim(),
      department: formData.department.trim(),
      capacity: Number(formData.capacity) || 0,
      isPaid: Boolean(formData.isPaid),
      price: formData.isPaid ? Number(formData.price) : 0,
      status: formData.status,
    };

    onSubmit(payload);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Basic Information */}
      <Text style={styles.sectionHeader}>Event Overview</Text>

      <AppInput
        label="Event Title *"
        placeholder="e.g. National Level Hackathon 2026"
        value={formData.title}
        onChangeText={(val) => updateField('title', val)}
        error={errors.title}
        icon="flag-outline"
      />

      {/* Event Type Selector */}
      <Text style={styles.inputLabel}>Event Type *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {EVENT_TYPES.map((type) => {
          const isSelected = formData.eventType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => updateField('eventType', type)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextActive]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <AppInput
        label="Event Description *"
        placeholder="Describe the objective, eligibility, topics covered, rules..."
        value={formData.description}
        onChangeText={(val) => updateField('description', val)}
        error={errors.description}
        multiline
        numberOfLines={4}
      />

      {/* 2. Schedule & Venue */}
      <Text style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
        Schedule & Location
      </Text>

      <AppInput
        label="Venue / Auditorium *"
        placeholder="e.g. Tech Seminar Hall 3, Block B"
        value={formData.venue}
        onChangeText={(val) => updateField('venue', val)}
        error={errors.venue}
        icon="location-outline"
      />

      <AppInput
        label="Event Date (YYYY-MM-DD) *"
        placeholder="YYYY-MM-DD (e.g. 2026-11-15)"
        value={formData.eventDate}
        onChangeText={(val) => updateField('eventDate', val)}
        error={errors.eventDate}
        icon="calendar-outline"
        helperText="Format: YYYY-MM-DD"
      />

      <View style={styles.rowTwoCols}>
        <View style={styles.col}>
          <AppInput
            label="Start Time *"
            placeholder="10:00 AM"
            value={formData.startTime}
            onChangeText={(val) => updateField('startTime', val)}
            error={errors.startTime}
            icon="time-outline"
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="End Time *"
            placeholder="01:00 PM"
            value={formData.endTime}
            onChangeText={(val) => updateField('endTime', val)}
            error={errors.endTime}
            icon="time-outline"
          />
        </View>
      </View>

      <AppInput
        label="Registration Deadline (YYYY-MM-DD) *"
        placeholder="YYYY-MM-DD (e.g. 2026-11-14)"
        value={formData.registrationDeadline}
        onChangeText={(val) => updateField('registrationDeadline', val)}
        error={errors.registrationDeadline}
        icon="alarm-outline"
        helperText="Registrations close at 11:59 PM on this date"
      />

      {/* 3. Host & Department */}
      <Text style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
        Organizers & Eligibility
      </Text>

      <AppInput
        label="Organizer Name / Club *"
        placeholder="e.g. ACM Student Chapter & Dept of CSE"
        value={formData.organizer}
        onChangeText={(val) => updateField('organizer', val)}
        error={errors.organizer}
        icon="people-outline"
      />

      <Text style={styles.inputLabel}>Department</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {DEPARTMENTS.map((dept) => {
          const isSelected = formData.department === dept;
          return (
            <TouchableOpacity
              key={dept}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => updateField('department', dept)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextActive]}
              >
                {dept}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Capacity & Pricing */}
      <Text style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
        Capacity & Registration Fee
      </Text>

      <AppInput
        label="Participant Capacity (0 for Unlimited)"
        placeholder="0"
        value={formData.capacity}
        onChangeText={(val) => updateField('capacity', val)}
        error={errors.capacity}
        keyboardType="number-pad"
        icon="ticket-outline"
        helperText="Enter 0 if there is no seat restriction"
      />

      {/* Paid / Free Toggle */}
      <Text style={styles.inputLabel}>Event Pricing Model *</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, !formData.isPaid && styles.toggleBtnActive]}
          onPress={() => {
            updateField('isPaid', false);
            updateField('price', '0');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="gift-outline"
            size={18}
            color={!formData.isPaid ? '#FFFFFF' : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.toggleBtnText,
              !formData.isPaid && styles.toggleBtnTextActive,
            ]}
          >
            Free Event
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, formData.isPaid && styles.toggleBtnActive]}
          onPress={() => {
            updateField('isPaid', true);
            if (formData.price === '0') updateField('price', '150');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="card-outline"
            size={18}
            color={formData.isPaid ? '#FFFFFF' : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.toggleBtnText,
              formData.isPaid && styles.toggleBtnTextActive,
            ]}
          >
            Paid (Razorpay)
          </Text>
        </TouchableOpacity>
      </View>

      {formData.isPaid && (
        <AppInput
          label="Registration Fee (₹ INR) *"
          placeholder="e.g. 150"
          value={formData.price}
          onChangeText={(val) => updateField('price', val)}
          error={errors.price}
          keyboardType="number-pad"
          icon="cash-outline"
          helperText="Students will pay this fee via Razorpay verification"
        />
      )}

      {/* Edit Mode: Status selector */}
      {isEdit && (
        <View style={{ marginTop: SPACING.sm }}>
          <Text style={styles.inputLabel}>Event Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((st) => {
              const isSelected = formData.status === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusChip,
                    isSelected && styles.statusChipActive,
                  ]}
                  onPress={() => updateField('status', st)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      isSelected && styles.statusChipTextActive,
                    ]}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <AppButton
          title={submitButtonText}
          onPress={handleSubmit}
          loading={isSubmitting}
          size="lg"
          icon={isEdit ? 'save-outline' : 'checkmark-circle-outline'}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl + 20,
  },
  sectionHeader: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  col: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleBtnText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  statusChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
  submitContainer: {
    marginTop: SPACING.lg,
  },
});
