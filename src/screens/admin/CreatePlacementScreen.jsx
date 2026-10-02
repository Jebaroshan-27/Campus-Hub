import React, { useState } from 'react';
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
import { createPlacement } from '../../services/placementService';

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

const getDefaultDeadline = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

export default function CreatePlacementScreen({ navigation, route }) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Bangalore, India');
  const [workMode, setWorkMode] = useState('On-site');
  const [salary, setSalary] = useState('');
  const [minimumCGPA, setMinimumCGPA] = useState('7.0');
  const [selectedDepts, setSelectedDepts] = useState(['Computer Science & Engineering', 'Information Technology']);
  const [selectedYears, setSelectedYears] = useState(['4th Year']);
  const [skillsInput, setSkillsInput] = useState('JavaScript, React, Node.js, SQL');
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [applicationUrl, setApplicationUrl] = useState('');
  const [status, setStatus] = useState('open');
  const [eligibilityNotes, setEligibilityNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (submitting) return;

    if (!companyName.trim()) {
      Alert.alert('Validation Error', 'Please enter the company name.');
      return;
    }
    if (!jobTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter the job title / role.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please provide a job description.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please specify the job location.');
      return;
    }
    if (!salary.trim()) {
      Alert.alert('Validation Error', 'Please specify the salary / package.');
      return;
    }
    if (!applicationUrl.trim()) {
      Alert.alert('Validation Error', 'Please provide the external application URL.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(applicationUrl.trim())) {
      Alert.alert('Invalid URL', 'Application URL must start with http:// or https://');
      return;
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      Alert.alert('Invalid Date', 'Please enter a valid deadline (YYYY-MM-DD).');
      return;
    }

    try {
      setSubmitting(true);

      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

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

      const res = await createPlacement(payload);

      Alert.alert(
        'Drive Published',
        res.message || 'Corporate recruitment drive published to student portal!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (route.params?.onCreateSuccess) {
                route.params.onCreateSuccess();
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Publish Failed', err.message || 'Could not create placement drive.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Add Placement Drive"
        subtitle="Publish a new corporate recruitment posting"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Core Info */}
        <AppInput
          label="Company Name *"
          placeholder="e.g. Microsoft, Google, Infosys"
          value={companyName}
          onChangeText={setCompanyName}
          editable={!submitting}
        />

        <AppInput
          label="Job Role / Title *"
          placeholder="e.g. Software Development Engineer - Full Stack"
          value={jobTitle}
          onChangeText={setJobTitle}
          editable={!submitting}
        />

        <AppInput
          label="Compensation Package *"
          placeholder="e.g. ₹14 - 18 LPA + Retention Bonus"
          value={salary}
          onChangeText={setSalary}
          editable={!submitting}
        />

        <AppInput
          label="Job Location *"
          placeholder="e.g. Bangalore / Hyderabad, India"
          value={location}
          onChangeText={setLocation}
          editable={!submitting}
        />

        {/* Work Mode Picker */}
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

        {/* External Application URL */}
        <AppInput
          label="Official Application URL *"
          placeholder="https://careers.company.com/jobs/apply"
          value={applicationUrl}
          onChangeText={setApplicationUrl}
          keyboardType="url"
          autoCapitalize="none"
          editable={!submitting}
        />

        {/* Application Deadline */}
        <AppInput
          label="Application Deadline (YYYY-MM-DD) *"
          placeholder="e.g. 2026-11-15"
          value={deadline}
          onChangeText={setDeadline}
          editable={!submitting}
        />

        {/* Minimum CGPA */}
        <AppInput
          label="Minimum CGPA Cutoff (0 for none)"
          placeholder="e.g. 7.5"
          value={minimumCGPA}
          onChangeText={setMinimumCGPA}
          keyboardType="numeric"
          editable={!submitting}
        />

        {/* Eligible Departments Multi-select */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Eligible Academic Departments</Text>
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

        {/* Eligible Years Multi-select */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Eligible Student Batches / Years</Text>
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

        {/* Required Skills */}
        <AppInput
          label="Required Skills (Comma separated)"
          placeholder="e.g. Python, SQL, Machine Learning, Git"
          value={skillsInput}
          onChangeText={setSkillsInput}
          editable={!submitting}
        />

        {/* Job Description */}
        <AppInput
          label="Job Description & Key Responsibilities *"
          placeholder="Detailed overview of company, duties, interview rounds, and requirements..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 90 }}
          editable={!submitting}
        />

        {/* Additional Eligibility Notes */}
        <AppInput
          label="Additional Eligibility Notes (Optional)"
          placeholder="e.g. Maximum 1 active backlog permitted at the time of drive..."
          value={eligibilityNotes}
          onChangeText={setEligibilityNotes}
          multiline
          numberOfLines={2}
          editable={!submitting}
        />

        {/* Status */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Drive Status</Text>
          <View style={styles.optionsRow}>
            {[
              { key: 'open', label: 'Open (Accepting Applications)' },
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

        {/* Submit Button */}
        <View style={styles.btnRow}>
          <AppButton
            title={submitting ? 'Publishing Drive...' : 'Publish Placement Drive'}
            icon={submitting ? null : 'cloud-upload'}
            size="lg"
            onPress={handleSubmit}
            disabled={submitting}
            loading={submitting}
            style={styles.submitBtn}
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
  submitBtn: {
    width: '100%',
  },
});
