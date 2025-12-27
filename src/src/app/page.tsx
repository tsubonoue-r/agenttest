'use client';

import { useEffect, useState } from 'react';
import SkillRadarChart from '@/components/SkillRadarChart';
import Link from 'next/link';
import {
  initializeSampleData,
  getCurrentUser,
  setCurrentUser,
  getUsers,
  getSkills,
  getUserSkillProfile,
  getQuizzes,
  getMaterials,
  getSchedulesForEmployee,
  getScheduleProgress,
  getEmployees,
} from '@/lib/storage';
import { User, Skill, Quiz, Material, RadarChartData, EducationSchedule, ScheduleProgress, Employee } from '@/types';

type TabType = 'dashboard' | 'schedules' | 'quizzes' | 'materials' | 'users';

export default function Home() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkillsState] = useState<Skill[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [radarData, setRadarData] = useState<RadarChartData[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mySchedules, setMySchedules] = useState<EducationSchedule[]>([]);
  const [scheduleProgress, setScheduleProgress] = useState<Record<string, ScheduleProgress>>({});
  const [employees, setEmployeesState] = useState<Employee[]>([]);

  useEffect(() => {
    initializeSampleData();
    const usersData = getUsers();
    const skillsData = getSkills();
    const quizzesData = getQuizzes();
    const materialsData = getMaterials();
    const employeesData = getEmployees();

    setUsers(usersData);
    setSkillsState(skillsData);
    setQuizzes(quizzesData);
    setMaterials(materialsData);
    setEmployeesState(employeesData);

    let user = getCurrentUser();
    if (!user && usersData.length > 0) {
      user = usersData[0];
      setCurrentUser(user);
    }
    setCurrentUserState(user);

    // Load schedules for current user
    if (user) {
      const schedules = getSchedulesForEmployee(user.id);
      setMySchedules(schedules);

      // Load progress for each schedule
      const progressMap: Record<string, ScheduleProgress> = {};
      schedules.forEach((schedule) => {
        const progress = getScheduleProgress(schedule.id, user!.id);
        if (progress) {
          progressMap[schedule.id] = progress;
        }
      });
      setScheduleProgress(progressMap);
    }

    if (user) {
      const profile = getUserSkillProfile(user.id);
      if (profile) {
        const data: RadarChartData[] = profile.skills.map((sl) => {
          const skill = skillsData.find((s) => s.id === sl.skillId);
          return {
            skill: skill?.name || sl.skillId,
            current: sl.currentLevel,
            target: sl.targetLevel,
            fullMark: 5,
          };
        });
        setRadarData(data);
      }
    }

    setIsInitialized(true);
  }, []);

  const handleUserChange = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentUserState(user);

      const profile = getUserSkillProfile(user.id);
      if (profile) {
        const data: RadarChartData[] = profile.skills.map((sl) => {
          const skill = skills.find((s) => s.id === sl.skillId);
          return {
            skill: skill?.name || sl.skillId,
            current: sl.currentLevel,
            target: sl.targetLevel,
            fullMark: 5,
          };
        });
        setRadarData(data);
      } else {
        setRadarData([]);
      }
    }
  };

  if (!isInitialized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-xl font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'schedules', label: 'My Schedule', icon: '📅' },
    { id: 'quizzes', label: 'Quizzes', icon: '📝' },
    { id: 'materials', label: 'Materials', icon: '📚' },
    { id: 'users', label: 'Users', icon: '👥' },
  ];

  const isManagerOrAdmin = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'} ${darkMode ? 'bg-gray-800/95' : 'bg-white/80'} backdrop-blur-xl shadow-2xl border-r ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
        {/* Logo */}
        <div className={`h-20 flex items-center ${sidebarOpen ? 'px-6' : 'justify-center'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🎓</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>E-Learn</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Learning Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}

          {/* Manager/Admin Link */}
          {isManagerOrAdmin && (
            <Link
              href="/manager"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4 ${
                darkMode
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="text-xl">👔</span>
              {sidebarOpen && <span className="font-medium">Manager Console</span>}
            </Link>
          )}

          {/* Admin Link */}
          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                darkMode
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <span className="text-xl">⚙️</span>
              {sidebarOpen && <span className="font-medium">Admin Console</span>}
            </Link>
          )}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-3 top-24 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
        >
          {sidebarOpen ? '←' : '→'}
        </button>

        {/* User Card */}
        {sidebarOpen && currentUser && (
          <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-indigo-50 to-purple-50'} border ${darkMode ? 'border-gray-600' : 'border-indigo-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentUser.name}</p>
                <p className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 h-20 flex items-center justify-between px-8 ${darkMode ? 'bg-gray-800/80' : 'bg-white/60'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back, {currentUser?.name}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* User Selector */}
            <select
              value={currentUser?.id || ''}
              onChange={(e) => handleUserChange(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                darkMode
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Quizzes', value: quizzes.length, icon: '📝', gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
                  { label: 'Total Materials', value: materials.length, icon: '📚', gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                  { label: 'Total Users', value: users.length, icon: '👥', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`group relative overflow-hidden rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl ${stat.shadow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                        <p className={`text-4xl font-bold mt-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {currentUser?.name} - Skill Profile
                  </h3>
                  <SkillRadarChart data={radarData} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Education Schedule</h2>
              </div>

              {mySchedules.length === 0 ? (
                <div className={`rounded-2xl p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-4xl mb-4">
                    📅
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>No Schedules Assigned</h3>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You dont have any education schedules assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySchedules.map((schedule) => {
                    const progress = scheduleProgress[schedule.id];
                    const progressPercent = progress?.progress || 0;
                    const isCompleted = progressPercent === 100;
                    const isPastDue = new Date(schedule.dueDate) < new Date() && !isCompleted;

                    return (
                      <div
                        key={schedule.id}
                        className={`group rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl hover:shadow-2xl transition-all duration-300 border ${
                          isCompleted
                            ? darkMode ? 'border-green-500/30' : 'border-green-200'
                            : isPastDue
                            ? darkMode ? 'border-red-500/30' : 'border-red-200'
                            : darkMode ? 'border-gray-700' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg ${
                              isCompleted
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : isPastDue
                                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}>
                              {isCompleted ? '✅' : isPastDue ? '⚠️' : '📚'}
                            </div>
                            <div>
                              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{schedule.title}</h3>
                              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{schedule.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Start: {new Date(schedule.startDate).toLocaleDateString('ja-JP')}
                                </span>
                                <span className={`text-xs ${isPastDue ? 'text-red-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Due: {new Date(schedule.dueDate).toLocaleDateString('ja-JP')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isCompleted
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                              : isPastDue
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                              : schedule.status === 'active'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                          }`}>
                            {isCompleted ? 'Completed' : isPastDue ? 'Past Due' : schedule.status}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Progress</span>
                            <span className={`text-sm font-bold ${
                              isCompleted ? 'text-green-500' : isPastDue ? 'text-red-500' : 'text-blue-500'
                            }`}>{progressPercent}%</span>
                          </div>
                          <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : isPastDue
                                  ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Materials and Quizzes Count */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span>📚</span>
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {progress?.completedMaterials?.length || 0}/{schedule.materials.length} Materials
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span>📝</span>
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {progress?.completedQuizzes?.length || 0}/{schedule.quizzes.length} Quizzes
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        {!isCompleted && (
                          <button className={`mt-4 w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                            isPastDue
                              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl'
                          }`}>
                            {isPastDue ? 'Resume Learning (Overdue)' : 'Continue Learning'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Available Quizzes</h2>
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  + Create Quiz
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={`group rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg">
                        📝
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                        {quiz.questions.length} questions
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{quiz.title}</h3>
                    <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{quiz.description}</p>
                    <button className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-blue-500/30">
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Learning Materials</h2>
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  + Add Material
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className={`group rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        material.type === 'document' ? 'bg-blue-100 text-blue-600' :
                        material.type === 'video' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {material.type === 'document' ? '📄' : material.type === 'video' ? '🎬' : '📎'}
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {material.type}
                      </span>
                    </div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{material.title}</h3>
                    <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{material.description}</p>
                    <button className={`mt-4 font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} transition-colors`}>
                      View Material →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  + Add User
                </button>
              </div>
              <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <table className="min-w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}`}>
                    <tr>
                      {['User', 'Email', 'Role', 'Actions'].map((header) => (
                        <th key={header} className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {users.map((user) => (
                      <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                            user.role === 'manager' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className={`px-3 py-1 rounded-lg text-sm font-medium ${darkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors`}>
                              Edit
                            </button>
                            <button className={`px-3 py-1 rounded-lg text-sm font-medium ${darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'} transition-colors`}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
