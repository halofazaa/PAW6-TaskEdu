import {
  Task,
  StoragePayload,
  OperationResult,
  FilterPredicate,
  Comparator,
  DeadlineStatus
} from '../types/task';

// Key default untuk penyimpanan data tugas di LocalStorage
export const STORAGE_KEY_TASKS = 'taskademik_college_tasks_v1';

/**
 * Generic Helper Function: Mengambil item dari LocalStorage dengan fallback default value
 * @param key Kunci LocalStorage (string)
 * @param defaultValue Nilai default jika data tidak ditemukan atau parse gagal (T)
 * @returns Data bertipe T
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) {
      return defaultValue;
    }
    const parsed: StoragePayload<T> | T = JSON.parse(rawData);

    // Mendukung baik format StoragePayload wrapper maupun direct json
    if (parsed && typeof parsed === 'object' && 'data' in parsed && 'version' in parsed) {
      return (parsed as StoragePayload<T>).data;
    }
    return parsed as T;
  } catch (error) {
    console.warn(`[LocalStorage] Gagal membaca key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Generic Helper Function: Menyimpan item ke LocalStorage dengan metadata versioning
 * @param key Kunci LocalStorage (string)
 * @param value Nilai yang ingin disimpan bertipe T
 * @returns OperationResult<T> status keberhasilan operasi
 */
export function setStorageItem<T>(key: string, value: T): OperationResult<T> {
  try {
    const payload: StoragePayload<T> = {
      data: value,
      timestamp: Date.now(),
      version: '1.0.0'
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return {
      success: true,
      data: value,
      message: 'Data berhasil disimpan ke local storage'
    };
  } catch (error) {
    console.error(`[LocalStorage] Gagal menyimpan key "${key}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: 'Gagal menyimpan ke penyimpanan lokal'
    };
  }
}

/**
 * Menghapus data dari LocalStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Gagal menghapus key "${key}":`, error);
    return false;
  }
}

// ==========================================
// Generic Collection & Array Helpers
// ==========================================

/**
 * Generic Helper Function: Memfilter array dengan fungsi predikat bertipe generic T
 */
export function filterItems<T>(items: T[], predicate: FilterPredicate<T>): T[] {
  return items.filter(predicate);
}

/**
 * Generic Helper Function: Mengurutkan array dengan komparator generic T (immutable)
 */
export function sortItems<T>(items: T[], comparator: Comparator<T>): T[] {
  return [...items].sort(comparator);
}

/**
 * Generic Helper Function: Mencari item berdasarkan key dan value tertentu
 */
export function findItemByKey<T, K extends keyof T>(
  items: T[],
  key: K,
  value: T[K]
): T | undefined {
  return items.find((item) => item[key] === value);
}

/**
 * Generic Helper Function: Mengupdate item dalam array yang memiliki properti 'id'
 */
export function updateItemInList<T extends { id: string }>(items: T[], updatedItem: T): T[] {
  return items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
}

/**
 * Generic Helper Function: Menghapus item dari array berdasarkan 'id'
 */
export function removeItemFromList<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

// ==========================================
// Helper Utility untuk Task Kuliah
// ==========================================

/**
 * Menghasilkan unique ID untuk tugas baru
 */
export function generateUniqueId(): string {
  return 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Format tanggal Indonesia yang ramah dibaca
 * Contoh: "Senin, 10 Nov 2026, 23:59 WIB"
 */
export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Menentukan status deadline & sisa waktu (relative time)
 */
export function getDeadlineInfo(
  deadlineStr: string,
  isCompleted: boolean
): { status: DeadlineStatus; label: string; textClass: string; bgClass: string } {
  if (isCompleted) {
    return {
      status: 'completed',
      label: 'Selesai',
      textClass: 'badge-completed-text',
      bgClass: 'badge-completed-bg'
    };
  }

  const deadline = new Date(deadlineStr);
  const now = new Date();

  // Reset jam/menit untuk perbandingan hari
  const deadlineDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()).getTime();
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((deadlineDay - todayDay) / (1000 * 60 * 60 * 24));

  if (deadline.getTime() < now.getTime()) {
    const overdueDays = Math.abs(diffDays);
    const overdueLabel = overdueDays === 0 ? 'Terlewat beberapa jam lalu' : `Terlewat ${overdueDays} hari`;
    return {
      status: 'overdue',
      label: overdueLabel,
      textClass: 'badge-overdue-text',
      bgClass: 'badge-overdue-bg'
    };
  }

  if (diffDays === 0) {
    return {
      status: 'today',
      label: 'Hari ini!',
      textClass: 'badge-warning-text',
      bgClass: 'badge-warning-bg'
    };
  }

  if (diffDays === 1) {
    return {
      status: 'upcoming',
      label: 'Besok',
      textClass: 'badge-warning-text',
      bgClass: 'badge-warning-bg'
    };
  }

  if (diffDays <= 3) {
    return {
      status: 'upcoming',
      label: `${diffDays} hari lagi`,
      textClass: 'badge-upcoming-text',
      bgClass: 'badge-upcoming-bg'
    };
  }

  return {
    status: 'upcoming',
    label: `${diffDays} hari lagi`,
    textClass: 'badge-normal-text',
    bgClass: 'badge-normal-bg'
  };
}

/**
 * Data awal tugas kuliah bawaan agar web langsung hidup dan menarik saat pertama kali dibuka
 */
export const INITIAL_COLLEGE_TASKS: Task[] = [
  {
    id: 'demo_task_1',
    title: 'Implementasi Algoritma Dijkstra & A*',
    course: 'Desain & Analisis Algoritma',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: 'Buat representasi graf dengan adjacency list dan bandingkan performa waktu komputasi.',
    isCompleted: false,
    priority: 'high',
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'demo_task_2',
    title: 'Normalisasi Database Sistem Rumah Sakit',
    course: 'Basis Data Terdistribusi',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: 'Selesaikan skema relasi hingga bentuk normal 3NF dan BCNF beserta ER diagramnya.',
    isCompleted: false,
    priority: 'medium',
    createdAt: Date.now() - 3600000 * 18
  },
  {
    id: 'demo_task_3',
    title: 'Desain UI Wireframe & Prototyping Figma',
    course: 'Interaksi Manusia & Komputer',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: 'Studi usability testing pada 5 partisipan dan dokumentasikan temuan heuristic evaluation.',
    isCompleted: true,
    priority: 'low',
    createdAt: Date.now() - 3600000 * 48
  },
  {
    id: 'demo_task_4',
    title: 'Makalah Etika Kecerdasan Buatan (AI Ethics)',
    course: 'Etika Profesi & Hukum Siber',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: 'Analisis studi kasus perlindungan data pribadi dan bias algoritma pada model LLM.',
    isCompleted: false,
    priority: 'low',
    createdAt: Date.now() - 3600000 * 6
  }
];
