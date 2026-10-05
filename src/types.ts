export type TaskPriority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kuis/UAS';
export type TaskStatus = 'Aktif' | 'Diperpanjang' | 'Selesai';
export type TaskType = 'Individu' | 'Kelompok';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  pjName: string;
  pjContact: string;
  color: string;
  semester: string;
}

export interface Task {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  type: TaskType;
  groupSize?: string;
  deadline: string; // ISO string
  priority: TaskPriority;
  status: TaskStatus;
  extendedNote?: string;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewFilter = 'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'completed' | 'uncompleted';
