import React from 'react';
import { 
  X, 
  Clock, 
  Paperclip, 
  CheckCircle2, 
  Circle, 
  Share2, 
  Download, 
  Sparkles, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { Task, Course } from '../types';
import { getCountdown, formatIndonesianDate, downloadICalendar } from '../utils/helpers';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  course?: Course;
  isCompletedByMe: boolean;
  onToggleComplete: (taskId: string) => void;
  onOpenBroadcast: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  course,
  isCompletedByMe,
  onToggleComplete,
  onOpenBroadcast,
}) => {
  if (!isOpen || !task) return null;

  const countdown = getCountdown(task.deadline);
  const formattedDeadline = formatIndonesianDate(task.deadline);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 pr-8 mb-2">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs"
            style={{ backgroundColor: course?.color || '#3b82f6' }}
          >
            {course?.code ? `${course.code} • ` : ''}
            {task.courseName}
          </span>
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {task.type === 'Kelompok' ? `Kelompok (${task.groupSize || 'Tim'})` : 'Individu'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Prioritas: {task.priority}
          </span>
          {task.status === 'Diperpanjang' && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Diperpanjang
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-xl font-bold text-slate-900 mb-2 ${isCompletedByMe ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </h2>

        {/* Urgency Alert & Countdown */}
        <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 mb-4 ${countdown.badgeClass}`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm">{countdown.text}</span>
          </div>
          <span className="text-xs font-medium">{formattedDeadline}</span>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-sm text-slate-700">
          
          {/* Extended Note */}
          {task.extendedNote && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5 font-bold">Catatan Khusus dari Dosen / PJ:</strong>
                {task.extendedNote}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Instruksi & Ketentuan Tugas
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {task.description || 'Tidak ada deskripsi rinci.'}
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                Materi / Berkas Soal dari PJ ({task.attachments.length})
              </h4>
              <div className="space-y-1.5">
                {task.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">{att.name}</span>
                      {att.size && <span className="text-[10px] text-slate-400">({att.size})</span>}
                    </div>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <span>Buka File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Details Info */}
          <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <span>Dosen Pengampu: <strong>{course?.lecturer || 'Dosen Pengampu'}</strong></span>
            <span>Diunggah oleh: <strong>{task.createdBy}</strong></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isCompletedByMe
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isCompletedByMe ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Sudah Saya Selesaikan</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Tandai Selesai di Perangkat Saya</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onOpenBroadcast(task)}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Format WA</span>
            </button>

            <button
              onClick={() => downloadICalendar(task)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Kalender</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
