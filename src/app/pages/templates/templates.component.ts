import { Component, OnInit, signal, inject } from '@angular/core';
import { SchedulesTemplatesService } from '@services/api/schedules-templates.service';
import { Router } from '@angular/router';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface SchedulingTemplate {
  uuid: string;
  name: string;
  description?: string;
  createdAt: string;
  origin?: string;
  visibility?: string;
}

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
})
export class TemplatesComponent implements OnInit {
  templates = signal<SchedulingTemplate[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

//   faTemplate = faTemplate;
  faSpinner = faSpinner;

  private schedulesTemplatesService = inject(SchedulesTemplatesService);
  private router = inject(Router);

  constructor() {}

  async ngOnInit() {
    await this.loadTemplates();
  }

  async loadTemplates() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const templates = await this.schedulesTemplatesService.getAllTemplates();
      this.templates.set(templates);
    } catch (err) {
      console.error('Failed to load templates', err);
      this.error.set('Failed to load templates. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  createTemplate(): void {
    // Navigate to client selection to create a new scheduling option that can be converted to a template
    this.router.navigate(['/dashboard']);
  }

  previewTemplate(templateUuid: string) {
    this.router.navigate(['/template', templateUuid]);
  }
}
