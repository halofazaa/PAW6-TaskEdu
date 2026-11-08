import './assets/styles.css';
import {
  Task,
  TaskFormData,
  TaskStatusFilter,
  TaskPriority,
  TaskSortOption,
  FilterState,
  Comparator,
  FilterPredicate
} from './types/task';
import {
  STORAGE_KEY_TASKS,
  INITIAL_COLLEGE_TASKS,
  getStorageItem,
  setStorageItem,
  filterItems,
  sortItems,
  updateItemInList,
  removeItemFromList,
  generateUniqueId
} from './utils/storage';
import { HeaderComponent } from './components/Header';
import { TaskStatsComponent } from './components/TaskStats';
import { TaskItemComponent } from './components/TaskItem';
import { TaskFormComponent } from './components/TaskForm';
import { FooterComponent } from './components/Footer';
import { showToast } from './utils/toast';

/**
 * TaskManagerApp Class
 * Mengkoordinasikan seluruh alur data aplikasi pengelola tugas kuliah
 */
class TaskManagerApp {
  // State Tugas Kuliah (Array of Task)
  private tasks: Task[] = [];

  // State Filter & Pencarian
  private filterState: FilterState = {
    status: 'all',
    priority: 'all',
    searchQuery: '',
    course: 'all',
    sortBy: 'deadline-asc'
  };

  // Komponen
  private headerComponent: HeaderComponent;
  private statsComponent: TaskStatsComponent;
  private formComponent: TaskFormComponent;
  private footerComponent: FooterComponent;

  // Root DOM Container
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;

    // Memuat data dari LocalStorage menggunakan generic helper function
    this.tasks = getStorageItem<Task[]>(STORAGE_KEY_TASKS, INITIAL_COLLEGE_TASKS);

