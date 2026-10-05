import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Directories for persistence
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Calculate realistic dates based on current time
const now = new Date();
const addDays = (d: number, hours = 23, minutes = 59) => {
  const date = new Date(now);
  date.setDate(date.getDate() + d);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const DEFAULT_COURSES = [
  {
    id: 'c-1',
    code: 'IF3101',
    name: 'Pemrograman Web Lanjut',
    lecturer: 'Dr. Budi Prasetyo, M.Kom.',
    pjName: 'Ahmad Fauzi',
    pjContact: '0812-3456-7890',
    color: '#3b82f6', // blue
    semester: 'Semester 5',
  },
  {
    id: 'c-2',
    code: 'IF2204',
    name: 'Basis Data Terdistribusi',
    lecturer: 'Siti Rahmawati, S.Kom., M.T.',
    pjName: 'Dita Permata',
    pjContact: '0821-9876-5432',
    color: '#8b5cf6', // purple
    semester: 'Semester 5',
  },
  {
    id: 'c-3',
    code: 'IF4102',
    name: 'Kecerdasan Buatan & ML',
    lecturer: 'Prof. Bambang Sutrisno, Ph.D.',
    pjName: 'Kevin Sanjaya',
    pjContact: '0857-1122-3344',
    color: '#10b981', // emerald
    semester: 'Semester 5',
  },
  {
    id: 'c-4',
    code: 'IF3205',
    name: 'Jaringan & Keamanan Komputer',
    lecturer: 'Ir. Eko Nugroho, M.T.',
    pjName: 'Rizky Ramadhan',
    pjContact: '0813-5566-7788',
    color: '#f59e0b', // amber
    semester: 'Semester 5',
  },
  {
    id: 'c-5',
    code: 'IF3301',
    name: 'Rekayasa Perangkat Lunak',
    lecturer: 'Maya Indriani, S.T., M.Cs.',
    pjName: 'Nadia Salsabila',
    pjContact: '0819-2233-4455',
    color: '#ec4899', // pink
    semester: 'Semester 5',
  }
];

const DEFAULT_TASKS = [
  {
    id: 't-1',
    courseId: 'c-1',
    courseName: 'Pemrograman Web Lanjut',
    title: 'Tugas 3: REST API & Autentikasi JWT dengan Express',
    description: '1. Buat RESTful API untuk sistem manajemen perpustakaan.\n2. Wajib menerapkan middleware autentikasi JWT (JSON Web Token) dengan role Admin & Member.\n3. Buat dokumentasi Postman Collection atau Swagger.\n4. Cantumkan repository GitHub dengan commit history yang rapi.',
    type: 'Individu',
    groupSize: '',
    deadline: addDays(2, 23, 59),
    priority: 'Tinggi',
    status: 'Aktif',
    extendedNote: '',
    attachments: [
      {
        id: 'att-1',
        name: 'Modul_Praktikum_JWT_Express.pdf',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
        size: '1.2 MB',
        type: 'link'
      }
    ],
    createdBy: 'Ahmad Fauzi (PJ)',
    createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
  },
  {
    id: 't-2',
    courseId: 'c-2',
    courseName: 'Basis Data Terdistribusi',
    title: 'Tugas Besar Tahap 1: Desain Skema & Sharding Database',
    description: 'Buat rancangan arsitektur basis data terdistribusi untuk platform e-commerce dengan perkiraan 1 juta pengguna aktif. Terapkan teknik horizontal sharding berdasarkan customer ID, serta konfigurasi replikasi master-slave. Sertakan diagram arsitektur.',
    type: 'Kelompok',
    groupSize: '3-4 Orang',
    deadline: addDays(5, 17, 0),
    priority: 'Kuis/UAS',
    status: 'Diperpanjang',
    extendedNote: 'Deadline diperpanjang oleh Bu Dosen Siti Rahmawati dari Kamis menjadi Sabtu sore!',
    attachments: [],
    createdBy: 'Dita Permata (PJ)',
    createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
  },
  {
    id: 't-3',
    courseId: 'c-3',
    courseName: 'Kecerdasan Buatan & ML',
    title: 'Praktikum 4: Implementasi Random Forest & KNN pada Dataset Iris',
    description: 'Gunakan Jupyter Notebook / Google Colab. Bandingkan performa akurasi, precision, recall, dan f1-score antara algoritma Random Forest dan K-Nearest Neighbors (KNN). Lakukan hyperparameter tuning sederhana.',
    type: 'Individu',
    groupSize: '',
    deadline: addDays(1, 23, 59),
    priority: 'Sedang',
    status: 'Aktif',
    extendedNote: '',
    attachments: [],
    createdBy: 'Kevin Sanjaya (PJ)',
    createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
  },
  {
    id: 't-4',
    courseId: 'c-4',
    courseName: 'Jaringan & Keamanan Komputer',
    title: 'Analisis Packet Sniffing Menggunakan Wireshark',
    description: 'Lakukan penangkapan paket HTTP vs HTTPS pada jaringan lokal. Tunjukkan bukti mengapa transfer data plain HTTP tidak aman (capture username/password form uji coba) dan bagaimana enkripsi TLS bekerja pada HTTPS.',
    type: 'Individu',
    groupSize: '',
    deadline: addDays(8, 23, 59),
    priority: 'Sedang',
    status: 'Aktif',
    extendedNote: '',
    attachments: [],
    createdBy: 'Rizky Ramadhan (PJ)',
    createdAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
  },
  {
    id: 't-5',
    courseId: 'c-5',
    courseName: 'Rekayasa Perangkat Lunak',
    title: 'Pembuatan Dokumen SRS (Software Requirements Specification) IEEE 830',
    description: 'Susun dokumen SRS lengkap untuk proyek perangkat lunak semester ini. Dokumen harus memuat Functional Requirements, Non-Functional Requirements, Use Case Diagram, dan Activity Diagram.',
    type: 'Kelompok',
    groupSize: '4-5 Orang',
    deadline: addDays(12, 23, 59),
    priority: 'Tinggi',
    status: 'Aktif',
    extendedNote: '',
    attachments: [],
    createdBy: 'Nadia Salsabila (PJ)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

interface DatabaseData {
  pjPin: string;
  courses: typeof DEFAULT_COURSES;
  tasks: typeof DEFAULT_TASKS;
}

// Load or initialize DB
function getDB(): DatabaseData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db file:', err);
  }

  const initialDB: DatabaseData = {
    pjPin: '1234',
    courses: DEFAULT_COURSES,
    tasks: DEFAULT_TASKS,
  };
  saveDB(initialDB);
  return initialDB;
}

function saveDB(data: DatabaseData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

// PIN verification middleware
function checkPJAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const pinHeader = req.headers['x-pj-pin'] as string;
  const db = getDB();
  if (!pinHeader || pinHeader !== db.pjPin) {
    return res.status(401).json({
      error: 'Autentikasi PJ Gagal. PIN salah atau tidak ada otorisasi PJ Matkul.',
    });
  }
  next();
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Verify PIN
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  const db = getDB();
  if (pin === db.pjPin) {
    return res.json({ success: true, message: 'Autentikasi PJ berhasil' });
  }
  return res.status(401).json({ success: false, message: 'PIN PJ salah!' });
});

