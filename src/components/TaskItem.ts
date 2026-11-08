import { Task, TaskPriority } from '../types/task';
import { formatIndonesianDate, getDeadlineInfo } from '../utils/storage';

/**
 * Komponen TaskItem
 * Merender kartu tugas satuan dengan gaya Bento Card
 * Menampilkan judul, mata kuliah, tenggat waktu, prioritas, dan status
 */
export class TaskItemComponent {
  /**
   * Helper sanitasi HTML sederhana untuk mencegah XSS
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Mendapatkan label dan class CSS untuk prioritas
   */
  private static getPriorityBadge(priority: TaskPriority): { label: string; className: string } {
    switch (priority) {
      case 'high':
        return { label: 'Tinggi', className: 'priority-high' };
      case 'medium':
        return { label: 'Sedang', className: 'priority-medium' };
      case 'low':
      default:
        return { label: 'Rendah', className: 'priority-low' };
    }
  }

  /**
   * Merender string HTML untuk satu buah kartu tugas (Bento Task Card)
   */
  public static render(task: Task): string {
    const safeTitle = this.escapeHtml(task.title);
    const safeCourse = this.escapeHtml(task.course);
    const safeDesc = task.description ? this.escapeHtml(task.description) : '';
    
    const priorityInfo = this.getPriorityBadge(task.priority);
    const deadlineInfo = getDeadlineInfo(task.deadline, task.isCompleted);
    const formattedDeadline = formatIndonesianDate(task.deadline);

    return `
      <article 
        class="task-card ${task.isCompleted ? 'is-completed' : ''}" 
        data-task-id="${task.id}"
      >
        <!-- Header Kartu: Mata Kuliah & Badge Prioritas -->
        <div class="task-card-header">
          <span class="course-badge" title="Mata Kuliah: ${safeCourse}">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            ${safeCourse}
          </span>
          <span class="priority-badge ${priorityInfo.className}">
            ● ${priorityInfo.label}
          </span>
        </div>

        <!-- Body Kartu: Judul & Deskripsi Tugas -->
        <div class="task-card-body">
          <h3 class="task-title">${safeTitle}</h3>
          ${safeDesc ? `<p class="task-description">${safeDesc}</p>` : ''}
        </div>

        <!-- Deadline & Countdown Bar -->
        <div class="task-deadline-bar">
          <div class="deadline-time" title="Tenggat Waktu: ${formattedDeadline}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${formattedDeadline}</span>
          </div>
          <span class="deadline-badge ${deadlineInfo.bgClass}">
            ${deadlineInfo.label}
          </span>
        </div>

        <!-- Footer Kartu: Toggle Status Selesai, Tombol Edit, Tombol Hapus -->
        <div class="task-card-footer">
          <label class="status-toggle-label" title="Tandai Selesai / Belum Selesai">
            <input 
              type="checkbox" 
              class="status-checkbox task-status-toggle" 
              data-id="${task.id}" 
              ${task.isCompleted ? 'checked' : ''}
            />
            <span>${task.isCompleted ? 'Selesai' : 'Belum Selesai'}</span>
          </label>

          <div class="task-action-btns">
            <button 
              type="button" 
              class="btn-icon btn-edit-task" 
              data-id="${task.id}" 
              title="Edit Tugas Kuliah"
              aria-label="Edit Tugas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                <path d="m15 5 4 4"></path>
              </svg>
            </button>
            <button 
              type="button" 
              class="btn-icon btn-icon-danger btn-delete-task" 
              data-id="${task.id}" 
              title="Hapus Tugas"
              aria-label="Hapus Tugas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }
}
