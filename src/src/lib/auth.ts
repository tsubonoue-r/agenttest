'use client';

import { AuthSession, LoginCredentials, RegisterData, Employee } from '@/types';
import { getEmployees, addEmployee, getEmployeeByEmail } from './storage';

const AUTH_KEY = 'elearning_auth_session';
const LOCAL_ACCOUNTS_KEY = 'elearning_local_accounts';

// ============================================
// Session Management
// ============================================
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return null;

  const parsed = JSON.parse(session) as AuthSession;
  if (new Date(parsed.expiresAt) < new Date()) {
    logout();
    return null;
  }
  return parsed;
}

export function setSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// ============================================
// Local Account Storage
// ============================================
interface LocalAccount {
  email: string;
  passwordHash: string;
  employeeId: string;
}

function getLocalAccounts(): LocalAccount[] {
  if (typeof window === 'undefined') return [];
  const accounts = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
  return accounts ? JSON.parse(accounts) : [];
}

function saveLocalAccounts(accounts: LocalAccount[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Simple hash for demo (実際の実装ではbcryptなどを使用)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// ============================================
// Local Authentication
// ============================================
export function loginLocal(credentials: LoginCredentials): { success: boolean; error?: string; session?: AuthSession } {
  const accounts = getLocalAccounts();
  const account = accounts.find(a => a.email === credentials.email);

  if (!account) {
    return { success: false, error: 'アカウントが見つかりません' };
  }

  if (account.passwordHash !== simpleHash(credentials.password)) {
    return { success: false, error: 'パスワードが正しくありません' };
  }

  const employee = getEmployees().find(e => e.id === account.employeeId);
  if (!employee) {
    return { success: false, error: '社員情報が見つかりません' };
  }

  const session: AuthSession = {
    userId: employee.id,
    email: employee.email,
    name: employee.name,
    role: employee.role,
    isLarkUser: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間
  };

  setSession(session);
  return { success: true, session };
}

export function registerLocal(data: RegisterData): { success: boolean; error?: string; employee?: Employee } {
  const accounts = getLocalAccounts();

  // 既存アカウントチェック
  if (accounts.some(a => a.email === data.email)) {
    return { success: false, error: 'このメールアドレスは既に登録されています' };
  }

  // 社員作成
  const employee: Employee = {
    id: 'emp_' + Date.now(),
    name: data.name,
    email: data.email,
    role: 'employee',
    divisionId: data.divisionId,
    sectionId: data.sectionId,
    isLarkUser: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addEmployee(employee);

  // ローカルアカウント作成
  const account: LocalAccount = {
    email: data.email,
    passwordHash: simpleHash(data.password),
    employeeId: employee.id,
  };

  accounts.push(account);
  saveLocalAccounts(accounts);

  return { success: true, employee };
}

// ============================================
// Lark Authentication
// ============================================
export function loginWithLark(larkUserId: string, larkOpenId: string, accessToken: string, userInfo: { name: string; email: string }): { success: boolean; session?: AuthSession } {
  // Larkユーザーを社員として登録または取得
  let employee = getEmployeeByEmail(userInfo.email);

  if (!employee) {
    // 新規Larkユーザーの場合、デフォルト部署で登録
    employee = {
      id: 'emp_lark_' + Date.now(),
      name: userInfo.name,
      email: userInfo.email,
      role: 'employee',
      divisionId: 'div_unassigned',
      sectionId: 'sec_unassigned',
      larkUserId,
      larkOpenId,
      isLarkUser: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addEmployee(employee);
  }

  const session: AuthSession = {
    userId: employee.id,
    email: employee.email,
    name: employee.name,
    role: employee.role,
    isLarkUser: true,
    larkAccessToken: accessToken,
    expiresAt: new Date(Date.now() + 7200 * 1000).toISOString(), // 2時間
  };

  setSession(session);
  return { success: true, session };
}
