import React, { useState } from 'react';
import { X, BookOpen, Plus, User, Phone, Edit2, Trash2, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { Course } from '../types';

interface CourseDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  isPJ: boolean;
  pjPin: string;
  onSaveCourse: (course: Partial<Course>) => Promise<void>;
  onDeleteCourse: (courseId: string) => Promise<void>;
}

export const CourseDirectoryModal: React.FC<CourseDirectoryModalProps> = ({
  isOpen,
  onClose,
  courses,
  isPJ,
  pjPin,
  onSaveCourse,
  onDeleteCourse,
}) => {
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [pjName, setPjName] = useState('');
  const [pjContact, setPjContact] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [semester, setSemester] = useState('Semester 5');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setCode('');
    setName('');
    setLecturer('');
    setPjName('');
    setPjContact('');
    setColor('#3b82f6');
    setSemester('Semester 5');
    setEditingCourse(null);
    setIsAdding(true);
    setError(null);
  };

  const handleStartEdit = (c: Course) => {
    setCode(c.code);
    setName(c.name);
    setLecturer(c.lecturer);
    setPjName(c.pjName);
    setPjContact(c.pjContact);
    setColor(c.color || '#3b82f6');
    setSemester(c.semester || 'Semester 5');
    setEditingCourse(c);
    setIsAdding(true);
    setError(null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingCourse(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Kode dan Nama Mata Kuliah wajib diisi!');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSaveCourse({
        id: editingCourse?.id,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        lecturer: lecturer.trim(),
        pjName: pjName.trim(),
        pjContact: pjContact.trim(),
        color,
        semester,
      });
      setIsAdding(false);
      setEditingCourse(null);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan mata kuliah.');
    } finally {
      setSaving(false);
    }
  };

  const colorPalette = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#ef4444', // red
    '#6366f1', // indigo
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Direktori Mata Kuliah & PJ Matkul
              </h3>
              <p className="text-xs text-slate-500">
                Daftar mata kuliah aktif dan kontak penanggung jawab tugas
              </p>
            </div>
          </div>

          {isPJ && !isAdding && (
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Matkul</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {/* Add / Edit Form for PJ */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Batal
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Kode Matkul *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="IF3101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-white uppercase"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Nama Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pemrograman Web Lanjut"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Ir. Hendra, M.T."
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Nama Penanggung Jawab (PJ)
                  </label>
                  <input
                    type="text"
                    placeholder="Ahmad Fauzi"
                    value={pjName}
                    onChange={(e) => setPjName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Kontak WhatsApp PJ
                  </label>
                  <input
                    type="text"
                    placeholder="0812-3456-7890"
                    value={pjContact}
                    onChange={(e) => setPjContact(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Warna Label
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {colorPalette.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          color === c ? 'ring-2 ring-slate-800 scale-110' : 'opacity-80'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
                </button>
              </div>
            </form>
          )}

          {/* Course Cards List */}
          <div className="grid grid-cols-1 gap-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: c.color || '#3b82f6' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {c.code}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {c.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dosen: <span className="font-medium text-slate-700">{c.lecturer || 'Belum diisi'}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        PJ: <strong className="text-slate-800">{c.pjName || 'Belum ditunjuk'}</strong>
                      </span>
                      {c.pjContact && (
                        <a
                          href={`https://wa.me/${c.pjContact.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat WA: {c.pjContact}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {isPJ && (
                  <div className="flex items-center gap-1.5 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Mata Kuliah"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus mata kuliah ${c.name}?`)) {
                          onDeleteCourse(c.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Mata Kuliah"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
