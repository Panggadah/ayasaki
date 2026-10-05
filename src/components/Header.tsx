import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Unlock, 
  Plus, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  BookOpen, 
  Calendar as CalendarIcon, 
  ListFilter,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  isPJ: boolean;
  onOpenPinModal: () => void;
  onLogoutPJ: () => void;
  onOpenCreateTask: () => void;
  onOpenCoursesModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  activeTab: 'tasks' | 'calendar' | 'courses';
  setActiveTab: (tab: 'tasks' | 'calendar' | 'courses') => void;
  taskStats: {
    total: number;
    urgent: number;
    completed: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  isPJ,
  onOpenPinModal,
  onLogoutPJ,
  onOpenCreateTask,
  onOpenCoursesModal,
  soundEnabled,
  onToggleSound,
  onRefresh,
  activeTab,
  setActiveTab,
  taskStats,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  Tugas<span className="text-blue-600">Kuliah</span>
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Portal Kelas
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-none">
                {isPJ ? 'Mode PJ Matkul • Akses Penuh Unggah Tugas' : 'Mode Mahasiswa • Pantau Deadline & Tugas'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Center) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              Daftar Tugas
              {taskStats.urgent > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Kalender Deadline
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'courses'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Mata Kuliah & PJ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Refresh */}
            <button
              onClick={onRefresh}
              title="Perbarui Data"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Suara Notifikasi Aktif' : 'Suara Notifikasi Mati'}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* PJ Mode Action */}
            {isPJ ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCreateTask}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload Tugas Baru</span>
                  <span className="sm:hidden">Upload</span>
                </button>

                <button
                  onClick={onLogoutPJ}
                  title="Keluar dari Mode PJ"
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 transition-colors"
                >
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline">Mode PJ Aktif</span>
                  <span className="text-slate-400 text-xs hidden md:inline">• Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenPinModal}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Masuk PJ Matkul</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex lg:hidden items-center justify-around border-t border-slate-100 py-2 text-xs">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
              activeTab === 'tasks' ? 'font-semibold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Tugas ({taskStats.total})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
              activeTab === 'calendar' ? 'font-semibold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Kalender
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
              activeTab === 'courses' ? 'font-semibold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Matkul & PJ
          </button>
        </div>
      </div>
    </header>
  );
};