    // Inisialisasi komponen
    this.headerComponent = new HeaderComponent(() => this.handleOpenCreateModal());
    this.statsComponent = new TaskStatsComponent();
    this.footerComponent = new FooterComponent();
    this.formComponent = new TaskFormComponent(
      (data: TaskFormData, editingId?: string) => this.handleSaveTask(data, editingId)
    );
  }

  /**
   * Inisialisasi awal aplikasi
   */
  public init(): void {
    this.renderLayout();
    this.formComponent.mount(document.body);
    this.attachEventListeners();
    this.updateStatsView();
    this.renderTaskList();
  }

  /**
   * Render struktur bento grid utama
   */
  private renderLayout(): void {
    this.rootElement.innerHTML = `
      <div class="app-container">
        <!-- 1. Header Bento (Membaca Environment Variables) -->
        <div id="header-slot">
          ${this.headerComponent.render()}
        </div>

        <!-- 2. Bento Statistics Grid -->
        <div id="stats-slot">
          ${this.statsComponent.render(this.tasks)}
        </div>

        <!-- 3. Bento Filter & Controls Bar -->
        <section class="bento-controls-card" aria-label="Filter dan Kontrol Tugas">
          <div class="controls-top-row">
            <!-- Search Bar -->
            <div class="search-box-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                id="search-task-input" 
                class="search-input" 
                placeholder="Cari judul tugas atau mata kuliah..." 
                value="${this.filterState.searchQuery}"
              />
            </div>

            <!-- Filter Status Tabs (Semua / Belum Selesai / Selesai) -->
            <nav class="filter-tabs" role="tablist" aria-label="Filter Status Tugas">
              <button 
                type="button" 
                class="filter-tab-btn ${this.filterState.status === 'all' ? 'active' : ''}" 
                data-status="all"
              >
                <span>Semua</span>
                <span class="tab-count" id="count-all">${this.tasks.length}</span>
              </button>
              <button 
                type="button" 
                class="filter-tab-btn ${this.filterState.status === 'pending' ? 'active' : ''}" 
                data-status="pending"
              >
                <span>Belum Selesai</span>
                <span class="tab-count" id="count-pending">${this.tasks.filter((t) => !t.isCompleted).length}</span>
              </button>
              <button 
                type="button" 
                class="filter-tab-btn ${this.filterState.status === 'completed' ? 'active' : ''}" 
                data-status="completed"
              >
                <span>Selesai</span>
                <span class="tab-count" id="count-completed">${this.tasks.filter((t) => t.isCompleted).length}</span>
              </button>
            </nav>
          </div>

          <!-- Secondary Filters: Urutkan & Filter Prioritas -->
          <div class="controls-bottom-row">
            <div class="filter-group">
              <span class="filter-label">Prioritas:</span>
              <select id="select-filter-priority" class="custom-select">
                <option value="all">Semua Tingkat</option>
                <option value="high">🔴 Prioritas Tinggi</option>
                <option value="medium">🟡 Prioritas Sedang</option>
                <option value="low">🟢 Prioritas Rendah</option>
              </select>

              <span class="filter-label" style="margin-left: 0.5rem;">Urutkan:</span>
              <select id="select-sort-by" class="custom-select">
                <option value="deadline-asc">📅 Tenggat Terdekat</option>
                <option value="deadline-desc">📅 Tenggat Terjauh</option>
                <option value="created-desc">🕒 Terbaru Ditambahkan</option>
                <option value="title-asc">🔤 Judul (A - Z)</option>
                <option value="course-asc">📚 Mata Kuliah (A - Z)</option>
              </select>
            </div>

            <div class="active-count-text">
              Menampilkan <strong id="visible-task-count">0</strong> tugas
            </div>
          </div>
        </section>

        <!-- 4. Daftar Kartu Tugas Kuliah (Bento Grid) -->
        <main class="task-grid-section">
          <div id="task-grid-container" class="task-grid">
            <!-- Render Task Cards disini -->
          </div>
        </main>

        <!-- 5. Footer Bento (Membaca Environment Variables) -->
        <div id="footer-slot">
          ${this.footerComponent.render()}
        </div>
      </div>
    `;

    // Hubungkan header events
    this.headerComponent.attachEvents(this.rootElement);
  }

  /**
   * Menghubungkan seluruh event listener UI
   */
  private attachEventListeners(): void {
    // 1. Filter Status Tabs (Semua / Belum Selesai / Selesai)
    const statusTabs = this.rootElement.querySelectorAll<HTMLButtonElement>('.filter-tab-btn');
    statusTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        statusTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const statusValue = tab.getAttribute('data-status') as TaskStatusFilter;
        this.filterState.status = statusValue || 'all';
        this.renderTaskList();
      });
    });

    // 2. Pencarian Real-time
    const searchInput = this.rootElement.querySelector<HTMLInputElement>('#search-task-input');
    searchInput?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.filterState.searchQuery = target.value.trim().toLowerCase();
      this.renderTaskList();
    });

    // 3. Filter Prioritas Dropdown
    const prioritySelect = this.rootElement.querySelector<HTMLSelectElement>('#select-filter-priority');
    prioritySelect?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.filterState.priority = (target.value as TaskPriority | 'all') || 'all';
      this.renderTaskList();
    });

    // 4. Sort Dropdown
    const sortSelect = this.rootElement.querySelector<HTMLSelectElement>('#select-sort-by');
    sortSelect?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.filterState.sortBy = (target.value as TaskSortOption) || 'deadline-asc';
      this.renderTaskList();
    });

    // 5. Delegasi Event pada Task Grid Container (Toggle status, Edit, Hapus)
    const gridContainer = this.rootElement.querySelector<HTMLElement>('#task-grid-container');
    if (gridContainer) {
      gridContainer.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Toggle Status Checkbox
        const checkbox = target.closest<HTMLInputElement>('.task-status-toggle');
        if (checkbox) {
          const taskId = checkbox.getAttribute('data-id');
          if (taskId) {
            this.handleToggleStatus(taskId, checkbox.checked);
          }
          return;
        }

        // Tombol Edit Tugas
        const editBtn = target.closest<HTMLButtonElement>('.btn-edit-task');
        if (editBtn) {
          const taskId = editBtn.getAttribute('data-id');
          if (taskId) {
            this.handleOpenEditModal(taskId);
          }
          return;
        }

        // Tombol Hapus Tugas
        const deleteBtn = target.closest<HTMLButtonElement>('.btn-delete-task');
        if (deleteBtn) {
          const taskId = deleteBtn.getAttribute('data-id');
          if (taskId) {
            this.handleDeleteTask(taskId);
          }
          return;
        }
      });
    }
  }

  /**
   * Menyaring dan mengurutkan tugas menggunakan Generic Helper Functions
   */
  private getFilteredAndSortedTasks(): Task[] {
    // 1. Generic Filter Predicate
    const predicate: FilterPredicate<Task> = (task: Task): boolean => {
      // Filter Status
      if (this.filterState.status === 'pending' && task.isCompleted) return false;
      if (this.filterState.status === 'completed' && !task.isCompleted) return false;

      // Filter Prioritas
      if (this.filterState.priority !== 'all' && task.priority !== this.filterState.priority) {
        return false;
      }

      // Filter Pencarian (Judul atau Mata Kuliah)
      if (this.filterState.searchQuery) {
        const query = this.filterState.searchQuery;
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesCourse = task.course.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesCourse && !matchesDesc) return false;
      }

      return true;
    };

    // Eksekusi filter secara generic
    const filtered: Task[] = filterItems<Task>(this.tasks, predicate);

    // 2. Generic Comparator untuk Sorting
    const comparator: Comparator<Task> = (a: Task, b: Task): number => {
      switch (this.filterState.sortBy) {
        case 'deadline-asc':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'deadline-desc':
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case 'created-desc':
          return b.createdAt - a.createdAt;
        case 'title-asc':
          return a.title.localeCompare(b.title, 'id');
        case 'course-asc':
          return a.course.localeCompare(b.course, 'id');
        default:
          return 0;
      }
    };

    // Eksekusi sort secara generic
    return sortItems<Task>(filtered, comparator);
  }

  /**
   * Render daftar tugas ke container
   */
  private renderTaskList(): void {
    const gridContainer = this.rootElement.querySelector<HTMLElement>('#task-grid-container');
    const visibleCountEl = this.rootElement.querySelector<HTMLElement>('#visible-task-count');
    if (!gridContainer) return;

    const visibleTasks: Task[] = this.getFilteredAndSortedTasks();

    if (visibleCountEl) {
      visibleCountEl.textContent = visibleTasks.length.toString();
    }

    // Perbarui tab counters
    this.updateTabCounters();

    // Jika kosong, tampilkan Bento Empty State
    if (visibleTasks.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 class="empty-title">Tidak Ada Tugas yang Ditemukan</h3>
          <p class="empty-text">
            ${
              this.filterState.searchQuery
                ? `Tidak ditemukan tugas dengan kata kunci "${this.filterState.searchQuery}".`
                : this.filterState.status === 'completed'
                ? 'Belum ada tugas yang diselesaikan. Yuk selesaikan tugasmu!'
                : 'Semua tugas telah diselesaikan atau belum ada tugas yang ditambahkan.'
            }
          </p>
          <button type="button" class="btn-primary-action" id="btn-empty-add-task">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tambah Tugas Sekarang
          </button>
        </div>
      `;

      const emptyAddBtn = gridContainer.querySelector<HTMLButtonElement>('#btn-empty-add-task');
      emptyAddBtn?.addEventListener('click', () => this.handleOpenCreateModal());
      return;
    }

    // Render kartu tiap tugas menggunakan TaskItemComponent
    const cardsHtml = visibleTasks.map((task: Task) => TaskItemComponent.render(task)).join('');
    gridContainer.innerHTML = cardsHtml;
  }

  /**
   * Perbarui angka counter pada tab filter
   */
  private updateTabCounters(): void {
    const allEl = this.rootElement.querySelector<HTMLElement>('#count-all');
    const pendingEl = this.rootElement.querySelector<HTMLElement>('#count-pending');
    const completedEl = this.rootElement.querySelector<HTMLElement>('#count-completed');

    const total = this.tasks.length;
    const pending = this.tasks.filter((t) => !t.isCompleted).length;
    const completed = this.tasks.filter((t) => t.isCompleted).length;

    if (allEl) allEl.textContent = total.toString();
    if (pendingEl) pendingEl.textContent = pending.toString();
    if (completedEl) completedEl.textContent = completed.toString();
  }

  /**
   * Perbarui tampilan Bento Stats Grid
   */
  private updateStatsView(): void {
    const statsSlot = this.rootElement.querySelector<HTMLElement>('#stats-slot');
    if (statsSlot) {
      statsSlot.innerHTML = this.statsComponent.render(this.tasks);
    }
  }

  /**
   * Simpan array tugas ke LocalStorage secara sinkron
   */
  private persistTasks(): void {
    setStorageItem<Task[]>(STORAGE_KEY_TASKS, this.tasks);
    this.updateStatsView();
    this.updateTabCounters();
  }

  // ==========================================
  // Handler Aksi CRUD Tugas
  // ==========================================

  /**
   * Buka modal untuk menambah tugas baru
   */
  private handleOpenCreateModal(): void {
    this.formComponent.openCreateMode();
  }

  /**
   * Buka modal untuk mengedit tugas yang dipilih
   */
  private handleOpenEditModal(taskId: string): void {
    const taskToEdit = this.tasks.find((t) => t.id === taskId);
    if (taskToEdit) {
      this.formComponent.openEditMode(taskToEdit);
    } else {
      showToast('Tugas tidak ditemukan', 'danger');
    }
  }

  /**
   * Menyimpan data dari modal form (Tambah atau Edit)
   */
  private handleSaveTask(formData: TaskFormData, editingId?: string): void {
    if (editingId) {
      // Mode Edit: Update item menggunakan generic helper updateItemInList
      const existingTask = this.tasks.find((t) => t.id === editingId);
      if (!existingTask) return;

      const updatedTask: Task = {
        ...existingTask,
        title: formData.title,
        course: formData.course,
        deadline: formData.deadline,
        description: formData.description,
        priority: formData.priority,
        isCompleted: formData.isCompleted,
        updatedAt: Date.now()
      };

      this.tasks = updateItemInList<Task>(this.tasks, updatedTask);
      this.persistTasks();
      this.renderTaskList();
      showToast('Tugas berhasil diperbarui!', 'success');
    } else {
      // Mode Tambah: Buat objek tugas baru
      const newTask: Task = {
        id: generateUniqueId(),
        title: formData.title,
        course: formData.course,
        deadline: formData.deadline,
        description: formData.description,
        priority: formData.priority,
        isCompleted: formData.isCompleted,
        createdAt: Date.now()
      };

      this.tasks = [newTask, ...this.tasks];
      this.persistTasks();
      this.renderTaskList();
      showToast('Tugas kuliah baru berhasil ditambahkan!', 'success');
    }
  }

  /**
   * Mengubah status penyelesaian tugas (Belum Selesai <-> Selesai)
   */
  private handleToggleStatus(taskId: string, isCompleted: boolean): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.isCompleted = isCompleted;
    task.updatedAt = Date.now();

    this.persistTasks();
    this.renderTaskList();

    if (isCompleted) {
      showToast(`Tugas "${task.title}" ditandai selesai 🎉`, 'success');
    } else {
      showToast(`Tugas "${task.title}" dipindahkan ke belum selesai`, 'info');
    }
  }

  /**
   * Menghapus tugas dari daftar
   */
  private handleDeleteTask(taskId: string): void {
    const taskToDelete = this.tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus tugas "${taskToDelete.title}" untuk mata kuliah ${taskToDelete.course}?`
    );

    if (confirmDelete) {
      // Menggunakan generic helper removeItemFromList
      this.tasks = removeItemFromList<Task>(this.tasks, taskId);
      this.persistTasks();
      this.renderTaskList();
      showToast(`Tugas "${taskToDelete.title}" telah dihapus`, 'danger');
    }
  }
}

// ==========================================
// Inisialisasi Aplikasi Saat DOM Ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    const app = new TaskManagerApp(appContainer);
    app.init();
  } else {
    console.error('Root element #app tidak ditemukan!');
  }
});
