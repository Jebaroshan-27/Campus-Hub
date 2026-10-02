import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { AppHeader, AppInput, AppButton } from '../../components';
import { uploadNote } from '../../services/noteService';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Civil Engineering',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export default function UploadNoteScreen({ navigation, route }) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(user?.department || DEPARTMENTS[0]);
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState('Semester 5');
  const [subject, setSubject] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [activePickerModal, setActivePickerModal] = useState(null); // 'dept' | 'year' | 'sem'

  // Pick Document using Expo Document Picker
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileAsset = result.assets[0];
        // Enforce max 25MB limit on client side
        if (fileAsset.size && fileAsset.size > 25 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Selected file exceeds the maximum 25MB limit.');
          return;
        }
        setSelectedFile(fileAsset);
      }
    } catch (err) {
      Alert.alert('File Picker Error', 'Could not access documents on this device.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (uploading) return;

    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a note title.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Please enter the subject name or code.');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a document or image file to upload.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('department', department);
      formData.append('year', year);
      formData.append('semester', semester);
      formData.append('subject', subject.trim());

      // Prepare file for FormData
      let fileUri = selectedFile.uri;
      // On Android / Web, ensure standard format
      if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = `file://${fileUri}`;
      }

      formData.append('file', {
        uri: fileUri,
        name: selectedFile.name || 'study_document.pdf',
        type: selectedFile.mimeType || 'application/pdf',
      });

      const response = await uploadNote(formData);

      Alert.alert(
        'Upload Successful',
        response.message || 'Note published to Notes Hub successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (route.params?.onUploadSuccess) {
                route.params.onUploadSuccess();
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Failed to upload note.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Upload Note"
        subtitle="Publish syllabus documents to campus repository"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <AppInput
          label="Note Title *"
          placeholder="e.g. Distributed Database Architecture Lecture 4"
          value={title}
          onChangeText={setTitle}
          editable={!uploading}
        />

        <AppInput
          label="Subject Name / Code *"
          placeholder="e.g. Database Management Systems (CS304)"
          value={subject}
          onChangeText={setSubject}
          editable={!uploading}
        />

        {/* Dropdown Selectors */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Department *</Text>
          <TouchableOpacity
            style={styles.pickerSelector}
            onPress={() => setActivePickerModal('dept')}
            disabled={uploading}
          >
            <Text style={styles.pickerSelectorText} numberOfLines={1}>
              {department}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.rowSelectors}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Academic Year *</Text>
            <TouchableOpacity
              style={styles.pickerSelector}
              onPress={() => setActivePickerModal('year')}
              disabled={uploading}
            >
              <Text style={styles.pickerSelectorText}>{year}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Semester *</Text>
            <TouchableOpacity
              style={styles.pickerSelector}
              onPress={() => setActivePickerModal('sem')}
              disabled={uploading}
            >
              <Text style={styles.pickerSelectorText}>{semester}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <AppInput
          label="Description (Optional)"
          placeholder="Brief summary of key concepts, chapter coverage, or exam preparation tips..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70 }}
          editable={!uploading}
        />

        {/* File Picker Section */}
        <View style={styles.filePickerSection}>
          <Text style={styles.fieldLabel}>Document File * (PDF, DOCX, or Image)</Text>

          {selectedFile ? (
            <View style={styles.filePreviewCard}>
              <View style={styles.fileIconWrap}>
                <Ionicons name="document-text" size={26} color={COLORS.primary} />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.selectedFileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.selectedFileSize}>
                  {formatFileSize(selectedFile.size)} • Ready to upload
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFile(null)}
                disabled={uploading}
                style={styles.removeFileBtn}
              >
                <Ionicons name="close-circle" size={22} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.fileUploadBox}
              onPress={handlePickDocument}
              disabled={uploading}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-upload-outline" size={36} color={COLORS.primary} />
              <Text style={styles.uploadBoxTitle}>Select File from Device</Text>
              <Text style={styles.uploadBoxSub}>Supported: PDF, DOC, DOCX, JPG, PNG (Max 25MB)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <AppButton
            title={uploading ? 'Uploading to Cloudinary...' : 'Upload Note'}
            icon={uploading ? null : 'cloud-upload'}
            size="lg"
            onPress={handleUpload}
            disabled={uploading}
            loading={uploading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>

      {/* Picker Modal */}
      <Modal
        visible={!!activePickerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePickerModal(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActivePickerModal(null)}
        >
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>
              {activePickerModal === 'dept'
                ? 'Select Department'
                : activePickerModal === 'year'
                ? 'Select Academic Year'
                : 'Select Semester'}
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {(activePickerModal === 'dept'
                ? DEPARTMENTS
                : activePickerModal === 'year'
                ? YEARS
                : SEMESTERS
              ).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    if (activePickerModal === 'dept') setDepartment(option);
                    if (activePickerModal === 'year') setYear(option);
                    if (activePickerModal === 'sem') setSemester(option);
                    setActivePickerModal(null);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                  {(activePickerModal === 'dept' && department === option) ||
                  (activePickerModal === 'year' && year === option) ||
                  (activePickerModal === 'sem' && semester === option) ? (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  fieldGroup: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
  },
  pickerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  pickerSelectorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
  rowSelectors: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  filePickerSection: {
    marginVertical: SPACING.sm,
  },
  fileUploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  uploadBoxTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontSize: 15,
  },
  uploadBoxSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  filePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  fileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  fileInfo: {
    flex: 1,
  },
  selectedFileName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  selectedFileSize: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: SPACING.xs,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
  submitBtn: {
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  pickerModalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  pickerModalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  pickerOptionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontSize: 14,
  },
});
