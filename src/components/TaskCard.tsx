import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  User, 
  Paperclip, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Share2, 
  Download, 
  Edit3, 
  Trash2, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Task, Course } from '../types';
import { 
  getCountdown, 
  formatIndonesianDate, 
  downloadICalendar 
} from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  course?: Course;
  isPJ: boolean;
  isCompletedByMe: boolean;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onOpenBroadcast: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  course,
  isPJ,
  isCompletedByMe,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenBroadcast,
}) => {
  const [expanded, setExpanded] = useState(false);

  const countdown = getCountdown(task.deadline);
  const formattedDeadline = formatIndonesianDate(task.deadline);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Kuis/UAS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Tinggi':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Sedang':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 border bg-white overflow-hidden shadow-xs hover:shadow-md flex flex-col ${
        isCompletedByMe
          ? 'border-emerald-200 bg-emerald-50/20'
          : countdown.isUrgent
          ? 'border-rose-300 ring-1 ring-rose-200'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Card Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          
          {/* Course Badge & Types */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs"
              style={{ backgroundColor: course?.color || '#3b82f6' }}
            >
              {course?.code ? `${course.code} • ` : ''}
              {task.courseName}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {task.type === 'Kelompok' ? (
                <>
                  <Users className="w-3 h-3 text-indigo-600" />
                  {task.groupSize || 'Kelompok'}
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-blue-600" />
                  Individu
                </>
              )}
            </span>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority}
            </span>

            {task.status === 'Diperpanjang' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Diperpanjang
              </span>
            )}
          </div>

          {/* Mahasiswa Personal Checkbox */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              isCompletedByMe
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
            }`}
            title={isCompletedByMe ? 'Batal tandai selesai' : 'Tandai sudah Anda selesaikan'}
          >
            {isCompletedByMe ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Selesai Saya Kerjakan</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                <span className="hidden sm:inline">Tandai Selesai</span>
              </>
            )}
          </button>
        </div>

        {/* Task Title */}
        <h3
          className={`text-base sm:text-lg font-bold leading-snug tracking-tight ${
            isCompletedByMe ? 'line-through text-slate-400' : 'text-slate-900'
          }`}
        >
          {task.title}
        </h3>

        {/* Deadline & Countdown Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{formattedDeadline}</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${countdown.badgeClass}`}
          >
            {countdown.isUrgent && <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
            {countdown.text}
          </span>
        </div>

        {/* Extended Note Banner if applicable */}
        {task.extendedNote && (
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Info Perpanjangan:</span> {task.extendedNote}
            </div>
          </div>
        )}
      </div>

      {/* Card Body Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Description / Instructions */}
        {task.description && (
          <div>
            <p
              className={`text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {task.description}
            </p>
            {task.description.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {expanded ? (
                  <>
                    Tutup instruksi <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Lihat instruksi lengkap <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Attachments / Files if any */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-blue-600" /> Materi / Soal dari PJ ({task.attachments.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {task.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[180px]">{att.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 sm:px-5 sm:py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left Side: Dosen & PJ Info */}
        <div className="text-[11px] text-slate-500">
          <span>Dosen: <strong className="text-slate-700">{course?.lecturer || '-'}</strong></span>
          <span className="mx-1.5">•</span>
          <span>PJ: <strong className="text-slate-700">{task.createdBy}</strong></span>
        </div>

        {/* Right Side: Tools (Share WA, iCal, PJ edit/delete) */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Share to WhatsApp Button */}
          <button
            onClick={() => onOpenBroadcast(task)}
            title="Salin format pengingat WhatsApp grup kelas"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Format WA</span>
          </button>

          {/* iCal download */}
          <button
            onClick={() => downloadICalendar(task)}
            title="Tambahkan ke Kalender HP / Google Calendar (.ics)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Kalender</span>
          </button>

          {/* PJ ONLY CONTROLS */}
          {isPJ && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-0.5">
              <button
                onClick={() => onEdit(task)}
                title="Edit Info Tugas (Akses PJ)"
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDelete(task.id)}
                title="Hapus Tugas (Akses PJ)"
                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
