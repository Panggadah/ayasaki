import { Task, Course } from '../types';

export function formatIndonesianDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes} WIB`;
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

export interface CountdownResult {
  text: string;
  isUrgent: boolean; // < 24 hours
  isWarning: boolean; // < 3 days
  isPast: boolean;
  totalHours: number;
  badgeClass: string;
}

export function getCountdown(deadlineIso: string): CountdownResult {
  const now = new Date().getTime();
  const target = new Date(deadlineIso).getTime();
  const diff = target - now;

  if (diff <= 0) {
    const pastDiff = Math.abs(diff);
    const pastDays = Math.floor(pastDiff / (1000 * 60 * 60 * 24));
    return {
      text: pastDays === 0 ? 'Batas waktu berakhir hari ini' : `Lewat ${pastDays} hari lalu`,
      isUrgent: false,
      isWarning: false,
      isPast: true,
      totalHours: 0,
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const totalHours = diff / (1000 * 60 * 60);

  if (days === 0 && hours === 0) {
    return {
      text: `${minutes} menit lagi! (Sangat Mendesak)`,
      isUrgent: true,
      isWarning: true,
      isPast: false,
      totalHours,
      badgeClass: 'bg-red-500 text-white animate-pulse shadow-sm',
    };
  } else if (days === 0) {
    return {
      text: `${hours} jam ${minutes} mnt lagi (Hari ini)`,
      isUrgent: true,
      isWarning: true,
      isPast: false,
      totalHours,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
    };
  } else if (days === 1) {
    return {
      text: `Besok (${hours} jam lagi)`,
      isUrgent: true,
      isWarning: true,
      isPast: false,
      totalHours,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-medium',
    };
  } else if (days <= 3) {
    return {
      text: `${days} hari ${hours} jam lagi`,
      isUrgent: false,
      isWarning: true,
      isPast: false,
      totalHours,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  } else {
    return {
      text: `${days} hari lagi`,
      isUrgent: false,
      isWarning: false,
      isPast: false,
      totalHours,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
}

export function generateWhatsAppBroadcast(task: Task, course?: Course): string {
  const countdown = getCountdown(task.deadline);
  const formattedDeadline = formatIndonesianDate(task.deadline);

  const lines = [
    `📢 *[PENGINGAT TUGAS KULIAH]* 📢`,
    ``,
    `📚 *Mata Kuliah:* ${task.courseName} ${course?.code ? `(${course.code})` : ''}`,
    `👨‍🏫 *Dosen:* ${course?.lecturer || 'Dosen Pengampu'}`,
    `📝 *Tugas:* ${task.title}`,
    `👥 *Jenis:* ${task.type}${task.groupSize ? ` (${task.groupSize})` : ''}`,
    `🔥 *Prioritas:* ${task.priority}`,
    ``,
    `⏰ *Tenggat Waktu (Deadline):*`,
    `👉 ${formattedDeadline}`,
    `⏳ *Sisa Waktu:* ${countdown.text}`,
    ``,
    task.extendedNote ? `📌 *Catatan PJ:* ${task.extendedNote}\n` : '',
    `ℹ️ *Instruksi & Materi Tugas:*`,
    task.description ? task.description.slice(0, 300) + (task.description.length > 300 ? '...' : '') : 'Lihat instruksi lengkap di web pengingat tugas.',
    ``,
    task.attachments && task.attachments.length > 0 ? `📎 *Lampiran Soal/Materi:* ${task.attachments.length} berkas tersedia di web` : '',
    ``,
    `— Dicatat oleh: *${task.createdBy}*`,
    `🚀 *Semangat nugas teman-teman!* ✨`,
  ];

  return lines.filter((l) => l !== '').join('\n');
}

export function downloadICalendar(task: Task) {
  const start = new Date(task.deadline);
  // Default reminder event 1 hour before deadline
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pengingat Tugas Kuliah//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:task-${task.id}@pengingattugas.app`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:[PENGINGAT DEADLINE] ${task.courseName}: ${task.title}`,
    `DESCRIPTION:${task.description.replace(/\n/g, '\\n')}`,
    `STATUS:CONFIRMED`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Pengingat: Deadline tugas ${task.title} tersisa 24 jam!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Deadline_${task.courseName.replace(/\s+/g, '_')}_${task.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Gentle audio notification using Web Audio API
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.15);
    osc1.stop(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn('Audio play restricted or unavailable:', err);
  }
}
