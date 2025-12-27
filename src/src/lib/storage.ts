'use client';

import { User, Quiz, Material, UserSkillProfile, QuizAttempt, Skill, Department, Division, Section, Employee, EducationSchedule, ScheduleProgress, EducationTest, CalendarEvent } from '@/types';

const STORAGE_KEYS = {
  USERS: 'elearning_users',
  EMPLOYEES: 'elearning_employees',
  DIVISIONS: 'elearning_divisions',
  SECTIONS: 'elearning_sections',
  QUIZZES: 'elearning_quizzes',
  MATERIALS: 'elearning_materials',
  SKILL_PROFILES: 'elearning_skill_profiles',
  QUIZ_ATTEMPTS: 'elearning_quiz_attempts',
  SKILLS: 'elearning_skills',
  DEPARTMENTS: 'elearning_departments',
  CURRENT_USER: 'elearning_current_user',
  SCHEDULES: 'elearning_schedules',
  SCHEDULE_PROGRESS: 'elearning_schedule_progress',
  EDUCATION_TESTS: 'elearning_education_tests',
};

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ============================================
// Divisions (部)
// ============================================
export function getDivisions(): Division[] {
  return getItem<Division[]>(STORAGE_KEYS.DIVISIONS, []);
}

export function setDivisions(divisions: Division[]): void {
  setItem(STORAGE_KEYS.DIVISIONS, divisions);
}

export function addDivision(division: Division): void {
  const divisions = getDivisions();
  divisions.push(division);
  setDivisions(divisions);
}

export function updateDivision(division: Division): void {
  const divisions = getDivisions();
  const index = divisions.findIndex(d => d.id === division.id);
  if (index !== -1) {
    divisions[index] = division;
    setDivisions(divisions);
  }
}

export function deleteDivision(id: string): void {
  setDivisions(getDivisions().filter(d => d.id !== id));
}

// ============================================
// Sections (課)
// ============================================
export function getSections(): Section[] {
  return getItem<Section[]>(STORAGE_KEYS.SECTIONS, []);
}

export function setSections(sections: Section[]): void {
  setItem(STORAGE_KEYS.SECTIONS, sections);
}

export function addSection(section: Section): void {
  const sections = getSections();
  sections.push(section);
  setSections(sections);
}

export function updateSection(section: Section): void {
  const sections = getSections();
  const index = sections.findIndex(s => s.id === section.id);
  if (index !== -1) {
    sections[index] = section;
    setSections(sections);
  }
}

export function deleteSection(id: string): void {
  setSections(getSections().filter(s => s.id !== id));
}

export function getSectionsByDivision(divisionId: string): Section[] {
  return getSections().filter(s => s.divisionId === divisionId);
}

// ============================================
// Employees (社員)
// ============================================
export function getEmployees(): Employee[] {
  return getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
}

export function setEmployees(employees: Employee[]): void {
  setItem(STORAGE_KEYS.EMPLOYEES, employees);
}

export function addEmployee(employee: Employee): void {
  const employees = getEmployees();
  employees.push(employee);
  setEmployees(employees);
}

export function updateEmployee(employee: Employee): void {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index !== -1) {
    employees[index] = { ...employee, updatedAt: new Date().toISOString() };
    setEmployees(employees);
  }
}

export function deleteEmployee(id: string): void {
  setEmployees(getEmployees().filter(e => e.id !== id));
}

export function getEmployeeById(id: string): Employee | undefined {
  return getEmployees().find(e => e.id === id);
}

export function getEmployeeByEmail(email: string): Employee | undefined {
  return getEmployees().find(e => e.email === email);
}

export function getEmployeesByDivision(divisionId: string): Employee[] {
  return getEmployees().filter(e => e.divisionId === divisionId);
}

export function getEmployeesBySection(sectionId: string): Employee[] {
  return getEmployees().filter(e => e.sectionId === sectionId);
}

// ============================================
// Legacy Users (後方互換性)
// ============================================
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

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
}

// ============================================
// Quizzes
// ============================================
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
  setQuizzes(getQuizzes().filter(q => q.id !== id));
}

export function getQuizById(id: string): Quiz | undefined {
  return getQuizzes().find(q => q.id === id);
}

