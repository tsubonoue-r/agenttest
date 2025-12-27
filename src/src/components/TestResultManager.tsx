'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { EducationTest, EducationSchedule, Employee } from '@/types';
import {
  getEducationTests,
  addEducationTest,
  updateEducationTest,
  deleteEducationTest,
  getSchedules,
  getEmployees,
  getSchedulePassRate,
} from '@/lib/storage';

interface TestResultManagerProps {
  darkMode: boolean;
  sectionId?: string;
}

export default function TestResultManager({ darkMode, sectionId }: TestResultManagerProps) {
  const [tests, setTests] = useState<EducationTest[]>([]);
  const [schedules, setSchedules] = useState<EducationSchedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<EducationTest | null>(null);
  const [filterSchedule, setFilterSchedule] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    scheduleId: '',
    employeeId: '',
    testDate: format(new Date(), 'yyyy-MM-dd'),
    score: 0,
    passed: false,
    retestDate: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTests(getEducationTests());
    const allSchedules = getSchedules();
    setSchedules(sectionId ? allSchedules.filter(s => s.sectionId === sectionId) : allSchedules);
    setEmployees(getEmployees());
  };

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
  const getScheduleName = (id: string) => schedules.find(s => s.id === id)?.title || 'Unknown';

  const filteredTests = filterSchedule === 'all'
    ? tests
    : tests.filter(t => t.scheduleId === filterSchedule);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (editingTest) {
      updateEducationTest({
        ...editingTest,
        ...formData,
        updatedAt: now,
      });
    } else {
      addEducationTest({
        id: `test_${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      });
    }

    loadData();
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      scheduleId: '',
      employeeId: '',
      testDate: format(new Date(), 'yyyy-MM-dd'),
      score: 0,
      passed: false,
      retestDate: '',
      notes: '',
    });
    setEditingTest(null);
  };

  const handleEdit = (test: EducationTest) => {
    setEditingTest(test);
    setFormData({
      scheduleId: test.scheduleId,
      employeeId: test.employeeId,
      testDate: test.testDate.split('T')[0],
      score: test.score,
      passed: test.passed,
      retestDate: test.retestDate?.split('T')[0] || '',
      notes: test.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this test result?')) {
      deleteEducationTest(id);
      loadData();
    }
  };

  const getAvailableEmployees = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return [];
    return employees.filter(e => schedule.assignedTo.includes(e.id));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {schedules.slice(0, 4).map(schedule => {
          const passRate = getSchedulePassRate(schedule.id);
          const total = passRate.passed + passRate.failed + passRate.pending;
          const passPercent = total > 0 ? Math.round((passRate.passed / total) * 100) : 0;

          return (
            <div
              key={schedule.id}
              className={`rounded-xl p-4 ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}
            >
              <h4 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {schedule.title}
              </h4>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm font-medium">{passRate.passed}</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/</span>
                  <span className="text-red-500 text-sm font-medium">{passRate.failed}</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/</span>
                  <span className="text-yellow-500 text-sm font-medium">{passRate.pending}</span>
                </div>
                <span className={`text-lg font-bold ${passPercent >= 80 ? 'text-green-500' : passPercent >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {passPercent}%
                </span>
              </div>
              <div className={`mt-2 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${passPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Results Table */}
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Test Results
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={filterSchedule}
              onChange={(e) => setFilterSchedule(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <option value="all">All Schedules</option>
              {schedules.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
            >
              + Add Result
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                {['Date', 'Employee', 'Schedule', 'Score', 'Status', 'Retest', 'Actions'].map((header) => (
                  <th key={header} className={`px-4 py-3 text-left text-xs font-bold uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {filteredTests.map((test) => (
                <tr key={test.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {format(new Date(test.testDate), 'yyyy/MM/dd')}
                  </td>
                  <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {getEmployeeName(test.employeeId).charAt(0)}
                      </div>
                      <span className="font-medium">{getEmployeeName(test.employeeId)}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getScheduleName(test.scheduleId)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-lg font-bold ${test.score >= 80 ? 'text-green-500' : test.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {test.score}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/100</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      test.passed
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {test.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {test.retestDate ? format(new Date(test.retestDate), 'yyyy/MM/dd') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(test)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          darkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(test.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan={7} className={`px-4 py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No test results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingTest ? 'Edit Test Result' : 'Add Test Result'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Schedule
                </label>
                <select
                  value={formData.scheduleId}
                  onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value, employeeId: '' })}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="">Select schedule</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Employee
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                  disabled={!formData.scheduleId}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                  } disabled:opacity-50`}
                >
                  <option value="">Select employee</option>
                  {getAvailableEmployees(formData.scheduleId).map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      setFormData({ ...formData, score, passed: score >= 60 });
                    }}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.passed}
                    onChange={(e) => setFormData({ ...formData, passed: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Passed
                  </span>
                </label>
              </div>

              {!formData.passed && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Retest Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.retestDate}
                    onChange={(e) => setFormData({ ...formData, retestDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
                >
                  {editingTest ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
