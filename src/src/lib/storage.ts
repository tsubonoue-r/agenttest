'use client';

import { User, Quiz, Material, UserSkillProfile, QuizAttempt, Skill, Department } from '@/types';

const STORAGE_KEYS = {
  USERS: 'elearning_users',
  QUIZZES: 'elearning_quizzes',
  MATERIALS: 'elearning_materials',
  SKILL_PROFILES: 'elearning_skill_profiles',
  QUIZ_ATTEMPTS: 'elearning_quiz_attempts',
  SKILLS: 'elearning_skills',
  DEPARTMENTS: 'elearning_departments',
  CURRENT_USER: 'elearning_current_user',
};

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
}

export function setUsers(users: User[]): void {
  setItem(STORAGE_KEYS.USERS, users);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  setUsers(users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUsersByManager(managerId: string): User[] {
  return getUsers().filter(u => u.managerId === managerId);
}

// Current User
export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
}

// Quizzes
export function getQuizzes(): Quiz[] {
  return getItem<Quiz[]>(STORAGE_KEYS.QUIZZES, []);
}

export function setQuizzes(quizzes: Quiz[]): void {
  setItem(STORAGE_KEYS.QUIZZES, quizzes);
}

export function addQuiz(quiz: Quiz): void {
  const quizzes = getQuizzes();
  quizzes.push(quiz);
  setQuizzes(quizzes);
}

export function updateQuiz(quiz: Quiz): void {
  const quizzes = getQuizzes();
  const index = quizzes.findIndex(q => q.id === quiz.id);
  if (index !== -1) {
    quizzes[index] = quiz;
    setQuizzes(quizzes);
  }
}

export function deleteQuiz(id: string): void {
  const quizzes = getQuizzes().filter(q => q.id !== id);
  setQuizzes(quizzes);
}

export function getQuizById(id: string): Quiz | undefined {
  return getQuizzes().find(q => q.id === id);
}

// Materials
export function getMaterials(): Material[] {
  return getItem<Material[]>(STORAGE_KEYS.MATERIALS, []);
}

export function setMaterials(materials: Material[]): void {
  setItem(STORAGE_KEYS.MATERIALS, materials);
}

export function addMaterial(material: Material): void {
  const materials = getMaterials();
  materials.push(material);
  setMaterials(materials);
}

export function updateMaterial(material: Material): void {
  const materials = getMaterials();
  const index = materials.findIndex(m => m.id === material.id);
  if (index !== -1) {
    materials[index] = material;
    setMaterials(materials);
  }
}

export function deleteMaterial(id: string): void {
  const materials = getMaterials().filter(m => m.id !== id);
  setMaterials(materials);
}

// Skills
export function getSkills(): Skill[] {
  return getItem<Skill[]>(STORAGE_KEYS.SKILLS, []);
}

export function setSkills(skills: Skill[]): void {
  setItem(STORAGE_KEYS.SKILLS, skills);
}

export function addSkill(skill: Skill): void {
  const skills = getSkills();
  skills.push(skill);
  setSkills(skills);
}

// Skill Profiles
export function getSkillProfiles(): UserSkillProfile[] {
  return getItem<UserSkillProfile[]>(STORAGE_KEYS.SKILL_PROFILES, []);
}

export function setSkillProfiles(profiles: UserSkillProfile[]): void {
  setItem(STORAGE_KEYS.SKILL_PROFILES, profiles);
}

export function getUserSkillProfile(userId: string): UserSkillProfile | undefined {
  return getSkillProfiles().find(p => p.userId === userId);
}

export function updateUserSkillProfile(profile: UserSkillProfile): void {
  const profiles = getSkillProfiles();
  const index = profiles.findIndex(p => p.userId === profile.userId);
  if (index !== -1) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  setSkillProfiles(profiles);
}

// Quiz Attempts
export function getQuizAttempts(): QuizAttempt[] {
  return getItem<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
}

export function addQuizAttempt(attempt: QuizAttempt): void {
  const attempts = getQuizAttempts();
  attempts.push(attempt);
  setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts);
}

export function getUserQuizAttempts(userId: string): QuizAttempt[] {
  return getQuizAttempts().filter(a => a.userId === userId);
}

// Departments
export function getDepartments(): Department[] {
  return getItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);
}

export function setDepartments(departments: Department[]): void {
  setItem(STORAGE_KEYS.DEPARTMENTS, departments);
}

