import { Task, TaskStatsData } from '../types/task';

/**
 * Komponen TaskStats
 * Menghitung indikator statistik tugas kuliah dan merendernya
 * dalam tata letak Bento Grid yang bersih dan visual.
 */
export class TaskStatsComponent {
  /**
   * Menghitung metrik statistik dari daftar tugas kuliah
   * Menerapkan Primitive Types, Arrays, dan Interface TaskStatsData
   */
  public calculateStats(tasks: Task[]): TaskStatsData {
    const total: number = tasks.length;
    const now: number = Date.now();

    let pending: number = 0;
    let completed: number = 0;
    let overdue: number = 0;
    let upcomingSoon: number = 0;

    const threeDaysMs: number = 3 * 24 * 60 * 60 * 1000;

    tasks.forEach((task: Task) => {
      if (task.isCompleted) {
        completed++;
      } else {
        pending++;
        const deadlineTime: number = new Date(task.deadline).getTime();
        if (deadlineTime < now) {
          overdue++;
        } else if (deadlineTime - now <= threeDaysMs) {
          upcomingSoon++;
        }
      }
    });

    const completionRate: number = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      pending,
      completed,
      overdue,
      upcomingSoon,
      completionRate
    };
  }

  /**
   * Mendapatkan jumlah mata kuliah unik yang memiliki tugas aktif
   */
  public getUniqueCoursesCount(tasks: Task[]): number {
    const coursesSet: Set<string> = new Set(
      tasks.map((task: Task) => task.course.trim().toLowerCase())
    );
    return coursesSet.size;
  }

  /**
   * Render HTML Bento Grid Statistik
   */
  public render(tasks: Task[]): string {
    const stats: TaskStatsData = this.calculateStats(tasks);
    const uniqueCourses: number = this.getUniqueCoursesCount(tasks);

    return `
      <section class="bento-stats-grid" aria-label="Statistik Tugas">
        <!-- Bento 1: Progress Penyelesaian (Hero Card) -->
        <div class="bento-card bento-col-3 bento-hero">
          <div>
            <div class="bento-hero-header">
              <span class="stat-label">Progres</span>
              <div class="bento-icon-tag tag-blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
            </div>
            <div class="stat-value">${stats.completionRate}%</div>
            <p class="stat-subtext">
              <strong>${stats.completed}</strong> dari <strong>${stats.total}</strong> tugas selesai
            </p>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${stats.completionRate}%;"></div>
          </div>
        </div>

        <!-- Bento 2: Tugas Belum Selesai (Pending) -->
        <div class="bento-card bento-col-3">
          <div class="bento-hero-header">
            <span class="stat-label">Belum Selesai</span>
            <div class="bento-icon-tag tag-amber">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="stat-value">${stats.pending}</div>
          <p class="stat-subtext">
            ${stats.overdue > 0 ? `<span style="color: #e11d48; font-weight: 700;">⚠️ ${stats.overdue} terlewat deadline</span>` : stats.upcomingSoon > 0 ? `<span style="color: #d97706; font-weight: 600;">🔥 ${stats.upcomingSoon} deadline dekat</span>` : 'Tersedia tugas aktif'}
          </p>
        </div>

        <!-- Bento 3: Tugas Selesai (Completed) -->
        <div class="bento-card bento-col-3">
          <div class="bento-hero-header">
            <span class="stat-label">Selesai</span>
            <div class="bento-icon-tag tag-emerald">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <div class="stat-value">${stats.completed}</div>
          <p class="stat-subtext">
            <span style="color: #15803d; font-weight: 600;">✨ Kinerja akademis baik</span>
          </p>
        </div>

        <!-- Bento 4: Mata Kuliah Aktif -->
        <div class="bento-card bento-col-3">
          <div class="bento-hero-header">
            <span class="stat-label">Mata Kuliah</span>
            <div class="bento-icon-tag tag-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M6 6h10"></path>
                <path d="M6 10h10"></path>
              </svg>
            </div>
          </div>
          <div class="stat-value">${uniqueCourses}</div>
          <p class="stat-subtext">
            <span style="color: #2563eb; font-weight: 600;">📚 Mata kuliah aktif</span>
          </p>
        </div>
      </section>
    `;
  }
}
