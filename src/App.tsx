import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Sparkles, 
  Layers, 
  User, 
  Users, 
  CheckCheck, 
  RefreshCw,
  Info,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { Task, Course } from './types';
import { Header } from './components/Header';
import { TaskCard } from './components/TaskCard';
import { PINModal } from './components/PINModal';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CalendarView } from './components/CalendarView';
import { CourseDirectoryModal } from './components/CourseDirectoryModal';
import { WhatsAppBroadcastModal } from './components/WhatsAppBroadcastModal';
import { getCountdown, playNotificationSound } from './utils/helpers';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'courses'>('tasks');

  // PJ Authentication
  const [isPJ, setIsPJ] = useState<boolean>(() => {
    return localStorage.getItem('tugas_is_pj') === 'true';
  });
  const [pjPin, setPjPin] = useState<string>(() => {
    return localStorage.getItem('tugas_pj_pin') || '';
  });

  // Mahasiswa Personal Completion Tracker (saved locally per device)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tugas_mahasiswa_selesai');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sound alert
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tugas_sound_enabled') !== 'false';
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, uncompleted, completed

  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTask, setBroadcastTask] = useState<Task | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, tasksRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/tasks')
      ]);

      if (coursesRes.ok && tasksRes.ok) {
        const coursesData = await coursesRes.json();
        const tasksData = await tasksRes.json();
        setCourses(coursesData);
        setTasks(tasksData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Gagal memuat data dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save completion state
  useEffect(() => {
    localStorage.setItem('tugas_mahasiswa_selesai', JSON.stringify(completedTaskIds));
  }, [completedTaskIds]);

  // Save PJ auth state
  useEffect(() => {
    localStorage.setItem('tugas_is_pj', isPJ ? 'true' : 'false');
    localStorage.setItem('tugas_pj_pin', pjPin);
  }, [isPJ, pjPin]);

  // Save sound setting
  useEffect(() => {
    localStorage.setItem('tugas_sound_enabled', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playNotificationSound();
      showToast('Suara notifikasi diaktifkan 🔔');
    } else {
      showToast('Suara notifikasi dinonaktifkan 🔕');
    }
  };

  // Handle PIN Success
  const handlePinSuccess = (pin: string) => {
    setIsPJ(true);
    setPjPin(pin);
    showToast('Berhasil masuk sebagai PJ Matkul! Anda dapat mengunggah dan mengedit tugas.');
  };

  const handleLogoutPJ = () => {
    setIsPJ(false);
    setPjPin('');
    showToast('Telah keluar dari Mode PJ. Anda sekarang berada di Mode Mahasiswa (Hanya Lihat).');
  };

  // Toggle student personal completed task
  const handleToggleComplete = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const isAlready = prev.includes(taskId);
      if (isAlready) {
        showToast('Tugas ditandai belum selesai');
        return prev.filter((id) => id !== taskId);
      } else {
        if (soundEnabled) playNotificationSound();
        showToast('Hebat! Tugas selesai dikerjakan 🎉');
        return [...prev, taskId];
      }
    });
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-pj-pin': pjPin,
      },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan tugas');
    }

    const saved = await res.json();
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      showToast('Tugas berhasil diperbarui');
    } else {
      setTasks((prev) => [saved, ...prev]);
      showToast('Tugas baru berhasil diunggah & disiarkan ke kelas! 🚀');
    }
    setEditingTask(null);
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini? Mahasiswa lain tidak akan melihatnya lagi.')) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'x-pj-pin': pjPin,
        },
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        showToast('Tugas berhasil dihapus');
      } else {
        const data = await res.json();
        showToast(data.error || 'Gagal menghapus tugas');
      }
    } catch (err: any) {
      showToast('Kendala: ' + err.message);
    }
  };

  // Save Course
  const handleSaveCourse = async (courseData: Partial<Course>) => {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pj-pin': pjPin,
      },
      body: JSON.stringify(courseData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan mata kuliah');
    }

    const saved = await res.json();
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
      }
      return [...prev, saved];
    });
    showToast('Mata kuliah berhasil disimpan');
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'x-pj-pin': pjPin,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus mata kuliah');
    }

    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    showToast('Mata kuliah berhasil dihapus');
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!isPJ) {
      setIsPinModalOpen(true);
      return;
    }
    if (!confirm('Reset semua data ke sampel awal perkuliahan?')) return;
    try {
      const res = await fetch('/api/reset-demo', {
        method: 'POST',
        headers: { 'x-pj-pin': pjPin },
      });
      if (res.ok) {
        await fetchData();
        showToast('Data demo berhasil di-reset!');
      }
    } catch (err) {
      showToast('Gagal me-reset data');
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchCourse = task.courseName.toLowerCase().includes(q);
        const matchCreator = task.createdBy.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCourse && !matchCreator) {
          return false;
        }
      }

      // Course filter
      if (filterCourse !== 'all' && task.courseId !== filterCourse) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && task.type !== filterType) {
        return false;
      }

      // Urgency filter
      const cd = getCountdown(task.deadline);
      if (filterUrgency === 'urgent' && (!cd.isUrgent || cd.isPast)) return false;
      if (filterUrgency === 'this_week' && (cd.totalHours > 168 || cd.isPast)) return false;
      if (filterUrgency === 'overdue' && !cd.isPast) return false;

      // Completion status filter
      const isDone = completedTaskIds.includes(task.id);
      if (filterStatus === 'completed' && !isDone) return false;
      if (filterStatus === 'uncompleted' && isDone) return false;

      return true;
    });
  }, [tasks, searchQuery, filterCourse, filterType, filterUrgency, filterStatus, completedTaskIds]);

  // Statistics
  const stats = useMemo(() => {
    let urgent = 0;
    let completed = 0;
    let total = tasks.length;

    tasks.forEach((t) => {
      const cd = getCountdown(t.deadline);
      if (cd.isUrgent && !cd.isPast) urgent++;
      if (completedTaskIds.includes(t.id)) completed++;
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, urgent, completed, percent };
  }, [tasks, completedTaskIds]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        isPJ={isPJ}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onLogoutPJ={handleLogoutPJ}
        onOpenCreateTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenCoursesModal={() => setIsCoursesModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRefresh={fetchData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taskStats={stats}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Role & Concept Explanation Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Portal Pengingat Tugas Kuliah
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isPJ
                  ? 'Halo Penanggung Jawab Matkul! Siap Berbagi Info Tugas?'
                  : 'Pantau Seluruh Tugas & Tenggat Waktu Kuliah Secara Terpusat'}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                {isPJ
                  ? 'Anda memiliki akses PJ untuk membagikan tugas baru, melampirkan materi/soal, memperpanjang deadline, dan menyiarkan pengumuman ke kelas.'
                  : 'Penanggung Jawab (PJ) tiap mata kuliah membagikan tugas & deadline di sini. Anda dapat memantau jadwal, materi dari PJ, menyalin pengingat WA, dan menandai tugas yang sudah selesai.'}
              </p>
            </div>

            {/* Quick Actions or Switcher */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {isPJ ? (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="bg-white text-blue-800 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Upload Tugas Baru</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>Saya PJ Matkul (Masuk)</span>
                </button>
              )}
            </div>
          </div>

          {/* Student Progress Checklist Bar */}
          <div className="mt-5 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-300" /> Progres Tugas Saya:
              </span>
              <span className="font-mono text-blue-200">
                {stats.completed} dari {stats.total} tugas selesai ({stats.percent}%)
              </span>
            </div>
            
            <div className="w-full sm:w-56 h-2.5 bg-blue-950/40 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Tasks View */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            
            {/* Search & Filter Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul tugas, mata kuliah, dosen, atau instruksi..."
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Filter dropdowns */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  
                  {/* Filter Mata Kuliah */}
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Mata Kuliah ({courses.length})</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code ? `[${c.code}] ` : ''}{c.name}
                      </option>
                    ))}
                  </select>

                  {/* Filter Tipe */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Tipe (Individu & Kelompok)</option>
                    <option value="Individu">Hanya Individu</option>
                    <option value="Kelompok">Hanya Kelompok</option>
                  </select>

                  {/* Filter Urgensi Deadline */}
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Waktu</option>
                    <option value="urgent">Mendesak (&lt; 24 Jam)</option>
                    <option value="this_week">Minggu Ini (&lt; 7 Hari)</option>
                    <option value="overdue">Batas Waktu Lewat</option>
                  </select>

                  {/* Filter Status Selesai Pribadi */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Status Pengerjaan</option>
                    <option value="uncompleted">Belum Saya Selesaikan</option>
                    <option value="completed">Sudah Saya Selesaikan</option>
                  </select>
                </div>
              </div>

              {/* Active filters pill bar */}
              {(searchQuery || filterCourse !== 'all' || filterType !== 'all' || filterUrgency !== 'all' || filterStatus !== 'all') && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    Menampilkan <strong>{filteredTasks.length}</strong> dari {tasks.length} total tugas
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCourse('all');
                      setFilterType('all');
                      setFilterUrgency('all');
                      setFilterStatus('all');
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Task Cards Grid */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="text-sm font-medium">Memuat tugas kuliah...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTasks.map((task) => {
                  const course = courses.find((c) => c.id === task.courseId);
                  const isDone = completedTaskIds.includes(task.id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      course={course}
                      isPJ={isPJ}
                      isCompletedByMe={isDone}
                      onToggleComplete={handleToggleComplete}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                      onOpenBroadcast={(t) => {
                        setBroadcastTask(t);
                        setIsBroadcastModalOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Tidak ada tugas ditemukan</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {searchQuery || filterCourse !== 'all'
                    ? 'Coba sesuaikan kata kunci pencarian atau ubah filter filter di atas.'
                    : 'Belum ada tugas kuliah yang diunggah oleh Penanggung Jawab Mata Kuliah.'}
                </p>
                {isPJ && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Tugas Sekarang</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Calendar View */}
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            courses={courses}
            completedTaskIds={completedTaskIds}
            onSelectTask={(task) => {
              setViewingTask(task);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Courses View */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daftar Mata Kuliah & Penanggung Jawab</h3>
                <p className="text-xs text-slate-500">
                  Hubungi PJ Matkul bersangkutan jika ada pertanyaan mengenai instruksi tugas
                </p>
              </div>
              <button
                onClick={() => setIsCoursesModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isPJ ? 'Kelola Mata Kuliah' : 'Buka Direktori Lengkap'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => {
                const courseTasks = tasks.filter((t) => t.courseId === c.id);
                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs"
                        style={{ backgroundColor: c.color || '#3b82f6' }}
                      >
                        {c.code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {courseTasks.length} Tugas
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-snug">
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Dosen: <strong className="text-slate-700">{c.lecturer || '-'}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">PJ Matkul</span>
                        <span className="font-semibold text-slate-800">{c.pjName || 'Belum ada'}</span>
                      </div>
                      {c.pjContact && (
                        <a
                          href={`https://wa.me/${c.pjContact.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px]"
                        >
                          Chat WA
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">TugasKuliah</span>
            <span>•</span>
            <span>Portal Pengingat Tugas Mahasiswa & PJ Matkul</span>
          </div>
          
          <div className="flex items-center gap-3">
            {isPJ && (
              <button
                onClick={handleResetDemo}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            )}
            <span className="text-slate-400">Status: Real-time Sinkronisasi</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      
      {/* PIN Verification Modal */}
      <PINModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Task Create / Edit Modal (PJ Only) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        courses={courses}
        pjPin={pjPin}
        initialTask={editingTask}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingTask(null);
        }}
        task={viewingTask}
        course={courses.find((c) => c.id === viewingTask?.courseId)}
        isCompletedByMe={viewingTask ? completedTaskIds.includes(viewingTask.id) : false}
        onToggleComplete={handleToggleComplete}
        onOpenBroadcast={(t) => {
          setBroadcastTask(t);
          setIsBroadcastModalOpen(true);
        }}
      />

      {/* WhatsApp Broadcast Generator Modal */}
      <WhatsAppBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => {
          setIsBroadcastModalOpen(false);
          setBroadcastTask(null);
        }}
        task={broadcastTask}
        course={courses.find((c) => c.id === broadcastTask?.courseId)}
      />

      {/* Course Directory / Management Modal */}
      <CourseDirectoryModal
        isOpen={isCoursesModalOpen}
        onClose={() => setIsCoursesModalOpen(false)}
        courses={courses}
        isPJ={isPJ}
        pjPin={pjPin}
        onSaveCourse={handleSaveCourse}
        onDeleteCourse={handleDeleteCourse}
      />

    </div>
  );
}