// Initialize with sample data
export function initializeSampleData(): void {
  if (getUsers().length > 0) return;

  const sampleDepartments: Department[] = [
    { id: 'dept1', name: '開発部', managerId: 'user2' },
    { id: 'dept2', name: '営業部', managerId: 'user5' },
  ];

  const sampleUsers: User[] = [
    { id: 'user1', name: '山田太郎', email: 'yamada@example.com', role: 'employee', departmentId: 'dept1', managerId: 'user2' },
    { id: 'user2', name: '鈴木課長', email: 'suzuki@example.com', role: 'manager', departmentId: 'dept1' },
    { id: 'user3', name: '佐藤花子', email: 'sato@example.com', role: 'employee', departmentId: 'dept1', managerId: 'user2' },
    { id: 'user4', name: '田中一郎', email: 'tanaka@example.com', role: 'employee', departmentId: 'dept1', managerId: 'user2' },
    { id: 'user5', name: '高橋部長', email: 'takahashi@example.com', role: 'manager', departmentId: 'dept2' },
    { id: 'admin1', name: '管理者', email: 'admin@example.com', role: 'admin', departmentId: 'dept1' },
  ];

  const sampleSkills: Skill[] = [
    { id: 'skill1', name: 'TypeScript', description: 'TypeScriptプログラミング', category: '技術' },
    { id: 'skill2', name: 'React', description: 'Reactフレームワーク', category: '技術' },
    { id: 'skill3', name: 'コミュニケーション', description: 'チーム内コミュニケーション', category: 'ソフトスキル' },
    { id: 'skill4', name: 'プロジェクト管理', description: 'プロジェクトの計画と管理', category: 'マネジメント' },
    { id: 'skill5', name: 'データ分析', description: 'データの収集と分析', category: '技術' },
    { id: 'skill6', name: 'プレゼンテーション', description: '効果的なプレゼン技術', category: 'ソフトスキル' },
  ];

  const sampleSkillProfiles: UserSkillProfile[] = [
    {
      userId: 'user1',
      skills: [
        { skillId: 'skill1', currentLevel: 3, targetLevel: 5 },
        { skillId: 'skill2', currentLevel: 4, targetLevel: 5 },
        { skillId: 'skill3', currentLevel: 3, targetLevel: 4 },
        { skillId: 'skill4', currentLevel: 2, targetLevel: 4 },
        { skillId: 'skill5', currentLevel: 2, targetLevel: 3 },
        { skillId: 'skill6', currentLevel: 3, targetLevel: 4 },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      userId: 'user3',
      skills: [
        { skillId: 'skill1', currentLevel: 4, targetLevel: 5 },
        { skillId: 'skill2', currentLevel: 3, targetLevel: 5 },
        { skillId: 'skill3', currentLevel: 4, targetLevel: 5 },
        { skillId: 'skill4', currentLevel: 3, targetLevel: 4 },
        { skillId: 'skill5', currentLevel: 3, targetLevel: 4 },
        { skillId: 'skill6', currentLevel: 2, targetLevel: 4 },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      userId: 'user4',
      skills: [
        { skillId: 'skill1', currentLevel: 2, targetLevel: 4 },
        { skillId: 'skill2', currentLevel: 2, targetLevel: 4 },
        { skillId: 'skill3', currentLevel: 4, targetLevel: 5 },
        { skillId: 'skill4', currentLevel: 2, targetLevel: 3 },
        { skillId: 'skill5', currentLevel: 4, targetLevel: 5 },
        { skillId: 'skill6', currentLevel: 3, targetLevel: 4 },
      ],
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleQuizzes: Quiz[] = [
    {
      id: 'quiz1',
      title: 'TypeScript基礎テスト',
      description: 'TypeScriptの基本的な知識を確認するテストです',
      questions: [
        {
          id: 'q1',
          text: 'TypeScriptは何の上位互換ですか？',
          type: 'single',
          options: ['Java', 'JavaScript', 'Python', 'C++'],
          correctAnswers: [1],
          points: 10,
          skillId: 'skill1',
        },
        {
          id: 'q2',
          text: 'TypeScriptの型注釈で正しいものはどれですか？',
          type: 'single',
          options: ['let x: number = 5', 'let x = number 5', 'number let x = 5', 'let x number: 5'],
          correctAnswers: [0],
          points: 10,
          skillId: 'skill1',
        },
        {
          id: 'q3',
          text: 'interfaceとtypeの違いを説明してください',
          type: 'text',
          correctAnswers: ['interface', 'type'],
          points: 20,
          skillId: 'skill1',
        },
      ],
      createdBy: 'admin1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skillIds: ['skill1'],
      passingScore: 60,
    },
  ];

  const sampleMaterials: Material[] = [
    {
      id: 'mat1',
      title: 'TypeScript入門ガイド',
      description: 'TypeScriptの基本を学ぶための資料です',
      type: 'document',
      url: '',
      content: `# TypeScript入門

## TypeScriptとは
TypeScriptはMicrosoftが開発した、JavaScriptに静的型付けを追加したプログラミング言語です。

## 基本的な型
- number: 数値
- string: 文字列
- boolean: 真偽値
- array: 配列
- object: オブジェクト

## 型注釈
\`\`\`typescript
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
\`\`\`
`,
      createdBy: 'admin1',
      createdAt: new Date().toISOString(),
      skillIds: ['skill1'],
    },
  ];

  setDepartments(sampleDepartments);
  setUsers(sampleUsers);
  setSkills(sampleSkills);
  setSkillProfiles(sampleSkillProfiles);
  setQuizzes(sampleQuizzes);
  setMaterials(sampleMaterials);
}
