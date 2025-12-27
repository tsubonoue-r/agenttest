'use client';

import { LarkUser, LarkDepartment, LarkAuthToken } from '@/types';

// Lark API Configuration
const LARK_CONFIG = {
  appId: process.env.NEXT_PUBLIC_LARK_APP_ID || '',
  appSecret: process.env.LARK_APP_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_LARK_REDIRECT_URI || 'http://localhost:3001/auth/callback',
  baseUrl: 'https://open.larksuite.com/open-apis',
};

// ============================================
// Lark OAuth
// ============================================
export function getLarkAuthUrl(): string {
  const params = new URLSearchParams({
    app_id: LARK_CONFIG.appId,
    redirect_uri: LARK_CONFIG.redirectUri,
    state: generateState(),
  });
  return `https://open.larksuite.com/open-apis/authen/v1/authorize?${params.toString()}`;
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Mock Lark API for demo (実際の実装ではAPIを呼び出す)
export async function exchangeCodeForToken(code: string): Promise<LarkAuthToken> {
  // Demo: Return mock token
  console.log('Exchanging code for token:', code);
  return {
    access_token: 'mock_access_token_' + Date.now(),
    token_type: 'Bearer',
    expires_in: 7200,
    refresh_token: 'mock_refresh_token_' + Date.now(),
  };
}

export async function getLarkUserInfo(accessToken: string): Promise<LarkUser> {
  // Demo: Return mock user
  console.log('Getting user info with token:', accessToken);
  return {
    user_id: 'lark_user_' + Date.now(),
    open_id: 'open_id_' + Date.now(),
    name: 'Lark User',
    email: 'lark.user@example.com',
    avatar_url: undefined,
    department_ids: ['dept_1'],
  };
}

// ============================================
// Lark Tenant Users (テナントからユーザー取得)
// ============================================
export async function fetchLarkTenantUsers(): Promise<LarkUser[]> {
  // Demo: Return sample Lark users
  // 実際の実装では Lark API を呼び出す
  return [
    {
      user_id: 'lark_001',
      open_id: 'ou_001',
      name: '山田 太郎',
      email: 'yamada@company.com',
      avatar_url: undefined,
      department_ids: ['dev_dept'],
    },
    {
      user_id: 'lark_002',
      open_id: 'ou_002',
      name: '鈴木 花子',
      email: 'suzuki@company.com',
      avatar_url: undefined,
      department_ids: ['dev_dept'],
    },
    {
      user_id: 'lark_003',
      open_id: 'ou_003',
      name: '佐藤 一郎',
      email: 'sato@company.com',
      avatar_url: undefined,
      department_ids: ['sales_dept'],
    },
    {
      user_id: 'lark_004',
      open_id: 'ou_004',
      name: '田中 美咲',
      email: 'tanaka@company.com',
      avatar_url: undefined,
      department_ids: ['sales_dept'],
    },
    {
      user_id: 'lark_005',
      open_id: 'ou_005',
      name: '高橋 健太',
      email: 'takahashi@company.com',
      avatar_url: undefined,
      department_ids: ['hr_dept'],
    },
  ];
}

export async function fetchLarkDepartments(): Promise<LarkDepartment[]> {
  // Demo: Return sample Lark departments
  return [
    {
      department_id: 'dev_dept',
      name: '開発部',
      parent_department_id: undefined,
      member_count: 10,
    },
    {
      department_id: 'sales_dept',
      name: '営業部',
      parent_department_id: undefined,
      member_count: 8,
    },
    {
      department_id: 'hr_dept',
      name: '人事部',
      parent_department_id: undefined,
      member_count: 5,
    },
  ];
}

// ============================================
// Lark User Sync
// ============================================
export async function syncLarkUsersToLocal(): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    const larkUsers = await fetchLarkTenantUsers();
    // 実際の実装では、ここでローカルDBに保存
    synced = larkUsers.length;
  } catch (error) {
    errors.push(`Sync failed: ${error}`);
  }

  return { synced, errors };
}
