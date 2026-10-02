import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { AppHeader, AppInput, AppButton } from '../../components';
import { updatePlacement } from '../../services/placementService';

const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Civil Engineering',
];

const YEARS = ['3rd Year', '4th Year', '1st Year', '2nd Year'];

export default function EditPlacementScreen({ navigation, route }) {
  const { placement, placementId, onUpdateSuccess } = route.params || {};

  const [companyName, setCompanyName] = useState(placement?.companyName || '');
  const [jobTitle, setJobTitle] = useState(placement?.jobTitle || '');
  const [description, setDescription] = useState(placement?.description || '');
  const [location, setLocation] = useState(placement?.location || '');
  const [workMode, setWorkMode] = useState(placement?.workMode || 'On-site');
  const [salary, setSalary] = useState(placement?.salary || '');
  const [minimumCGPA, setMinimumCGPA] = useState(
    placement?.minimumCGPA !== undefined ? String(placement.minimumCGPA) : '0'
  );
  const [selectedDepts, setSelectedDepts] = useState(placement?.eligibleDepartments || []);
  const [selectedYears, setSelectedYears] = useState(placement?.eligibleYears || []);
  const [skillsInput, setSkillsInput] = useState(
    Array.isArray(placement?.skills) ? placement.skills.join(', ') : ''
  );
  const [deadline, setDeadline] = useState(
    placement?.applicationDeadline
      ? new Date(placement.applicationDeadline).toISOString().split('T')[0]
      : ''
  );
  const [applicationUrl, setApplicationUrl] = useState(placement?.applicationUrl || '');
  const [status, setStatus] = useState(placement?.status || 'open');
  const [eligibilityNotes, setEligibilityNotes] = useState(placement?.eligibility || '');

  const [saving, setSaving] = useState(false);

  const toggleDept = (dept) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const toggleYear = (yr) => {
    setSelectedYears((prev) =>
      prev.includes(yr) ? prev.filter((y) => y !== yr) : [...prev, yr]
    );
  };

  const handleSave = async () => {
    if (saving) return;

    if (!companyName.trim()) {
      Alert.alert('Validation Error', 'Please enter company name.');
      return;
    }
    if (!jobTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter job title.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter description.');
      return;
    }
    if (!salary.trim()) {
      Alert.alert('Validation Error', 'Please enter salary package.');
      return;
    }
    if (!applicationUrl.trim()) {
      Alert.alert('Validation Error', 'Please enter application URL.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(applicationUrl.trim())) {
      Alert.alert('Invalid URL', 'Application URL must start with http:// or https://');
      return;
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      Alert.alert('Invalid Date', 'Please provide a valid deadline format (YYYY-MM-DD).');
      return;
    }

    try {
      setSaving(true);

      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const id = placementId || placement?._id || placement?.id;

      const payload = {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        description: description.trim(),
        location: location.trim(),
        workMode,
        salary: salary.trim(),
        minimumCGPA: minimumCGPA ? Number(minimumCGPA) : 0,
        eligibleDepartments: selectedDepts,
        eligibleYears: selectedYears,
        skills: skillsArray,
        applicationDeadline: parsedDeadline.toISOString(),
        applicationUrl: applicationUrl.trim(),
        status,
        eligibility: eligibilityNotes.trim(),
      };

      const res = await updatePlacement(id, payload);

      Alert.alert(
        'Placement Updated',
        res.message || 'Drive information updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onUpdateSuccess) onUpdateSuccess();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update placement drive.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Edit Placement Drive"
        subtitle={placement?.companyName || 'Recruitment Drive'}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppInput
          label="Company Name *"
          value={companyName}
          onChangeText={setCompanyName}
          editable={!saving}
        />

        <AppInput
          label="Job Role / Title *"
          value={jobTitle}
          onChangeText={setJobTitle}
          editable={!saving}
        />

        <AppInput
          label="Salary Package *"
          value={salary}
          onChangeText={setSalary}
          editable={!saving}
        />

        <AppInput
          label="Job Location *"
          value={location}
          onChangeText={setLocation}
          editable={!saving}
        />

        {/* Work Mode */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Work Mode</Text>
          <View style={styles.optionsRow}>
            {WORK_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionBtn,
                  workMode === mode && styles.optionBtnActive,
                ]}
                onPress={() => setWorkMode(mode)}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    workMode === mode && styles.optionBtnTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Application URL */}
        <AppInput
          label="Official Application URL *"
          value={applicationUrl}
          onChangeText={setApplicationUrl}
          keyboardType="url"
          autoCapitalize="none"
          editable={!saving}
        />

        {/* Deadline */}
        <AppInput
          label="Application Deadline (YYYY-MM-DD) *"
          value={deadline}
          onChangeText={setDeadline}
          editable={!saving}
        />

        {/* Minimum CGPA */}
        <AppInput
          label="Minimum CGPA Cutoff"
          value={minimumCGPA}
          onChangeText={setMinimumCGPA}
          keyboardType="numeric"
          editable={!saving}
        />

        {/* Eligible Departments */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Eligible Departments</Text>
          <View style={styles.chipsWrap}>
            {DEPARTMENTS.map((dept) => {
              const selected = selectedDepts.includes(dept);
              return (
                <TouchableOpacity
                  key={dept}
                  style={[styles.deptChip, selected && styles.deptChipSelected]}
                  onPress={() => toggleDept(dept)}
                >
                  {selected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.deptChipText, selected && styles.deptChipTextSelected]}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Eligible Years */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Eligible Years</Text>
          <View style={styles.optionsRow}>
            {YEARS.map((yr) => {
              const selected = selectedYears.includes(yr);
              return (
                <TouchableOpacity
                  key={yr}
                  style={[styles.optionBtn, selected && styles.optionBtnActive]}
                  onPress={() => toggleYear(yr)}
                >
                  <Text style={[styles.optionBtnText, selected && styles.optionBtnTextActive]}>
                    {yr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Skills */}
        <AppInput
          label="Required Skills (Comma separated)"
          value={skillsInput}
          onChangeText={setSkillsInput}
          editable={!saving}
        />

        {/* Description */}
        <AppInput
          label="Job Description *"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 90 }}
          editable={!saving}
        />

        {/* Eligibility Notes */}
        <AppInput
          label="Additional Eligibility Guidelines"
          value={eligibilityNotes}
          onChangeText={setEligibilityNotes}
          multiline
          numberOfLines={2}
          editable={!saving}
        />

        {/* Status */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Drive Status</Text>
          <View style={styles.optionsRow}>
            {[
              { key: 'open', label: 'Open' },
              { key: 'closed', label: 'Closed' },
            ].map((st) => (
              <TouchableOpacity
                key={st.key}
                style={[
                  styles.optionBtn,
                  status === st.key && styles.optionBtnActive,
                ]}
                onPress={() => setStatus(st.key)}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    status === st.key && styles.optionBtnTextActive,
                  ]}
                >
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.btnRow}>
          <AppButton
            title={saving ? 'Saving Changes...' : 'Save Changes'}
            icon={saving ? null : 'save-outline'}
            size="lg"
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            style={styles.saveBtn}
          />
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
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl + 20,
  },
  fieldSection: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  optionBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  optionBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  optionBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deptChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  deptChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 11,
  },
  deptChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  btnRow: {
    marginTop: SPACING.lg,
  },
  saveBtn: {
    width: '100%',
  },
});
