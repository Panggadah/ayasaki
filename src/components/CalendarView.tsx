import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, User, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Task, Course } from '../types';
import { formatIndonesianDate, getCountdown } from '../utils/helpers';

interface CalendarViewProps {
  tasks: Task[];
  courses: Course[];
  completedTaskIds: string[];
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  courses,
  completedTaskIds,
  onSelectTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[] | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create task lookup map by "YYYY-MM-DD"
  const tasksByDate: { [key: string]: Task[] } = {};
  tasks.forEach((task) => {
    const d = new Date(task.deadline);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  });

  const calendarDays = [];

  // Previous month filler days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateKey: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Current month days
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      dateKey,
    });
  }

  // Trailing next month days
  const remaining = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : (42 - calendarDays.length > 0 ? 42 - calendarDays.length : 0);
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      dateKey: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
    });
  }

  const handleDayClick = (dateKey: string, dayTasks: Task[], dayNum: number) => {
    if (dayTasks && dayTasks.length > 0) {
      setSelectedDayTasks(dayTasks);
      setSelectedDateLabel(`${dayNum} ${monthNames[month]} ${year}`);
    } else {
      setSelectedDayTasks(null);
    }
  };

  const getCourseColor = (courseId: string) => {
    const c = courses.find((x) => x.id === courseId);
    return c?.color || '#3b82f6';
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi jadwal tenggat waktu (deadline) tugas kuliah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hari Ini
          </button>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600">
          <span className="text-rose-600">Min</span>
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span className="text-blue-600">Sab</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarDays.map((item, idx) => {
            const dayTasks = tasksByDate[item.dateKey] || [];
            const hasTasks = dayTasks.length > 0;

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(item.dateKey, dayTasks, item.day)}
                className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 transition-all flex flex-col justify-between ${
                  !item.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-400'
                    : item.isToday
                    ? 'bg-blue-50/30'
                    : 'bg-white'
                } ${hasTasks ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      item.isToday
                        ? 'bg-blue-600 text-white font-bold'
                        : item.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.day}
                  </span>

                  {hasTasks && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {dayTasks.length} Tugas
                    </span>
                  )}
                </div>

                {/* Task badges preview inside day box */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((t) => {
                    const isDone = completedTaskIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium border flex items-center gap-1 ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through opacity-70'
                            : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                        }`}
                        title={`${t.courseName}: ${t.title}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: getCourseColor(t.courseId) }}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] text-slate-500 font-semibold px-1">
                      +{dayTasks.length - 2} tugas lainnya
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task Detail Popup */}
      {selectedDayTasks && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base">
                Deadline pada {selectedDateLabel} ({selectedDayTasks.length} Tugas)
              </h3>
            </div>
            <button
              onClick={() => setSelectedDayTasks(null)}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {selectedDayTasks.map((t) => {
              const countdown = getCountdown(t.deadline);
              const isDone = completedTaskIds.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-3.5 bg-slate-800/90 hover:bg-slate-800 rounded-xl border border-slate-700 cursor-pointer transition-all hover:border-blue-400 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold text-white"
                      style={{ backgroundColor: getCourseColor(t.courseId) }}
                    >
                      {t.courseName}
                    </span>
                    <span className="text-amber-300 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(t.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                  <h4 className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                    {t.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{t.type} • {t.priority}</span>
                    <span className="text-blue-400 hover:underline">Buka Rincian →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
