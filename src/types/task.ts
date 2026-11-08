/**
 * Task Manager Types & Interfaces
 * Demonstrating TypeScript Coverage:
 * - Primitive Types (string, number, boolean)
 * - Array Types (Task[], string[], etc.)
 * - Interfaces (Task, TaskFormData, TaskStatsData, etc.)
 * - Type Aliases & Union Types (TaskPriority, TaskStatusFilter, etc.)
 * - Generic Type Definitions (Result<T>, StoragePayload<T>, FilterPredicate<T>)
 */

// ==========================================
// 1. Primitive Types & Union Types (Type Aliases)
// ==========================================

/** Tingkat prioritas tugas kuliah */
export type TaskPriority = 'low' | 'medium' | 'high';

/** Opsi filter status tugas */
export type TaskStatusFilter = 'all' | 'pending' | 'completed';

/** Opsi pengurutan daftar tugas */
export type TaskSortOption = 
  | 'deadline-asc' 
  | 'deadline-desc' 
  | 'created-desc' 
  | 'title-asc' 
  | 'course-asc';

/** Mode form untuk tambah atau edit */
export type ModalMode = 'create' | 'edit';

/** Status deadline untuk visual badge */
export type DeadlineStatus = 'overdue' | 'today' | 'upcoming' | 'completed';

// ==========================================
// 2. Interfaces
// ==========================================

/** Interface utama merepresentasikan sebuah Tugas Kuliah */
export interface Task {
  id: string;               // Primitive: string
  title: string;            // Primitive: string
  course: string;           // Primitive: string (Mata Kuliah)
  deadline: string;         // Primitive: string (ISO date/datetime)
  description?: string;     // Primitive: optional string
  isCompleted: boolean;     // Primitive: boolean
  priority: TaskPriority;   // Union Type
  createdAt: number;        // Primitive: number (timestamp)
  updatedAt?: number;       // Primitive: optional number (timestamp)
}

/** Interface untuk data input dari Form Tambah / Edit */
export interface TaskFormData {
  title: string;
  course: string;
  deadline: string;
  description: string;
  priority: TaskPriority;
  isCompleted: boolean;
}

/** Interface untuk data ringkasan / statistik bento grid */
export interface TaskStatsData {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  upcomingSoon: number;
  completionRate: number; // percentage (0 - 100)
}

/** Interface untuk filter dan pencarian aktif */
export interface FilterState {
  status: TaskStatusFilter;
  priority: TaskPriority | 'all';
  searchQuery: string;
  course: string; // 'all' atau nama mata kuliah spesifik
  sortBy: TaskSortOption;
}

/** Interface konfigurasi environment (.env) */
export interface AppConfig {
  appName: string;
  appVersion: string;
  appDescription: string;
  collegeName: string;
}

// ==========================================
// 3. Generics (Generic Types & Helper Signatures)
// ==========================================

/** Generic result pattern untuk operasi yang bisa berhasil atau gagal */
export type OperationResult<T, E = Error> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: E; message: string };

/** Generic wrapper untuk data yang disimpan di LocalStorage */
export interface StoragePayload<T> {
  data: T;
  timestamp: number;
  version: string;
}

/** Generic predicate function type untuk filter array */
export type FilterPredicate<T> = (item: T) => boolean;

/** Generic comparator function type untuk sorting */
export type Comparator<T> = (a: T, b: T) => number;
