export type Role = 'student' | 'teacher' | 'admin' | 'guest';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  className?: string;
  classId?: string;
  password?: string;
  teacherId?: string;
  createdAt: any;
  expiryDate?: any;
}

export type TestType = 'learning_style' | 'multiple_intelligences' | 'personality' | 'aptitude_interest' | 'school_major' | 'school_career' | 'anxiety' | 'wartegg' | 'subject_interest' | 'cfit';

export interface TestResult {
  id?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentClass?: string;
  studentPassword?: string;
  studentSchoolName?: string;
  testType: TestType;
  visualizationType?: 'bar' | 'pie' | 'radar';
  scores: Record<string, number>;
  analysis: string;
  aiExplanation?: string;
  extraData?: any;
  teacherId?: string;
  timestamp: any;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacherId: string;
}

export interface StudentData {
  id?: string;
  number: string;
  password: string;
  name: string;
  className: string;
  schoolName?: string;
  addedBy: string;
}

export interface TeacherSettings {
  name: string;
  nip: string;
  schoolName?: string;
  schoolAddress?: string;
  pemdaName?: string;
  dinasName?: string;
  dashboardWidgets?: string[];
  sidebarTabs?: string[];
}

export interface AppNotification {
  id?: string;
  userId: string; // 'all' for all students, or specific user ID
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  teacherId?: string;
  read: boolean;
  timestamp: any;
}

export interface Question {
  id: string;
  text: string;
  options: {
    text: string;
    value: string;
    score?: number;
  }[];
}

export interface TestData {
  title: string;
  description: string;
  questions: Question[];
}

export interface CounselingLog {
  id?: string;
  studentId: string;
  teacherId: string;
  date: string;
  topic: string;
  notes: string;
  interventionStatus: 'pending' | 'in-progress' | 'completed';
  isPrivate: boolean;
  timestamp: any;
}
