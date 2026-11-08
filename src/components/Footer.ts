import { AppConfig } from '../types/task';

/**
 * Komponen Footer
 * Menampilkan nama aplikasi dan versi dari .env serta informasi semester & status penyimpanan
 */
export class FooterComponent {
  private config: AppConfig;

  constructor() {
    this.config = {
      appName: import.meta.env.VITE_APP_NAME || 'Taskademik',
      appVersion: import.meta.env.VITE_APP_VERSION || 'v1.0.0',
      appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Pengelola Tugas Kuliah',
      collegeName: import.meta.env.VITE_COLLEGE_NAME || 'Portal Akademik'
    };
  }

  public render(): string {
    const currentYear = new Date().getFullYear();

    return `
      <footer class="bento-footer">
        <div class="footer-left">
          <div class="footer-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
            <span>${this.config.appName} <strong>${this.config.appVersion}</strong></span>
          </div>
          <span>&copy; ${currentYear} • Sistem Manajemen Tugas Kuliah Mahasiswa</span>
        </div>

        <div class="footer-right">
          <span title="Penyimpanan lokal di browser aktif">
            💾 LocalStorage Sinkron
          </span>
          <span style="color: var(--primary); font-weight: 600;">
            ${this.config.collegeName}
          </span>
        </div>
      </footer>
    `;
  }
}