// Change PIN
app.post('/api/change-pin', checkPJAuth, (req, res) => {
  const { newPin } = req.body;
  if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
    return res.status(400).json({ error: 'PIN baru minimal 4 karakter!' });
  }
  const db = getDB();
  db.pjPin = newPin.trim();
  saveDB(db);
  res.json({ success: true, message: 'PIN PJ berhasil diperbarui' });
});

// Get Courses (Public: All students can view)
app.get('/api/courses', (req, res) => {
  const db = getDB();
  res.json(db.courses);
});

// Create/Update Course (PJ only)
app.post('/api/courses', checkPJAuth, (req, res) => {
  const { id, code, name, lecturer, pjName, pjContact, color, semester } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Kode dan Nama Mata Kuliah wajib diisi!' });
  }

  const db = getDB();
  if (id) {
    // Update existing course
    const index = db.courses.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan!' });
    }
    db.courses[index] = {
      ...db.courses[index],
      code: code.trim(),
      name: name.trim(),
      lecturer: lecturer ? lecturer.trim() : '',
      pjName: pjName ? pjName.trim() : '',
      pjContact: pjContact ? pjContact.trim() : '',
      color: color || db.courses[index].color || '#3b82f6',
      semester: semester || 'Semester 5',
    };
    saveDB(db);
    return res.json(db.courses[index]);
  } else {
    // Create new course
    const newCourse = {
      id: `c-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      lecturer: lecturer ? lecturer.trim() : '',
      pjName: pjName ? pjName.trim() : '',
      pjContact: pjContact ? pjContact.trim() : '',
      color: color || '#3b82f6',
      semester: semester || 'Semester 5',
    };
    db.courses.push(newCourse);
    saveDB(db);
    return res.status(201).json(newCourse);
  }
});

// Delete Course (PJ only)
app.delete('/api/courses/:id', checkPJAuth, (req, res) => {
  const { id } = req.params;
  const db = getDB();
  db.courses = db.courses.filter((c) => c.id !== id);
  // Optional: Also keep or remove tasks related to course
  saveDB(db);
  res.json({ success: true, message: 'Mata kuliah berhasil dihapus' });
});

// Get Tasks (Public: All students can view)
app.get('/api/tasks', (req, res) => {
  const db = getDB();
  res.json(db.tasks);
});

// Create Task (PJ only)
app.post('/api/tasks', checkPJAuth, (req, res) => {
  const {
    courseId,
    courseName,
    title,
    description,
    type,
    groupSize,
    deadline,
    priority,
    status,
    extendedNote,
    attachments,
    createdBy,
  } = req.body;

  if (!courseId || !title || !deadline) {
    return res.status(400).json({ error: 'Mata kuliah, judul tugas, dan deadline wajib diisi!' });
  }

  const db = getDB();
  const course = db.courses.find((c) => c.id === courseId);
  const resolvedCourseName = course ? course.name : (courseName || 'Mata Kuliah');

  const newTask = {
    id: `t-${Date.now()}`,
    courseId,
    courseName: resolvedCourseName,
    title: title.trim(),
    description: description ? description.trim() : '',
    type: type === 'Kelompok' ? 'Kelompok' : 'Individu',
    groupSize: type === 'Kelompok' ? (groupSize || 'Kelompok') : '',
    deadline: new Date(deadline).toISOString(),
    priority: priority || 'Sedang',
    status: status || 'Aktif',
    extendedNote: extendedNote ? extendedNote.trim() : '',
    attachments: Array.isArray(attachments) ? attachments : [],
    createdBy: createdBy ? createdBy.trim() : 'PJ Matkul',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks.unshift(newTask);
  saveDB(db);
  res.status(201).json(newTask);
});

// Update Task (PJ only)
app.put('/api/tasks/:id', checkPJAuth, (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const index = db.tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan!' });
  }

  const existing = db.tasks[index];
  const {
    courseId,
    courseName,
    title,
    description,
    type,
    groupSize,
    deadline,
    priority,
    status,
    extendedNote,
    attachments,
    createdBy,
  } = req.body;

  let resolvedCourseName = existing.courseName;
  if (courseId) {
    const course = db.courses.find((c) => c.id === courseId);
    if (course) resolvedCourseName = course.name;
    else if (courseName) resolvedCourseName = courseName;
  }

  db.tasks[index] = {
    ...existing,
    courseId: courseId || existing.courseId,
    courseName: resolvedCourseName,
    title: title !== undefined ? title.trim() : existing.title,
    description: description !== undefined ? description.trim() : existing.description,
    type: type !== undefined ? type : existing.type,
    groupSize: type === 'Kelompok' ? (groupSize || existing.groupSize) : '',
    deadline: deadline ? new Date(deadline).toISOString() : existing.deadline,
    priority: priority || existing.priority,
    status: status || existing.status,
    extendedNote: extendedNote !== undefined ? extendedNote.trim() : existing.extendedNote,
    attachments: Array.isArray(attachments) ? attachments : existing.attachments,
    createdBy: createdBy || existing.createdBy,
    updatedAt: new Date().toISOString(),
  };

  saveDB(db);
  res.json(db.tasks[index]);
});

// Delete Task (PJ only)
app.delete('/api/tasks/:id', checkPJAuth, (req, res) => {
  const { id } = req.params;
  const db = getDB();
  db.tasks = db.tasks.filter((t) => t.id !== id);
  saveDB(db);
  res.json({ success: true, message: 'Tugas berhasil dihapus' });
});

// File Upload endpoint (Supports base64 uploaded files from PJ for assignment sheets/docs)
app.post('/api/upload', checkPJAuth, (req, res) => {
  try {
    const { fileName, fileData, mimeType } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'File tidak lengkap' });
    }

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    // Extract base64 content
    const base64Data = fileData.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const sizeStr = stats.size > 1024 * 1024 ? `${(stats.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKB} KB`;

    res.json({
      success: true,
      file: {
        id: `att-${Date.now()}`,
        name: fileName,
        url: `/uploads/${safeName}`,
        size: sizeStr,
        type: mimeType || 'application/octet-stream',
      },
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Gagal mengunggah file: ' + err.message });
  }
});

// Reset demo data endpoint (Handy if user wants to reset sample data)
app.post('/api/reset-demo', checkPJAuth, (req, res) => {
  const freshDB: DatabaseData = {
    pjPin: '1234',
    courses: DEFAULT_COURSES,
    tasks: DEFAULT_TASKS,
  };
  saveDB(freshDB);
  res.json({ success: true, message: 'Data demo tugas berhasil di-reset', data: freshDB });
});

// Start server
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static build
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} [${isDev ? 'Development' : 'Production'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
