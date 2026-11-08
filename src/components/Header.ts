import { AppConfig } from '../types/task';

/**
 * Komponen Header
 * Membaca variabel environment (.env) melalui Vite import.meta.env
 * dan menampilkan branding, badge versi, tanggal aktif, serta tombol aksi cepat.
 */
export class HeaderComponent {
  private config: AppConfig;
  private onAddTaskClick: () => void;

  constructor(onAddTaskClick: () => void) {
    this.onAddTaskClick = onAddTaskClick;
    
    // Membaca environment variables dengan fallback default
    this.config = {
      appName: import.meta.env.VITE_APP_NAME || 'Taskademik',
      appVersion: import.meta.env.VITE_APP_VERSION || 'v1.0.0',
      appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Pengelola Tugas Kuliah Modern',
      collegeName: import.meta.env.VITE_COLLEGE_NAME || 'Portal Akademik Mahasiswa'
    };
  }

  /**
   * Menghasilkan string HTML untuk Header
   */
  public render(): string {
    const todayFormatted: string = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    return `
      <header class="bento-header">
        <div class="header-brand">
          <div class="brand-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
              <path d="M6 6h10"></path>
              <path d="M6 10h10"></path>
              <path d="m9 16 2 2 4-4"></path>
            </svg>
          </div>
          <div class="brand-info">
            <h1>
              ${this.config.appName}
              <span class="app-version-badge">${this.config.appVersion}</span>
            </h1>
            <p class="brand-subtitle">${this.config.appDescription} • ${this.config.collegeName}</p>
          </div>
        </div>

        <div class="header-meta">
          <div class="meta-pill" title="Tanggal Hari Ini">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            <span>${todayFormatted}</span>
          </div>

          <button id="btn-open-add-task" class="btn-primary-action" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Tambah Tugas</span>
          </button>
        </div>
      </header>
    `;
  }

  /**
   * Menghubungkan event listener ke tombol di DOM
   */
  public attachEvents(container: HTMLElement): void {
    const addBtn = container.querySelector<HTMLButtonElement>('#btn-open-add-task');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.onAddTaskClick();
      });
    }
  }
}
