import { Task, TaskFormData, ModalMode, TaskPriority } from '../types/task';

/**
 * Komponen TaskForm
 * Mengelola modal form untuk menambah tugas baru atau mengedit tugas yang ada
 */
export class TaskFormComponent {
  private container: HTMLElement | null = null;
  private currentMode: ModalMode = 'create';
  private editingTaskId: string | null = null;
  private onSubmitCallback: (data: TaskFormData, editingId?: string) => void;

  constructor(onSubmitCallback: (data: TaskFormData, editingId?: string) => void) {
    this.onSubmitCallback = onSubmitCallback;
  }

  /**
   * Mengambil mode modal yang sedang aktif ('create' | 'edit')
   */
  public getMode(): ModalMode {
    return this.currentMode;
  }

  /**
   * Menginisialisasi markup modal ke dalam DOM
   */
  public mount(rootElement: HTMLElement): void {
    const modalHtml = `
      <div id="task-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">
              <svg id="modal-title-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span id="modal-title-text">Tambah Tugas Kuliah</span>
            </h2>
            <button type="button" class="modal-close-btn" id="btn-close-modal" aria-label="Tutup form">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form id="task-form" novalidate>
            <div class="modal-body">
              <!-- Judul Tugas -->
              <div class="form-group" id="group-title">
                <label class="form-label" for="task-title-input">
                  <span>Judul Tugas Kuliah <span class="required">*</span></span>
                </label>
                <input 
                  type="text" 
                  id="task-title-input" 
                  class="form-input" 
                  placeholder="Contoh: Laporan Akhir Praktikum Jaringan" 
                  required 
                  maxlength="120"
                />
                <span class="form-error-msg" id="error-title">Judul tugas tidak boleh kosong</span>
              </div>

              <!-- Mata Kuliah -->
              <div class="form-group" id="group-course">
                <label class="form-label" for="task-course-input">
                  <span>Mata Kuliah <span class="required">*</span></span>
                </label>
                <input 
                  type="text" 
                  id="task-course-input" 
                  class="form-input" 
                  placeholder="Contoh: Jaringan Komputer, Algoritma, Kalkulus" 
                  required 
                  maxlength="80"
                />
                <span class="form-error-msg" id="error-course">Nama mata kuliah wajib diisi</span>
              </div>

              <!-- Tenggat Waktu & Prioritas (2 Kolom) -->
              <div class="form-row-2">
                <div class="form-group" id="group-deadline">
                  <label class="form-label" for="task-deadline-input">
                    <span>Tenggat Waktu <span class="required">*</span></span>
                  </label>
                  <input 
                    type="datetime-local" 
                    id="task-deadline-input" 
                    class="form-input" 
                    required 
                  />
                  <span class="form-error-msg" id="error-deadline">Tenggat waktu wajib dipilih</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="task-priority-select">
                    <span>Tingkat Prioritas</span>
                  </label>
                  <select id="task-priority-select" class="form-select custom-select">
                    <option value="low">🟢 Rendah</option>
                    <option value="medium" selected>🟡 Sedang</option>
                    <option value="high">🔴 Tinggi</option>
                  </select>
                </div>
              </div>

              <!-- Deskripsi Tambahan -->
              <div class="form-group">
                <label class="form-label" for="task-desc-input">
                  <span>Catatan / Deskripsi Tambahan (Opsional)</span>
                </label>
                <textarea 
                  id="task-desc-input" 
                  class="form-textarea" 
                  placeholder="Catatan detail petunjuk tugas, format file (PDF/ZIP), link referensi, dll..."
                  rows="3"
                ></textarea>
              </div>

              <!-- Status Penyelesaian (Tampil pada mode edit / opsi tambah) -->
              <div class="form-group">
                <label class="status-toggle-label" style="margin-top: 0.25rem;">
                  <input type="checkbox" id="task-status-input" class="status-checkbox" />
                  <span>Tandai sebagai sudah selesai</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-cancel-modal">Batal</button>
              <button type="submit" class="btn-primary-action" id="btn-submit-task">
                <span id="submit-btn-text">Simpan Tugas</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    rootElement.insertAdjacentHTML('beforeend', modalHtml);
    this.container = rootElement.querySelector<HTMLElement>('#task-modal');
    this.attachEventListeners();
  }

  /**
   * Menghubungkan event listener modal
   */
  private attachEventListeners(): void {
    if (!this.container) return;

    const form = this.container.querySelector<HTMLFormElement>('#task-form');
    const closeBtn = this.container.querySelector<HTMLButtonElement>('#btn-close-modal');
    const cancelBtn = this.container.querySelector<HTMLButtonElement>('#btn-cancel-modal');

    // Submit form handler
    form?.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Close actions
    closeBtn?.addEventListener('click', () => this.close());
    cancelBtn?.addEventListener('click', () => this.close());

    // Tutup saat klik di backdrop area luar
    this.container.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Tutup dengan tombol keyboard ESC
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Reset error styling on typing
    const titleInput = this.container.querySelector<HTMLInputElement>('#task-title-input');
    const courseInput = this.container.querySelector<HTMLInputElement>('#task-course-input');
    const deadlineInput = this.container.querySelector<HTMLInputElement>('#task-deadline-input');

    titleInput?.addEventListener('input', () => this.clearError('group-title'));
    courseInput?.addEventListener('input', () => this.clearError('group-course'));
    deadlineInput?.addEventListener('input', () => this.clearError('group-deadline'));
  }

  /**
   * Membuka modal dalam mode Buat Baru
   */
  public openCreateMode(): void {
    this.currentMode = 'create';
    this.editingTaskId = null;
    this.updateModalHeader('Tambah Tugas Kuliah', 'create');
    this.resetForm();

    // Default datetime 3 hari ke depan pukul 23:59
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    defaultDate.setHours(23, 59, 0, 0);
    
    // Format YYYY-MM-DDTHH:mm
    const tzOffset = defaultDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(defaultDate.getTime() - tzOffset).toISOString().slice(0, 16);

    const deadlineInput = this.container?.querySelector<HTMLInputElement>('#task-deadline-input');
    if (deadlineInput) {
      deadlineInput.value = localISOTime;
    }

    this.show();
  }

  /**
   * Membuka modal dalam mode Edit dengan data tugas terpilih
   */
  public openEditMode(task: Task): void {
    this.currentMode = 'edit';
    this.editingTaskId = task.id;
    this.updateModalHeader('Edit Tugas Kuliah', 'edit');

    if (!this.container) return;

    const titleInput = this.container.querySelector<HTMLInputElement>('#task-title-input');
    const courseInput = this.container.querySelector<HTMLInputElement>('#task-course-input');
    const deadlineInput = this.container.querySelector<HTMLInputElement>('#task-deadline-input');
    const prioritySelect = this.container.querySelector<HTMLSelectElement>('#task-priority-select');
    const descInput = this.container.querySelector<HTMLTextAreaElement>('#task-desc-input');
    const statusCheckbox = this.container.querySelector<HTMLInputElement>('#task-status-input');

    if (titleInput) titleInput.value = task.title;
    if (courseInput) courseInput.value = task.course;
    if (deadlineInput) deadlineInput.value = task.deadline.slice(0, 16);
    if (prioritySelect) prioritySelect.value = task.priority;
    if (descInput) descInput.value = task.description || '';
    if (statusCheckbox) statusCheckbox.checked = task.isCompleted;

    this.show();
  }

  /**
   * Menampilkan dialog modal
   */
  private show(): void {
    if (!this.container) return;
    this.container.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus input pertama
    setTimeout(() => {
      const titleInput = this.container?.querySelector<HTMLInputElement>('#task-title-input');
      titleInput?.focus();
    }, 100);
  }

  /**
   * Menutup dialog modal
   */
  public close(): void {
    if (!this.container) return;
    this.container.classList.remove('active');
    document.body.style.overflow = '';
    this.resetErrors();
  }

  /**
   * Cek apakah modal sedang terbuka
   */
  public isOpen(): boolean {
    return this.container?.classList.contains('active') ?? false;
  }

  /**
   * Mengubah judul modal sesuai mode
   */
  private updateModalHeader(title: string, mode: ModalMode): void {
    if (!this.container) return;
    const titleText = this.container.querySelector<HTMLElement>('#modal-title-text');
    const submitBtnText = this.container.querySelector<HTMLElement>('#submit-btn-text');

    if (titleText) titleText.textContent = title;
    if (submitBtnText) {
      submitBtnText.textContent = mode === 'create' ? 'Tambah Tugas' : 'Perbarui Tugas';
    }
  }

  /**
   * Reset seluruh nilai form
   */
  private resetForm(): void {
    if (!this.container) return;
    const form = this.container.querySelector<HTMLFormElement>('#task-form');
    form?.reset();
    this.resetErrors();
  }

  /**
   * Validasi dan proses penyimpanan
   */
  private handleSubmit(): void {
    if (!this.container) return;

    const titleInput = this.container.querySelector<HTMLInputElement>('#task-title-input');
    const courseInput = this.container.querySelector<HTMLInputElement>('#task-course-input');
    const deadlineInput = this.container.querySelector<HTMLInputElement>('#task-deadline-input');
    const prioritySelect = this.container.querySelector<HTMLSelectElement>('#task-priority-select');
    const descInput = this.container.querySelector<HTMLTextAreaElement>('#task-desc-input');
    const statusCheckbox = this.container.querySelector<HTMLInputElement>('#task-status-input');

    const title: string = titleInput?.value.trim() || '';
    const course: string = courseInput?.value.trim() || '';
    const deadline: string = deadlineInput?.value || '';
    const priority: TaskPriority = (prioritySelect?.value as TaskPriority) || 'medium';
    const description: string = descInput?.value.trim() || '';
    const isCompleted: boolean = statusCheckbox?.checked || false;

    let hasError: boolean = false;

    if (!title) {
      this.showError('group-title', 'Judul tugas wajib diisi');
      hasError = true;
    }

    if (!course) {
      this.showError('group-course', 'Mata kuliah wajib diisi');
      hasError = true;
    }

    if (!deadline) {
      this.showError('group-deadline', 'Tenggat waktu wajib dipilih');
      hasError = true;
    }

    if (hasError) return;

    const formData: TaskFormData = {
      title,
      course,
      deadline,
      description,
      priority,
      isCompleted
    };

    this.onSubmitCallback(formData, this.editingTaskId || undefined);
    this.close();
  }

  private showError(groupId: string, message: string): void {
    const group = this.container?.querySelector(`#${groupId}`);
    if (group) {
      group.classList.add('has-error');
      const errorMsg = group.querySelector('.form-error-msg');
      if (errorMsg) errorMsg.textContent = message;
    }
  }

  private clearError(groupId: string): void {
    const group = this.container?.querySelector(`#${groupId}`);
    group?.classList.remove('has-error');
  }

  private resetErrors(): void {
    if (!this.container) return;
    const errorGroups = this.container.querySelectorAll('.has-error');
    errorGroups.forEach((el) => el.classList.remove('has-error'));
  }
}
