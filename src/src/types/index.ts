// ============================================
// Department types (部 → 課 階層)
// ============================================
export interface Division {
  id: string;
  name: string;           // 部名 (例: 開発部, 営業部)
  managerId?: string;     // 部長ID
  createdAt: string;
}

export interface Section {
  id: string;
  name: string;           // 課名 (例: 開発1課, 営業2課)
  divisionId: string;     // 所属部ID (必須)
  managerId?: string;     // 課長ID
  createdAt: string;
}

// Legacy Department (後方互換性)
export interface Department {
  id: string;
  name: string;
  managerId: string;
}

// ============================================
// Employee types (Lark連携対応)
// ============================================
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  divisionId: string;     // 所属部 (必須)
  sectionId: string;      // 所属課 (必須)
  managerId?: string;
  // Lark連携
  larkUserId?: string;
  larkOpenId?: string;
  isLarkUser: boolean;
  avatarUrl?: string;
  // メタデータ
  createdAt: string;
  updatedAt: string;
}

// Legacy User (後方互換性)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  departmentId: string;
  managerId?: string;
}

// ============================================
// Lark API types
// ============================================
export interface LarkUser {
  user_id: string;
  open_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  department_ids: string[];
}

export interface LarkDepartment {
  department_id: string;
  name: string;
  parent_department_id?: string;
  member_count: number;
}

export interface LarkAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

// ============================================
// Auth types
// ============================================
export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  isLarkUser: boolean;
  larkAccessToken?: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  divisionId: string;
  sectionId: string;
}

// ============================================
// Skill types
// ============================================
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface SkillLevel {
  skillId: string;
  currentLevel: number; // 1-5
  targetLevel: number;  // 1-5
}

export interface UserSkillProfile {
  userId: string;
  skills: SkillLevel[];
  updatedAt: string;
}

// ============================================
// Quiz/Question types
// ============================================
export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswers: string[] | number[];
  points: number;
  skillId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  skillIds: string[];
  passingScore: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, string[] | number[]>;
  score: number;
  passed: boolean;
  completedAt: string;
}

// ============================================
// Material types
// ============================================
export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'pdf';
  url: string;
  content?: string;
  createdBy: string;
  createdAt: string;
  skillIds: string[];
}

// ============================================
// Education Schedule types (教育スケジュール)
// ============================================
export interface EducationSchedule {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];      // 対象社員ID
  assignedBy: string;        // 作成者(課長)ID
  sectionId: string;         // 対象課
  materials: string[];       // 教材ID
  quizzes: string[];         // クイズID
  startDate: string;
  dueDate: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleProgress {
  id: string;
  scheduleId: string;
  employeeId: string;
  completedMaterials: string[];
  completedQuizzes: string[];
  progress: number;          // 0-100%
  lastActivity: string;
}

// ============================================
// Education Test types (確認テスト)
// ============================================
export interface EducationTest {
  id: string;
  scheduleId: string;        // 教育スケジュールID
  employeeId: string;        // 受験者ID
  testDate: string;          // テスト実施日
  score: number;             // スコア（0-100）
  passed: boolean;           // 合否
  retestDate?: string;       // 再テスト日（不合格時）
  notes?: string;            // 備考
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  type: 'education' | 'test' | 'retest';
  scheduleId: string;
  employeeId: string;
  employeeName: string;
  title: string;
  date: string;
  endDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'passed' | 'failed';
  color?: string;
}

// ============================================
// Radar chart data type
// ============================================
export interface RadarChartData {
  skill: string;
  current: number;
  target: number;
  fullMark: number;
}
