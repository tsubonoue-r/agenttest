'use client';

import { useEffect, useState } from 'react';
import { Employee, Division, Section, EducationSchedule, Material, Quiz } from '@/types';
import {
  initializeSampleData,
  getEmployees,
  getDivisions,
  getSections,
  getSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesBySection,
  getMaterials,
  getQuizzes,
  getProgressForSchedule,
  calculateProgress,
} from '@/lib/storage';

type ManagerTab = 'dashboard' | 'schedules' | 'members' | 'reports';

export default function ManagerPage() {
  const [activeTab, setActiveTab] = useState<ManagerTab>('dashboard');
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [divisions, setDivisionsState] = useState<Division[]>([]);
  const [sections, setSectionsState] = useState<Section[]>([]);
  const [schedules, setSchedulesState] = useState<EducationSchedule[]>([]);
  const [materials, setMaterialsState] = useState<Material[]>([]);
  const [quizzes, setQuizzesState] = useState<Quiz[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EducationSchedule | null>(null);

  // 仮の現在ユーザー (課長)
  const [currentManager] = useState<Employee>({
    id: 'emp2',
    name: '鈴木 課長',
    email: 'suzuki@example.com',
    role: 'manager',
    divisionId: 'div_dev',
    sectionId: 'sec_dev1',
    isLarkUser: true,
    createdAt: '',
    updatedAt: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    materials: [] as string[],
    quizzes: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    setSchedulesState(getSchedules());
    setMaterialsState(getMaterials());
    setQuizzesState(getQuizzes());
  };

  // 自分の課の社員のみ
  const myTeamMembers = employees.filter(e => e.sectionId === currentManager.sectionId && e.id !== currentManager.id);
  // 自分の課のスケジュール
  const mySchedules = schedules.filter(s => s.sectionId === currentManager.sectionId);

  const handleCreateSchedule = () => {
    if (!formData.title || formData.assignedTo.length === 0) {
      alert('タイトルと対象者を入力してください');
      return;
    }

    const now = new Date().toISOString();
    if (editingSchedule) {
      updateSchedule({
        ...editingSchedule,
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        materials: formData.materials,
        quizzes: formData.quizzes,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
      });
    } else {
      const schedule: EducationSchedule = {
        id: 'sch_' + Date.now(),
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        assignedBy: currentManager.id,
        sectionId: currentManager.sectionId,
        materials: formData.materials,
        quizzes: formData.quizzes,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      addSchedule(schedule);
    }

    loadData();
    setShowModal(false);
    resetForm();
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('このスケジュールを削除しますか？')) {
      deleteSchedule(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: [],
      materials: [],
      quizzes: [],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setEditingSchedule(null);
  };

  const openEditModal = (schedule: EducationSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description,
      assignedTo: schedule.assignedTo,
      materials: schedule.materials,
      quizzes: schedule.quizzes,
      startDate: schedule.startDate.split('T')[0],
      dueDate: schedule.dueDate.split('T')[0],
    });
    setShowModal(true);
  };

  const getDivisionName = (id: string) => divisions.find(d => d.id === id)?.name || '';
  const getSectionName = (id: string) => sections.find(s => s.id === id)?.name || '';
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || '';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'schedules', label: 'スケジュール管理', icon: '📅' },
    { id: 'members', label: '課員一覧', icon: '👥' },
    { id: 'reports', label: 'レポート', icon: '📈' },
  ];

  if (!isInitialized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50'}`}>
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50'}`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 ${darkMode ? 'bg-gray-800' : 'bg-white/90'} backdrop-blur-xl shadow-2xl`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">👔</span>
            </div>
            <div>
              <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Manager</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>教育管理</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ManagerTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Current Manager Info */}
        <div className={`absolute bottom-20 left-4 right-4 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
              {currentManager.name.charAt(0)}
            </div>
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentManager.name}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {getDivisionName(currentManager.divisionId)} / {getSectionName(currentManager.sectionId)}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <a href="/" className={`block text-center py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:opacity-80`}>
            ← ホームに戻る
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {getSectionName(currentManager.sectionId)} の教育管理
            </p>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: '課員数', value: myTeamMembers.length, icon: '👥', color: 'blue' },
                { label: 'スケジュール数', value: mySchedules.length, icon: '📅', color: 'orange' },
                { label: '進行中', value: mySchedules.filter(s => s.status === 'active').length, icon: '🔄', color: 'green' },
                { label: '完了', value: mySchedules.filter(s => s.status === 'completed').length, icon: '✅', color: 'purple' },
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

            {/* 進行中のスケジュール */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>進行中のスケジュール</h3>
              <div className="space-y-4">
                {mySchedules.filter(s => s.status === 'active').map(schedule => (
                  <div key={schedule.id} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{schedule.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          対象: {schedule.assignedTo.map(id => getEmployeeName(id)).join(', ')}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          期限: {new Date(schedule.dueDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">進行中</span>
                    </div>
                  </div>
                ))}
                {mySchedules.filter(s => s.status === 'active').length === 0 && (
                  <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>進行中のスケジュールはありません</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedules */}
        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                + 新規スケジュール作成
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mySchedules.map(schedule => (
                <div key={schedule.id} className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{schedule.title}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{schedule.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      schedule.status === 'active' ? 'bg-green-100 text-green-700' :
                      schedule.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {schedule.status === 'active' ? '進行中' : schedule.status === 'completed' ? '完了' : '下書き'}
                    </span>
                  </div>

                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                    <p>📚 教材: {schedule.materials.length}件</p>
                    <p>📝 クイズ: {schedule.quizzes.length}件</p>
                    <p>👥 対象者: {schedule.assignedTo.length}名</p>
                    <p>📅 期限: {new Date(schedule.dueDate).toLocaleDateString('ja-JP')}</p>
                  </div>

                  {/* 進捗バー */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>全体進捗</span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {Math.round(schedule.assignedTo.reduce((acc, empId) => acc + calculateProgress(schedule.id, empId), 0) / Math.max(schedule.assignedTo.length, 1))}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                        style={{ width: `${Math.round(schedule.assignedTo.reduce((acc, empId) => acc + calculateProgress(schedule.id, empId), 0) / Math.max(schedule.assignedTo.length, 1))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        {activeTab === 'members' && (
          <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <table className="min-w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['社員名', 'メール', 'ロール', '割当スケジュール', '進捗'].map(h => (
                    <th key={h} className={`px-6 py-4 text-left text-xs font-bold uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {myTeamMembers.map(emp => {
                  const empSchedules = mySchedules.filter(s => s.assignedTo.includes(emp.id));
                  const avgProgress = empSchedules.length > 0
                    ? Math.round(empSchedules.reduce((acc, s) => acc + calculateProgress(s.id, emp.id), 0) / empSchedules.length)
                    : 0;
                  return (
                    <tr key={emp.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{emp.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{emp.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{emp.role}</span>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{empSchedules.length}件</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-20 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${avgProgress}%` }}></div>
                          </div>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{avgProgress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className={`rounded-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>課全体の学習状況</h3>
            <div className="space-y-4">
              {myTeamMembers.map(emp => {
                const empSchedules = mySchedules.filter(s => s.assignedTo.includes(emp.id));
                const avgProgress = empSchedules.length > 0
                  ? Math.round(empSchedules.reduce((acc, s) => acc + calculateProgress(s.id, emp.id), 0) / empSchedules.length)
                  : 0;
                return (
                  <div key={emp.id} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{emp.name}</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{avgProgress}%</span>
                    </div>
                    <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-full ${avgProgress >= 80 ? 'bg-green-500' : avgProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${avgProgress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingSchedule ? 'スケジュール編集' : '新規スケジュール作成'}
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="タイトル *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              />
              <textarea
                placeholder="説明"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                rows={3}
              />

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>対象者 *</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {myTeamMembers.map(emp => (
                    <label key={emp.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, assignedTo: [...formData.assignedTo, emp.id] });
                          } else {
                            setFormData({ ...formData, assignedTo: formData.assignedTo.filter(id => id !== emp.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>教材</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {materials.map(mat => (
                    <label key={mat.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.materials.includes(mat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, materials: [...formData.materials, mat.id] });
                          } else {
                            setFormData({ ...formData, materials: formData.materials.filter(id => id !== mat.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{mat.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>クイズ</label>
                <div className="space-y-2">
                  {quizzes.map(quiz => (
                    <label key={quiz.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.quizzes.includes(quiz.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, quizzes: [...formData.quizzes, quiz.id] });
                          } else {
                            setFormData({ ...formData, quizzes: formData.quizzes.filter(id => id !== quiz.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{quiz.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>開始日</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>期限</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateSchedule}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium"
              >
                {editingSchedule ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
