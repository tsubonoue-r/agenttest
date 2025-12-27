'use client';

import { useEffect, useState } from 'react';
import { Employee, Division, Section, RegisterData } from '@/types';
import {
  initializeSampleData,
  getEmployees,
  getDivisions,
  getSections,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  addDivision,
  updateDivision,
  deleteDivision,
  addSection,
  updateSection,
  deleteSection,
  getSectionsByDivision,
} from '@/lib/storage';
import { fetchLarkTenantUsers, getLarkAuthUrl } from '@/lib/lark';
import { registerLocal, loginLocal, getSession, logout } from '@/lib/auth';

type AdminTab = 'dashboard' | 'employees' | 'departments' | 'lark' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [divisions, setDivisionsState] = useState<Division[]>([]);
  const [sections, setSectionsState] = useState<Section[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showModal, setShowModal] = useState<'employee' | 'division' | 'section' | 'register' | null>(null);
  const [editingItem, setEditingItem] = useState<Employee | Division | Section | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
    divisionId: '',
    sectionId: '',
    isLarkUser: false,
  });

  useEffect(() => {
    initializeSampleData();
    loadData();
    setIsInitialized(true);
  }, []);

  const loadData = () => {
    setEmployeesState(getEmployees());
    setDivisionsState(getDivisions());
    setSectionsState(getSections());
  };

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email || !formData.divisionId || !formData.sectionId) {
      alert('必須項目を入力してください');
      return;
    }

    if (editingItem && 'email' in editingItem) {
      // Update
      updateEmployee({
        ...editingItem,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        divisionId: formData.divisionId,
        sectionId: formData.sectionId,
      });
    } else {
      // Add new
      const employee: Employee = {
        id: 'emp_' + Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        divisionId: formData.divisionId,
        sectionId: formData.sectionId,
        isLarkUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addEmployee(employee);
    }

    loadData();
    setShowModal(null);
    resetForm();
  };

  const handleRegisterLocal = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.divisionId || !formData.sectionId) {
      alert('必須項目を入力してください');
      return;
    }

    const result = registerLocal({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      divisionId: formData.divisionId,
      sectionId: formData.sectionId,
    });

    if (result.success) {
      alert('アカウントが作成されました');
      loadData();
      setShowModal(null);
      resetForm();
    } else {
      alert(result.error);
    }
  };

  const handleAddDivision = () => {
    if (!formData.name) {
      alert('部署名を入力してください');
      return;
    }

    if (editingItem && 'managerId' in editingItem) {
      updateDivision({ ...editingItem, name: formData.name });
    } else {
      addDivision({
        id: 'div_' + Date.now(),
        name: formData.name,
        createdAt: new Date().toISOString(),
      });
    }

    loadData();
    setShowModal(null);
    resetForm();
  };

  const handleAddSection = () => {
    if (!formData.name || !formData.divisionId) {
      alert('課名と所属部を入力してください');
      return;
    }

    if (editingItem && 'divisionId' in editingItem) {
      updateSection({ ...editingItem as Section, name: formData.name, divisionId: formData.divisionId });
    } else {
      addSection({
        id: 'sec_' + Date.now(),
        name: formData.name,
        divisionId: formData.divisionId,
        createdAt: new Date().toISOString(),
      });
    }

    loadData();
    setShowModal(null);
    resetForm();
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('この社員を削除しますか？')) {
      deleteEmployee(id);
      loadData();
    }
  };

  const handleDeleteDivision = (id: string) => {
    const hasEmployees = employees.some(e => e.divisionId === id);
    const hasSections = sections.some(s => s.divisionId === id);
    if (hasEmployees || hasSections) {
      alert('この部署には社員または課が所属しています。先に移動してください。');
      return;
    }
    if (confirm('この部署を削除しますか？')) {
      deleteDivision(id);
      loadData();
    }
  };

  const handleDeleteSection = (id: string) => {
    const hasEmployees = employees.some(e => e.sectionId === id);
    if (hasEmployees) {
      alert('この課には社員が所属しています。先に移動してください。');
      return;
    }
    if (confirm('この課を削除しますか？')) {
      deleteSection(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      divisionId: '',
      sectionId: '',
      isLarkUser: false,
    });
    setEditingItem(null);
  };

  const openEditModal = (type: 'employee' | 'division' | 'section', item: Employee | Division | Section) => {
    setEditingItem(item);
    if (type === 'employee' && 'email' in item) {
      setFormData({
        ...formData,
        name: item.name,
        email: item.email,
        role: item.role,
        divisionId: item.divisionId,
        sectionId: item.sectionId,
      });
    } else if (type === 'division') {
      setFormData({ ...formData, name: item.name });
    } else if (type === 'section' && 'divisionId' in item) {
      setFormData({ ...formData, name: item.name, divisionId: item.divisionId });
    }
    setShowModal(type);
  };

  const getDivisionName = (id: string) => divisions.find(d => d.id === id)?.name || '不明';
  const getSectionName = (id: string) => sections.find(s => s.id === id)?.name || '不明';

  const filteredEmployees = selectedDivision === 'all'
    ? employees
    : employees.filter(e => e.divisionId === selectedDivision);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'employees', label: '社員管理', icon: '👥' },
    { id: 'departments', label: '部署管理', icon: '🏢' },
    { id: 'lark', label: 'Lark連携', icon: '🔗' },
    { id: 'settings', label: '設定', icon: '⚙️' },
  ];

  if (!isInitialized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'}`}>
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 ${darkMode ? 'bg-gray-800' : 'bg-white/90'} backdrop-blur-xl shadow-2xl border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">⚙️</span>
            </div>
            <div>
              <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>管理コンソール</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <a href="/" className={`block text-center py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity`}>
            ← E-Learning に戻る
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: '総社員数', value: employees.length, icon: '👥', color: 'blue' },
              { label: '部署数', value: divisions.length, icon: '🏢', color: 'green' },
              { label: '課数', value: sections.length, icon: '📁', color: 'purple' },
              { label: 'Larkユーザー', value: employees.filter(e => e.isLarkUser).length, icon: '🔗', color: 'orange' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                    <p className={`text-3xl font-bold mt-1 text-${stat.color}-500`}>{stat.value}</p>
                  </div>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employees */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className={`px-4 py-2 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                >
                  <option value="all">全部署</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { resetForm(); setShowModal('register'); }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  + 新規アカウント作成
                </button>
                <button
                  onClick={() => { resetForm(); setShowModal('employee'); }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  + 社員追加
                </button>
              </div>
            </div>

            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <table className="min-w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {['社員名', 'メール', '部', '課', 'ロール', 'Lark', '操作'].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{emp.name}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{emp.email}</td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getDivisionName(emp.divisionId)}</td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getSectionName(emp.sectionId)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          emp.role === 'admin' ? 'bg-red-100 text-red-700' :
                          emp.role === 'manager' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>{emp.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        {emp.isLarkUser ? <span className="text-green-500">✓</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal('employee', emp)} className="text-blue-500 hover:text-blue-700 text-sm">編集</button>
                          <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-500 hover:text-red-700 text-sm">削除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Departments */}
        {activeTab === 'departments' && (
          <div className="space-y-8">
            {/* Divisions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>部</h3>
                <button
                  onClick={() => { resetForm(); setShowModal('division'); }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg"
                >
                  + 部を追加
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {divisions.map((div) => (
                  <div key={div.id} className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{div.name}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {employees.filter(e => e.divisionId === div.id).length} 名
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal('division', div)} className="text-blue-500 text-sm">編集</button>
                        <button onClick={() => handleDeleteDivision(div.id)} className="text-red-500 text-sm">削除</button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {getSectionsByDivision(div.id).map(sec => (
                        <div key={sec.id} className={`flex justify-between items-center px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{sec.name}</span>
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal('section', sec)} className="text-blue-500 text-xs">編集</button>
                            <button onClick={() => handleDeleteSection(sec.id)} className="text-red-500 text-xs">削除</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>課</h3>
                <button
                  onClick={() => { resetForm(); setShowModal('section'); }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg"
                >
                  + 課を追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lark */}
        {activeTab === 'lark' && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Lark OAuth ログイン</h3>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Larkアカウントでログインすると、テナントのユーザー情報を取得できます。
              </p>
              <a
                href={getLarkAuthUrl()}
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                🔗 Larkでログイン
              </a>
            </div>

            <div className={`rounded-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Larkテナントからユーザー取得</h3>
              <button
                onClick={async () => {
                  const users = await fetchLarkTenantUsers();
                  alert(`${users.length}名のLarkユーザーを取得しました`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg"
              >
                ユーザー同期
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className={`rounded-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>設定</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>設定項目は準備中です。</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {showModal === 'employee' ? (editingItem ? '社員編集' : '社員追加') :
               showModal === 'division' ? (editingItem ? '部編集' : '部追加') :
               showModal === 'section' ? (editingItem ? '課編集' : '課追加') :
               '新規アカウント作成'}
            </h3>

            <div className="space-y-4">
              {(showModal === 'employee' || showModal === 'register') && (
                <>
                  <input
                    type="text"
                    placeholder="氏名 *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                  <input
                    type="email"
                    placeholder="メールアドレス *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                  {showModal === 'register' && (
                    <input
                      type="password"
                      placeholder="パスワード *"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                    />
                  )}
                  {showModal === 'employee' && (
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'employee' | 'manager' | 'admin' })}
                      className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                    >
                      <option value="employee">社員</option>
                      <option value="manager">マネージャー</option>
                      <option value="admin">管理者</option>
                    </select>
                  )}
                  <select
                    value={formData.divisionId}
                    onChange={(e) => setFormData({ ...formData, divisionId: e.target.value, sectionId: '' })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="">部を選択 *</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                    disabled={!formData.divisionId}
                  >
                    <option value="">課を選択 *</option>
                    {sections.filter(s => s.divisionId === formData.divisionId).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </>
              )}

              {showModal === 'division' && (
                <input
                  type="text"
                  placeholder="部署名 *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                />
              )}

              {showModal === 'section' && (
                <>
                  <select
                    value={formData.divisionId}
                    onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="">所属部を選択 *</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="課名 *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(null); resetForm(); }}
                className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (showModal === 'employee') handleAddEmployee();
                  else if (showModal === 'division') handleAddDivision();
                  else if (showModal === 'section') handleAddSection();
                  else if (showModal === 'register') handleRegisterLocal();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium"
              >
                {editingItem ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
