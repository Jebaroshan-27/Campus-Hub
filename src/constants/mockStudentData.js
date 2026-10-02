/**
 * TEMPORARY LOCAL UI PREVIEW DATA ONLY
 * 
 * NOTE: This file is used exclusively for frontend UI testing and preview
 * during development. It will be replaced with real API service calls once the
 * backend and authentication endpoints are connected in later steps.
 * 
 * DO NOT add backend / database logic here.
 */

export const MOCK_STUDENT_USER = {
  id: 'usr_std_demo',
  name: 'Karthikeyan R',
  greeting: 'Good Morning',
  welcomeSubtitle: 'Welcome back to CampusHub',
  regNo: '21BCS0142',
  department: 'Computer Science & Engineering',
  year: 'Final Year / Semester 8',
  email: 'karthikeyan.r@campushub.edu',
  phone: '+91 98765 43210',
  avatar: 'KR',
  gpa: '8.92',
  attendance: '92%',
  creditsCompleted: 142,
  unreadNotificationsCount: 3,
};

export const MOCK_CAMPUS_STATS = {
  notes: 24,
  placements: 8,
  events: 5,
  connections: 12,
};

export const MOCK_DASHBOARD_EVENTS = [
  {
    id: 'ev_dash_1',
    title: 'Tech Symposium 2026',
    date: 'Oct 10, 2026',
    time: '10:00 AM',
    venue: 'Main Auditorium',
    category: 'Technical',
    status: 'Registration Open',
    badgeVariant: 'primary',
  },
  {
    id: 'ev_dash_2',
    title: 'HackCampus National Hackathon',
    date: 'Oct 14-15, 2026',
    time: '9:00 AM',
    venue: 'Innovation Lab 3',
    category: 'Hackathon',
    status: 'Upcoming',
    badgeVariant: 'warning',
  },
  {
    id: 'ev_dash_3',
    title: 'Cloud DevOps Workshop',
    date: 'Oct 18, 2026',
    time: '2:30 PM',
    venue: 'Seminar Hall B',
    category: 'Workshop',
    status: 'Free Entry',
    badgeVariant: 'success',
  },
];

export const MOCK_DASHBOARD_PLACEMENTS = [
  {
    id: 'plc_dash_1',
    company: 'Microsoft India',
    role: 'Software Development Engineer',
    eligibility: 'Eligible: B.Tech CS / IT (CGPA >= 8.0)',
    deadline: 'Deadline: Oct 15',
    package: '₹ 44.5 LPA',
    status: 'Open',
    logo: 'MS',
  },
  {
    id: 'plc_dash_2',
    company: 'Amazon Web Services',
    role: 'Cloud Support Associate',
    eligibility: 'Eligible: All B.Tech Branches (CGPA >= 7.5)',
    deadline: 'Deadline: Oct 18',
    package: '₹ 22.0 LPA',
    status: 'Open',
    logo: 'AWS',
  },
  {
    id: 'plc_dash_3',
    company: 'Oracle Systems',
    role: 'Associate Database Engineer',
    eligibility: 'Eligible: B.Tech CS/IT/MCA (CGPA >= 7.0)',
    deadline: 'Deadline: Oct 25',
    package: '₹ 18.5 LPA',
    status: 'Upcoming',
    logo: 'ORC',
  },
];

export const MOCK_DASHBOARD_NOTES = [
  {
    id: 'note_dash_1',
    subject: 'Database Management Systems',
    title: 'Normalization & Transactions (ACID)',
    semester: 'Semester 5',
    date: 'Uploaded: Oct 01, 2026',
    author: 'Prof. David Wilson',
    fileSize: '4.2 MB',
  },
  {
    id: 'note_dash_2',
    subject: 'Compiler Design',
    title: 'Syntax Analysis & AST Construction',
    semester: 'Semester 7',
    date: 'Uploaded: Sep 28, 2026',
    author: 'Dr. Sarah Mitchell',
    fileSize: '6.8 MB',
  },
  {
    id: 'note_dash_3',
    subject: 'Machine Learning',
    title: 'Neural Networks & PyTorch Lab Guide',
    semester: 'Semester 7',
    date: 'Uploaded: Sep 25, 2026',
    author: 'Dr. Robert Chen',
    fileSize: '12.4 MB',
  },
];

export const MOCK_STUDENT_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'New Connection Request',
    message: 'Priya Sharma (CSE - Year 3) sent you a collaboration connect request.',
    timestamp: '10m ago',
    type: 'connection',
    read: false,
    icon: 'person-add-outline',
  },
  {
    id: 'notif_2',
    title: 'New Placement Drive Announced',
    message: 'Microsoft India has opened applications for SDE-1. Review eligibility criteria.',
    timestamp: '1h ago',
    type: 'placement',
    read: false,
    icon: 'briefcase-outline',
  },
  {
    id: 'notif_3',
    title: 'Event Registration Confirmed',
    message: 'You have been registered for Tech Symposium 2026. Hall pass sent to email.',
    timestamp: '3h ago',
    type: 'event',
    read: false,
    icon: 'checkmark-circle-outline',
  },
  {
    id: 'notif_4',
    title: 'New Peer Message',
    message: 'Rohan Verma: "Did you complete the compiler assignment queries?"',
    timestamp: 'Yesterday',
    type: 'message',
    read: true,
    icon: 'chatbubble-ellipses-outline',
  },
  {
    id: 'notif_5',
    title: 'Courseware Uploaded',
    message: 'Dr. Sarah Mitchell uploaded Compiler Design - AST Construction lecture slides.',
    timestamp: '2 days ago',
    type: 'notes',
    read: true,
    icon: 'document-text-outline',
  },
];

export default {
  MOCK_STUDENT_USER,
  MOCK_CAMPUS_STATS,
  MOCK_DASHBOARD_EVENTS,
  MOCK_DASHBOARD_PLACEMENTS,
  MOCK_DASHBOARD_NOTES,
  MOCK_STUDENT_NOTIFICATIONS,
};
