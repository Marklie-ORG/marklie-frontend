import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchedulesTemplatesService } from '@services/api/schedules-templates.service';
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { SchedulingTemplate } from 'src/app/interfaces/templates.interfaces';
import { ReportsDataService } from '@services/reports-data.service';
import { ReportSection } from 'src/app/interfaces/report-sections.interfaces';
import { MatDialog } from '@angular/material/dialog';
import { UseTemplateComponent } from '../../components/use-template/use-template.component';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrl: './template.component.scss'
})
export class TemplateComponent implements OnInit {

  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private templatesService = inject(SchedulesTemplatesService);
  private reportsDataService = inject(ReportsDataService);
  private dialog = inject(MatDialog);

  template = signal<SchedulingTemplate | null>(null);

  reportSections: ReportSection[] = [];

  async ngOnInit() {
    await this.loadTemplate();
  }

  async loadTemplate() {
    const templateUuid = this.route.snapshot.params['templateUuid'];
    if (!templateUuid) {
      return;
    }

    const template = await this.templatesService.getTemplateByUuid(templateUuid);
    if (!template) {
      return
    }
    this.template.set(template);
    if (!this.template()) {
      return;
    }
    console.log(this.template())
    this.reportSections = await this.reportsDataService.getReportsSectionsFromTemplate(this.template()!);
  }

  goBack() {
    this.router.navigate(['/templates']);
  }

  useTemplate() {
    if (!this.template()) return;

    const dialogRef = this.dialog.open(UseTemplateComponent, {
      width: '500px',
    });

    // Pass template UUID to the modal
    const dialogComponent = dialogRef.componentInstance;
    dialogComponent.templateUuid = this.template()!.uuid;

    dialogRef.afterClosed().subscribe((clientUuid) => {
      if (clientUuid) {
        // Navigate to dashboard after successful template application
        this.router.navigate(['/client', clientUuid]);
      }
    });
  }

}
