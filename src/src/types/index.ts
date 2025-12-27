// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  departmentId: string;
  managerId?: string;
}

// Skill types
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

// Quiz/Question types
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

// Material types
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

// Department types
export interface Department {
  id: string;
  name: string;
  managerId: string;
}

// Radar chart data type
export interface RadarChartData {
  skill: string;
  current: number;
  target: number;
  fullMark: number;
}
