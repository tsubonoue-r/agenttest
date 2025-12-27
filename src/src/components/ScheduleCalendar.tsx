'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarEvent } from '@/types';

interface ScheduleCalendarProps {
  events: CalendarEvent[];
  darkMode: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export default function ScheduleCalendar({ events, darkMode, onEventClick, onDateClick }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = useMemo(() => {
    const daysArray: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      daysArray.push(day);
      day = addDays(day, 1);
    }
    return daysArray;
  }, [calendarStart, calendarEnd]);

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = parseISO(event.date);
      const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
      return date >= eventStart && date <= eventEnd || isSameDay(date, eventStart);
    });
  };

  const getStatusColor = (status: CalendarEvent['status'], type: CalendarEvent['type']) => {
    if (type === 'test' || type === 'retest') {
      switch (status) {
        case 'passed': return 'bg-green-500';
        case 'failed': return 'bg-red-500';
        default: return 'bg-yellow-500';
      }
    }
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
      {/* Calendar Header */}
      <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <span className="text-xl">←</span>
          </button>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <span className="text-xl">→</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } transition-colors`}
          >
            Today
          </button>
          <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Week Day Headers */}
      <div className={`grid grid-cols-7 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-bold ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayOfWeek = day.getDay();

          return (
            <div
              key={index}
              onClick={() => onDateClick?.(day)}
              className={`min-h-[120px] p-2 border-b border-r cursor-pointer transition-colors ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              } ${
                !isCurrentMonth ? (darkMode ? 'bg-gray-800/50' : 'bg-gray-50') : ''
              } ${
                darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday
                  ? 'w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center'
                  : !isCurrentMonth
                  ? 'text-gray-400'
                  : dayOfWeek === 0
                  ? 'text-red-500'
                  : dayOfWeek === 6
                  ? 'text-blue-500'
                  : darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {format(day, 'd')}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px]">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={`px-2 py-1 rounded text-xs truncate cursor-pointer transition-transform hover:scale-105 ${
                      event.type === 'test' || event.type === 'retest'
                        ? getStatusColor(event.status, event.type) + ' text-white'
                        : 'text-white'
                    }`}
                    style={{ backgroundColor: event.color || '#3B82F6' }}
                    title={event.title}
                  >
                    {event.type === 'test' && '📝 '}
                    {event.type === 'retest' && '🔄 '}
                    {event.title.split(' - ')[0]}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Education</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Passed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Failed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Retest</span>
          </div>
        </div>
      </div>
    </div>
  );
}
