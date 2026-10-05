import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Paperclip, 
  Calendar, 
  Clock, 
  AlertCircle, 
  FileText, 
  Users, 
  User, 
  Sparkles,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { Task, Course, Attachment, TaskPriority, TaskType, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  courses: Course[];
  pjPin: string;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
  pjPin,
  initialTask,
}) => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Individu');
  const [groupSize, setGroupSize] = useState('3-4 Orang');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [priority, setPriority] = useState<TaskPriority>('Sedang');
  const [status, setStatus] = useState<TaskStatus>('Aktif');
  const [extendedNote, setExtendedNote] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Custom link attachment input
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [customLinkName, setCustomLinkName] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or initialTask changes
  useEffect(() => {
    if (initialTask) {
      setCourseId(initialTask.courseId);
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setType(initialTask.type);
      setGroupSize(initialTask.groupSize || '3-4 Orang');
      
      const d = new Date(initialTask.deadline);
      const datePart = d.toISOString().split('T')[0];
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setDeadlineDate(datePart);
      setDeadlineTime(`${hours}:${minutes}`);

      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setExtendedNote(initialTask.extendedNote || '');
      setCreatedBy(initialTask.createdBy || '');
      setAttachments(initialTask.attachments || []);
    } else {
      // Default reset
      setCourseId(courses[0]?.id || '');
      setTitle('');
      setDescription('');
      setType('Individu');
      setGroupSize('3-4 Orang');
      
      // Default deadline: 3 days ahead at 23:59
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDeadlineDate(d.toISOString().split('T')[0]);
      setDeadlineTime('23:59');

      setPriority('Sedang');
      setStatus('Aktif');
      setExtendedNote('');
      setCreatedBy(courses[0]?.pjName ? `${courses[0].pjName} (PJ)` : 'PJ Matkul');
      setAttachments([]);
    }
    setError(null);
  }, [initialTask, isOpen, courses]);

  // When course changes, auto-fill default PJ name if not set
  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    const selectedCourse = courses.find((c) => c.id === newCourseId);
    if (selectedCourse?.pjName && !initialTask) {
      setCreatedBy(`${selectedCourse.pjName} (PJ ${selectedCourse.code || ''})`);
    }
  };

  if (!isOpen) return null;

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 15 * 1024 * 1024) {
      setError('Ukuran file maksimal 15MB');
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-pj-pin': pjPin,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData,
            mimeType: file.type,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setAttachments((prev) => [...prev, data.file]);
        } else {
          setError(data.error || 'Gagal mengunggah file.');
        }
      } catch (err: any) {
        setError('Kendala upload: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca file lokal.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Add external link attachment
  const handleAddLinkAttachment = () => {
    if (!customLinkUrl.trim()) return;
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: customLinkName.trim() || 'Link Materi / Soal',
      url: customLinkUrl.trim().startsWith('http') ? customLinkUrl.trim() : `https://${customLinkUrl.trim()}`,
      type: 'external-link',
      size: 'Web Link',
    };
    setAttachments((prev) => [...prev, newAtt]);
    setCustomLinkUrl('');
    setCustomLinkName('');
    setShowLinkInput(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas wajib diisi!');
      return;
    }
    if (!courseId) {
      setError('Pilih mata kuliah terlebih dahulu!');
      return;
    }
    if (!deadlineDate) {
      setError('Pilih tanggal batas waktu!');
      return;
    }

    const fullDeadline = new Date(`${deadlineDate}T${deadlineTime || '23:59'}:00`).toISOString();
    const selectedCourse = courses.find((c) => c.id === courseId);

    setSaving(true);
    setError(null);

    try {
      await onSave({
        courseId,
        courseName: selectedCourse ? selectedCourse.name : 'Mata Kuliah',
        title: title.trim(),
        description: description.trim(),
        type,
        groupSize: type === 'Kelompok' ? groupSize.trim() : '',
        deadline: fullDeadline,
        priority,
        status,
        extendedNote: extendedNote.trim(),
        attachments,
        createdBy: createdBy.trim() || 'PJ Matkul',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tugas.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialTask ? 'Edit Info Tugas Kuliah' : 'Upload Pengingat Tugas Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Akses PJ Matkul • Informasi akan tampil di dashboard seluruh mahasiswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Course & PJ Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mata Kuliah *
              </label>
              <select
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `[${c.code}] ` : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama PJ Pengunggah
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="Contoh: Budi Santoso (PJ)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Judul Tugas *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tugas 3: ERD & Normalisasi Database Toko Online"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Instruksi & Keterangan Tugas
              </label>
              <span className="text-[11px] text-slate-400">Rincian dari dosen / silabus</span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan instruksi tugas, cakupan materi, tools/software yang dipakai, referensi buku, dll..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans text-xs sm:text-sm"
            />
          </div>

          {/* Row 2: Type, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipe Tugas
              </label>
              <div className="flex rounded-xl border border-slate-300 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setType('Individu')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    type === 'Individu'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Individu
                </button>
                <button
                  type="button"
                  onClick={() => setType('Kelompok')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    type === 'Kelompok'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Kelompok
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prioritas / Bobot
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white"
              >
                <option value="Rendah">Rendah (Tugas Rutin)</option>
                <option value="Sedang">Sedang (Standar)</option>
                <option value="Tinggi">Tinggi (Bobot Besar)</option>
                <option value="Kuis/UAS">Kuis / Tugas Besar / UAS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status Tugas
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Diperpanjang">Diperpanjang</option>
                <option value="Selesai">Telah Berakhir</option>
              </select>
            </div>
          </div>

          {/* Conditional Group Size if Kelompok */}
          {type === 'Kelompok' && (
            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-indigo-900 mb-0.5">
                  Ketentuan Anggota Kelompok
                </label>
                <input
                  type="text"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  placeholder="Contoh: 3-4 Orang (1 Ketua, 2-3 Anggota)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Row 3: Deadline Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Tanggal Batas Waktu (Deadline) *
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Jam Batas Waktu *
              </label>
              <input
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-medium"
              />
            </div>
          </div>

          {/* Extended Note (if status Diperpanjang or note for class) */}
          {(status === 'Diperpanjang' || extendedNote) && (
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
              <label className="block text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Catatan Perpanjangan / Ralat dari Dosen
              </label>
              <input
                type="text"
                value={extendedNote}
                onChange={(e) => setExtendedNote(e.target.value)}
                placeholder="Contoh: Deadline dimundurkan 2 hari karena ada hari libur nasional"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Attachments & Files Upload */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                Materi / Soal / Berkas Referensi dari PJ
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Tambah Link
                </button>
                <label className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3 text-slate-500" />
                  {uploading ? 'Mengunggah...' : 'Upload Berkas'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Custom Link Input Field */}
            {showLinkInput && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <input
                  type="text"
                  placeholder="Nama tautan (misal: Google Drive Soal / Slide Pertemuan 5)"
                  value={customLinkName}
                  onChange={(e) => setCustomLinkName(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded"
                />
                <input
                  type="url"
                  placeholder="URL link (https://...)"
                  value={customLinkUrl}
                  onChange={(e) => setCustomLinkUrl(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded"
                />
                <button
                  type="button"
                  onClick={handleAddLinkAttachment}
                  className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            )}

            {/* Attachments List */}
            {attachments.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{att.name}</span>
                      {att.size && <span className="text-[10px] text-slate-400">({att.size})</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Belum ada berkas lampiran. PJ dapat mengunggah file soal PDF atau tautan materi rujukan.
              </p>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Menyimpan...' : initialTask ? 'Simpan Perubahan' : 'Siarkan Pengingat Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
