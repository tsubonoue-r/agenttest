'use client';

import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, differenceInDays, parseISO, isWithinInterval, addWeeks, subWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';
import { GanttTask } from '@/lib/storage';

interface ScheduleGanttProps {
  tasks: GanttTask[];
  darkMode: boolean;
  onTaskClick?: (task: GanttTask) => void;
}

export default function ScheduleGantt({ tasks, darkMode, onTaskClick }: ScheduleGanttProps) {
  const [viewStart, setViewStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [daysToShow, setDaysToShow] = useState(28);

  const viewEnd = addDays(viewStart, daysToShow - 1);

  const days = useMemo(() => {
    const daysArray: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      daysArray.push(addDays(viewStart, i));
    }
    return daysArray;
  }, [viewStart, daysToShow]);

  // Group tasks by employee
  const groupedTasks = useMemo(() => {
    const groups: Record<string, GanttTask[]> = {};
    tasks.forEach(task => {
      if (!groups[task.employeeId]) {
        groups[task.employeeId] = [];
      }
      groups[task.employeeId].push(task);
    });
    return groups;
  }, [tasks]);

  const getTaskPosition = (task: GanttTask) => {
    const start = parseISO(task.startDate);
    const end = parseISO(task.endDate);

    const startOffset = Math.max(0, differenceInDays(start, viewStart));
    const endOffset = Math.min(daysToShow - 1, differenceInDays(end, viewStart));

    if (endOffset < 0 || startOffset >= daysToShow) {
      return null;
    }

    const left = (startOffset / daysToShow) * 100;
    const width = ((endOffset - startOffset + 1) / daysToShow) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatusBg = (status: GanttTask['status']) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-emerald-600';
      case 'in_progress': return 'from-blue-500 to-indigo-600';
      case 'overdue': return 'from-red-500 to-rose-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTestStatusIcon = (testStatus?: GanttTask['testStatus']) => {
    switch (testStatus) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
      {/* Header Controls */}
      <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewStart(subWeeks(viewStart, 2))}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <span className="text-xl">←</span>
          </button>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {format(viewStart, 'yyyy年 M月d日', { locale: ja })} - {format(viewEnd, 'M月d日', { locale: ja })}
          </h2>
          <button
            onClick={() => setViewStart(addWeeks(viewStart, 2))}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <span className="text-xl">→</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors`}
          >
            Today
          </button>
          <select
            value={daysToShow}
            onChange={(e) => setDaysToShow(Number(e.target.value))}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              darkMode
                ? 'bg-gray-700 text-gray-300 border-gray-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <option value={14}>2 Weeks</option>
            <option value={28}>4 Weeks</option>
            <option value={42}>6 Weeks</option>
          </select>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Date Headers */}
          <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`w-48 flex-shrink-0 p-3 font-medium ${darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'}`}>
              Employee
            </div>
            <div className="flex-1 flex">
              {days.map((day, index) => {
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={index}
                    className={`flex-1 min-w-[32px] p-2 text-center text-xs border-l ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    } ${isWeekend ? (darkMode ? 'bg-gray-750' : 'bg-gray-50') : ''} ${
                      isToday ? 'bg-indigo-500/20' : ''
                    }`}
                  >
                    <div className={`font-medium ${
                      isToday ? 'text-indigo-500' :
                      day.getDay() === 0 ? 'text-red-500' :
                      day.getDay() === 6 ? 'text-blue-500' :
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {format(day, 'E', { locale: ja })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Rows */}
          {Object.entries(groupedTasks).map(([employeeId, empTasks]) => (
            <div
              key={employeeId}
              className={`flex border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
            >
              {/* Employee Name */}
              <div className={`w-48 flex-shrink-0 p-3 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {empTasks[0]?.employeeName.charAt(0)}
                  </div>
                  <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {empTasks[0]?.employeeName}
                  </span>
                </div>
              </div>

              {/* Task Bars */}
              <div className="flex-1 relative h-16">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={`flex-1 min-w-[32px] border-l ${
                        darkMode ? 'border-gray-700' : 'border-gray-100'
                      } ${
                        day.getDay() === 0 || day.getDay() === 6
                          ? darkMode ? 'bg-gray-750/50' : 'bg-gray-50/50'
                          : ''
                      } ${
                        format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                          ? 'bg-indigo-500/10'
                          : ''
                      }`}
                    />
                  ))}
                </div>

                {/* Tasks */}
                {empTasks.map((task) => {
                  const position = getTaskPosition(task);
                  if (!position) return null;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
                      className={`absolute top-2 h-12 rounded-lg cursor-pointer transition-all hover:scale-y-110 hover:z-10 shadow-lg`}
                      style={{ left: position.left, width: position.width }}
                    >
                      <div className={`h-full rounded-lg bg-gradient-to-r ${getStatusBg(task.status)} flex items-center justify-between px-2 overflow-hidden`}>
                        {/* Progress bar */}
                        <div
                          className="absolute inset-0 bg-white/20 rounded-lg origin-left transition-all"
                          style={{ transform: `scaleX(${task.progress / 100})` }}
                        />

                        <div className="relative flex items-center gap-1 min-w-0">
                          <span className="text-white text-xs font-medium truncate">
                            {task.scheduleName}
                          </span>
                        </div>

                        <div className="relative flex items-center gap-1">
                          <span className="text-white/80 text-xs">
                            {task.progress}%
                          </span>
                          <span className="text-sm">
                            {getTestStatusIcon(task.testStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {Object.keys(groupedTasks).length === 0 && (
            <div className={`p-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-4xl mb-4">📋</div>
              <p>No schedules to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-gradient-to-r from-gray-400 to-gray-500"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-600"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-gradient-to-r from-red-500 to-rose-600"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overdue</span>
          </div>
          <div className="border-l border-gray-400 mx-2"></div>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Test Passed</span>
          </div>
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Test Failed</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏳</span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Test Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
