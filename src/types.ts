export type Role = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  className?: string;
  classId?: string;
  nisn?: string;
  createdAt: any;
}

export type TestType = 'learning_style' | 'multiple_intelligences' | 'personality' | 'aptitude_interest' | 'school_major' | 'anxiety' | 'iq_wais' | 'wartegg';

export interface TestResult {
  id?: string;
  studentId: string;
  studentName: string;
  studentClass?: string;
  studentNisn?: string;
  testType: TestType;
  scores: Record<string, number>;
  analysis: string;
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
  nisn: string;
  name: string;
  className: string;
  addedBy: string;
}

export interface TeacherSettings {
  name: string;
  nip: string;
  schoolName?: string;
  schoolAddress?: string;
  pemdaName?: string;
  dinasName?: string;
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