// ============================================
// Materials
// ============================================
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
  setMaterials(getMaterials().filter(m => m.id !== id));
}

// ============================================
// Skills
// ============================================
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

// ============================================
// Skill Profiles
// ============================================
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

// ============================================
// Quiz Attempts
// ============================================
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

// ============================================
// Departments (Legacy)
// ============================================
export function getDepartments(): Department[] {
  return getItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);
}

export function setDepartments(departments: Department[]): void {
  setItem(STORAGE_KEYS.DEPARTMENTS, departments);
}

// ============================================
// Initialize Sample Data
// ============================================
export function initializeSampleData(): void {
  // Divisions (部)
  if (getDivisions().length === 0) {
    const divisions: Division[] = [
      { id: 'div_dev', name: '開発部', createdAt: new Date().toISOString() },
      { id: 'div_sales', name: '営業部', createdAt: new Date().toISOString() },
      { id: 'div_hr', name: '人事部', createdAt: new Date().toISOString() },
    ];
    setDivisions(divisions);
  }

  // Sections (課)
  if (getSections().length === 0) {
    const sections: Section[] = [
      { id: 'sec_dev1', name: '開発1課', divisionId: 'div_dev', createdAt: new Date().toISOString() },
      { id: 'sec_dev2', name: '開発2課', divisionId: 'div_dev', createdAt: new Date().toISOString() },
      { id: 'sec_sales1', name: '営業1課', divisionId: 'div_sales', createdAt: new Date().toISOString() },
      { id: 'sec_sales2', name: '営業2課', divisionId: 'div_sales', createdAt: new Date().toISOString() },
      { id: 'sec_hr1', name: '人事1課', divisionId: 'div_hr', createdAt: new Date().toISOString() },
    ];
    setSections(sections);
  }

  // Employees (社員)
  if (getEmployees().length === 0) {
    const now = new Date().toISOString();
    const employees: Employee[] = [
      { id: 'emp1', name: '山田 太郎', email: 'yamada@example.com', role: 'employee', divisionId: 'div_dev', sectionId: 'sec_dev1', isLarkUser: true, larkUserId: 'lark_001', createdAt: now, updatedAt: now },
      { id: 'emp2', name: '鈴木 課長', email: 'suzuki@example.com', role: 'manager', divisionId: 'div_dev', sectionId: 'sec_dev1', isLarkUser: true, larkUserId: 'lark_002', createdAt: now, updatedAt: now },
      { id: 'emp3', name: '佐藤 花子', email: 'sato@example.com', role: 'employee', divisionId: 'div_dev', sectionId: 'sec_dev2', isLarkUser: false, createdAt: now, updatedAt: now },
      { id: 'emp4', name: '田中 一郎', email: 'tanaka@example.com', role: 'employee', divisionId: 'div_sales', sectionId: 'sec_sales1', isLarkUser: true, larkUserId: 'lark_003', createdAt: now, updatedAt: now },
      { id: 'emp5', name: '高橋 部長', email: 'takahashi@example.com', role: 'manager', divisionId: 'div_sales', sectionId: 'sec_sales1', isLarkUser: false, createdAt: now, updatedAt: now },
      { id: 'admin1', name: '管理者', email: 'admin@example.com', role: 'admin', divisionId: 'div_hr', sectionId: 'sec_hr1', isLarkUser: false, createdAt: now, updatedAt: now },
    ];
    setEmployees(employees);
  }

  // Legacy data for backward compatibility
  if (getUsers().length === 0) {
    const users: User[] = [
      { id: 'user1', name: '山田太郎', email: 'yamada@example.com', role: 'employee', departmentId: 'dept1', managerId: 'user2' },
      { id: 'user2', name: '鈴木課長', email: 'suzuki@example.com', role: 'manager', departmentId: 'dept1' },
      { id: 'user3', name: '佐藤花子', email: 'sato@example.com', role: 'employee', departmentId: 'dept1', managerId: 'user2' },
      { id: 'user4', name: '田中一郎', email: 'tanaka@example.com', role: 'employee', departmentId: 'dept1', managerId: 'user2' },
      { id: 'user5', name: '高橋部長', email: 'takahashi@example.com', role: 'manager', departmentId: 'dept2' },
      { id: 'admin1', name: '管理者', email: 'admin@example.com', role: 'admin', departmentId: 'dept1' },
    ];
    setUsers(users);
  }

  if (getDepartments().length === 0) {
    const departments: Department[] = [
      { id: 'dept1', name: '開発部', managerId: 'user2' },
      { id: 'dept2', name: '営業部', managerId: 'user5' },
    ];
    setDepartments(departments);
  }

  if (getSkills().length === 0) {
    const skills: Skill[] = [
      { id: 'skill1', name: 'TypeScript', description: 'TypeScriptプログラミング', category: '技術' },
      { id: 'skill2', name: 'React', description: 'Reactフレームワーク', category: '技術' },
      { id: 'skill3', name: 'コミュニケーション', description: 'チーム内コミュニケーション', category: 'ソフトスキル' },
      { id: 'skill4', name: 'プロジェクト管理', description: 'プロジェクトの計画と管理', category: 'マネジメント' },
      { id: 'skill5', name: 'データ分析', description: 'データの収集と分析', category: '技術' },
      { id: 'skill6', name: 'プレゼンテーション', description: '効果的なプレゼン技術', category: 'ソフトスキル' },
    ];
    setSkills(skills);
  }

  if (getSkillProfiles().length === 0) {
    const profiles: UserSkillProfile[] = [
      { userId: 'user1', skills: [{ skillId: 'skill1', currentLevel: 3, targetLevel: 5 }, { skillId: 'skill2', currentLevel: 4, targetLevel: 5 }], updatedAt: new Date().toISOString() },
    ];
    setSkillProfiles(profiles);
  }

  if (getQuizzes().length === 0) {
    const quizzes: Quiz[] = [
      {
        id: 'quiz1',
        title: 'TypeScript基礎テスト',
        description: 'TypeScriptの基本的な知識を確認するテストです',
        questions: [
          { id: 'q1', text: 'TypeScriptは何の上位互換ですか？', type: 'single', options: ['Java', 'JavaScript', 'Python', 'C++'], correctAnswers: [1], points: 10, skillId: 'skill1' },
        ],
        createdBy: 'admin1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skillIds: ['skill1'],
        passingScore: 60,
      },
    ];
    setQuizzes(quizzes);
  }

  if (getMaterials().length === 0) {
    const materials: Material[] = [
      { id: 'mat1', title: 'TypeScript入門ガイド', description: 'TypeScriptの基本を学ぶための資料です', type: 'document', url: '', content: '# TypeScript入門\n\nTypeScriptはMicrosoftが開発した言語です。', createdBy: 'admin1', createdAt: new Date().toISOString(), skillIds: ['skill1'] },
      { id: 'mat2', title: 'React基礎', description: 'Reactコンポーネントの作り方', type: 'document', url: '', content: '# React基礎', createdBy: 'admin1', createdAt: new Date().toISOString(), skillIds: ['skill2'] },
      { id: 'mat3', title: 'ビジネスマナー研修', description: '社会人としての基本マナー', type: 'document', url: '', content: '# ビジネスマナー', createdBy: 'admin1', createdAt: new Date().toISOString(), skillIds: ['skill3'] },
    ];
    setMaterials(materials);
  }

  // Sample schedules
  if (getSchedules().length === 0) {
    const now = new Date().toISOString();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const schedules: EducationSchedule[] = [
      {
        id: 'sch1',
        title: 'TypeScript基礎研修',
        description: '新入社員向けTypeScript研修',
        assignedTo: ['emp1', 'emp3'],
        assignedBy: 'emp2',
        sectionId: 'sec_dev1',
        materials: ['mat1'],
        quizzes: ['quiz1'],
        startDate: now,
        dueDate: nextWeek,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ];
    setSchedules(schedules);
  }
}

// ============================================
// Education Schedules (教育スケジュール)
// ============================================
export function getSchedules(): EducationSchedule[] {
  return getItem<EducationSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
}

export function setSchedules(schedules: EducationSchedule[]): void {
  setItem(STORAGE_KEYS.SCHEDULES, schedules);
}

export function addSchedule(schedule: EducationSchedule): void {
  const schedules = getSchedules();
  schedules.push(schedule);
  setSchedules(schedules);
}

export function updateSchedule(schedule: EducationSchedule): void {
  const schedules = getSchedules();
  const index = schedules.findIndex(s => s.id === schedule.id);
  if (index !== -1) {
    schedules[index] = { ...schedule, updatedAt: new Date().toISOString() };
    setSchedules(schedules);
  }
}

export function deleteSchedule(id: string): void {
  setSchedules(getSchedules().filter(s => s.id !== id));
}

export function getScheduleById(id: string): EducationSchedule | undefined {
  return getSchedules().find(s => s.id === id);
}

export function getSchedulesBySection(sectionId: string): EducationSchedule[] {
  return getSchedules().filter(s => s.sectionId === sectionId);
}

export function getSchedulesForEmployee(employeeId: string): EducationSchedule[] {
  return getSchedules().filter(s => s.assignedTo.includes(employeeId) && s.status === 'active');
}

// ============================================
// Schedule Progress (進捗管理)
// ============================================
export function getScheduleProgress(): ScheduleProgress[] {
  return getItem<ScheduleProgress[]>(STORAGE_KEYS.SCHEDULE_PROGRESS, []);
}

export function setScheduleProgress(progress: ScheduleProgress[]): void {
  setItem(STORAGE_KEYS.SCHEDULE_PROGRESS, progress);
}

export function getProgressForSchedule(scheduleId: string): ScheduleProgress[] {
  return getScheduleProgress().filter(p => p.scheduleId === scheduleId);
}

export function getProgressForEmployee(employeeId: string): ScheduleProgress[] {
  return getScheduleProgress().filter(p => p.employeeId === employeeId);
}

export function updateProgress(progress: ScheduleProgress): void {
  const allProgress = getScheduleProgress();
  const index = allProgress.findIndex(p => p.scheduleId === progress.scheduleId && p.employeeId === progress.employeeId);
  if (index !== -1) {
    allProgress[index] = progress;
  } else {
    allProgress.push(progress);
  }
  setScheduleProgress(allProgress);
}

export function calculateProgress(scheduleId: string, employeeId: string): number {
  const schedule = getScheduleById(scheduleId);
  const progress = getScheduleProgress().find(p => p.scheduleId === scheduleId && p.employeeId === employeeId);

  if (!schedule || !progress) return 0;

  const totalItems = schedule.materials.length + schedule.quizzes.length;
  if (totalItems === 0) return 100;

  const completedItems = progress.completedMaterials.length + progress.completedQuizzes.length;
  return Math.round((completedItems / totalItems) * 100);
}

// ============================================
// Education Tests (確認テスト)
// ============================================
export function getEducationTests(): EducationTest[] {
  return getItem<EducationTest[]>(STORAGE_KEYS.EDUCATION_TESTS, []);
}

export function setEducationTests(tests: EducationTest[]): void {
  setItem(STORAGE_KEYS.EDUCATION_TESTS, tests);
}

export function addEducationTest(test: EducationTest): void {
  const tests = getEducationTests();
  tests.push(test);
  setEducationTests(tests);
}

export function updateEducationTest(test: EducationTest): void {
  const tests = getEducationTests();
  const index = tests.findIndex(t => t.id === test.id);
  if (index !== -1) {
    tests[index] = { ...test, updatedAt: new Date().toISOString() };
    setEducationTests(tests);
  }
}

export function deleteEducationTest(id: string): void {
  setEducationTests(getEducationTests().filter(t => t.id !== id));
}

export function getTestById(id: string): EducationTest | undefined {
  return getEducationTests().find(t => t.id === id);
}

export function getTestsBySchedule(scheduleId: string): EducationTest[] {
  return getEducationTests().filter(t => t.scheduleId === scheduleId);
}

export function getTestsByEmployee(employeeId: string): EducationTest[] {
  return getEducationTests().filter(t => t.employeeId === employeeId);
}

export function getTestsByScheduleAndEmployee(scheduleId: string, employeeId: string): EducationTest[] {
  return getEducationTests().filter(t => t.scheduleId === scheduleId && t.employeeId === employeeId);
}

// Get pass rate for a schedule
export function getSchedulePassRate(scheduleId: string): { passed: number; failed: number; pending: number } {
  const schedule = getScheduleById(scheduleId);
  if (!schedule) return { passed: 0, failed: 0, pending: 0 };

  const tests = getTestsBySchedule(scheduleId);
  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;
  const pending = schedule.assignedTo.length - tests.length;

  return { passed, failed, pending };
}

// ============================================
// Calendar Events Generation
// ============================================
export function generateCalendarEvents(sectionId?: string): CalendarEvent[] {
  const schedules = sectionId ? getSchedulesBySection(sectionId) : getSchedules();
  const tests = getEducationTests();
  const employees = getEmployees();
  const events: CalendarEvent[] = [];

  // Employee color map
  const employeeColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  schedules.forEach(schedule => {
    schedule.assignedTo.forEach((empId, index) => {
      const employee = employees.find(e => e.id === empId);
      if (!employee) return;

      const color = employeeColors[index % employeeColors.length];

      // Education event
      events.push({
        id: `edu-${schedule.id}-${empId}`,
        type: 'education',
        scheduleId: schedule.id,
        employeeId: empId,
        employeeName: employee.name,
        title: `${schedule.title} - ${employee.name}`,
        date: schedule.startDate,
        endDate: schedule.dueDate,
        status: schedule.status === 'completed' ? 'completed' : 'in_progress',
        color,
      });
    });
  });

  // Add test events
  tests.forEach(test => {
    const schedule = getScheduleById(test.scheduleId);
    const employee = employees.find(e => e.id === test.employeeId);
    if (!schedule || !employee) return;

    events.push({
      id: `test-${test.id}`,
      type: test.retestDate ? 'retest' : 'test',
      scheduleId: test.scheduleId,
      employeeId: test.employeeId,
      employeeName: employee.name,
      title: `${test.passed ? '合格' : '不合格'}: ${schedule.title} - ${employee.name}`,
      date: test.testDate,
      status: test.passed ? 'passed' : 'failed',
    });

    // Add retest event if scheduled
    if (test.retestDate && !test.passed) {
      events.push({
        id: `retest-${test.id}`,
        type: 'retest',
        scheduleId: test.scheduleId,
        employeeId: test.employeeId,
        employeeName: employee.name,
        title: `再テスト: ${schedule.title} - ${employee.name}`,
        date: test.retestDate,
        status: 'scheduled',
      });
    }
  });

  return events;
}

// ============================================
// Gantt Chart Data Generation
// ============================================
export interface GanttTask {
  id: string;
  employeeId: string;
  employeeName: string;
  scheduleId: string;
  scheduleName: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  testStatus?: 'passed' | 'failed' | 'pending';
  color: string;
}

export function generateGanttTasks(sectionId?: string): GanttTask[] {
  const schedules = sectionId ? getSchedulesBySection(sectionId) : getSchedules();
  const employees = getEmployees();
  const allProgress = getScheduleProgress();
  const tests = getEducationTests();
  const tasks: GanttTask[] = [];

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  schedules.forEach(schedule => {
    schedule.assignedTo.forEach((empId, index) => {
      const employee = employees.find(e => e.id === empId);
      if (!employee) return;

      const progress = allProgress.find(p => p.scheduleId === schedule.id && p.employeeId === empId);
      const progressPercent = progress?.progress || 0;

      const now = new Date();
      const dueDate = new Date(schedule.dueDate);
      const isOverdue = dueDate < now && progressPercent < 100;

      const empTests = tests.filter(t => t.scheduleId === schedule.id && t.employeeId === empId);
      const latestTest = empTests.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0];

      let testStatus: 'passed' | 'failed' | 'pending' = 'pending';
      if (latestTest) {
        testStatus = latestTest.passed ? 'passed' : 'failed';
      }

      tasks.push({
        id: `${schedule.id}-${empId}`,
        employeeId: empId,
        employeeName: employee.name,
        scheduleId: schedule.id,
        scheduleName: schedule.title,
        startDate: schedule.startDate,
        endDate: schedule.dueDate,
        progress: progressPercent,
        status: isOverdue ? 'overdue' : progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'pending',
        testStatus,
        color: colors[index % colors.length],
      });
    });
  });

  return tasks;
}
