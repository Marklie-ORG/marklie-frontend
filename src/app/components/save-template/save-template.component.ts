import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SchedulesTemplatesService, TemplateVisibility } from '@services/api/schedules-templates.service';
import { NotificationService } from '@services/notification.service';

export interface SaveTemplateDialogData {
  schedulingOptionUuid: string;
}

@Component({
  selector: 'app-save-template',
  templateUrl: './save-template.component.html',
  styleUrl: './save-template.component.scss',
})
export class SaveTemplateComponent implements OnInit {
  saveTemplateForm!: FormGroup;
  submitting = false;

  visibilityOptions = [
    { value: TemplateVisibility.PRIVATE, label: 'Private' },
    { value: TemplateVisibility.PUBLIC, label: 'Public' },
  ];

  private fb = inject(FormBuilder);
  private templatesService = inject(SchedulesTemplatesService);
  private notificationService = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<SaveTemplateComponent>);

  schedulingOptionUuid: string = '';

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.saveTemplateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      visibility: [TemplateVisibility.PRIVATE, Validators.required],
    });
  }

  async onSubmit() {
    if (!this.saveTemplateForm.valid || !this.schedulingOptionUuid) return;

    this.submitting = true;
    try {
      await this.templatesService.createTemplateFromOption(
        this.schedulingOptionUuid,
        {
          name: this.saveTemplateForm.get('name')?.value,
          description: this.saveTemplateForm.get('description')?.value,
          visibility: this.saveTemplateForm.get('visibility')?.value,
          organizationUuid: null,
        }
      );
      this.notificationService.info('Template saved successfully');
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to save template', error);
      this.notificationService.info('Failed to save template. Please try again.');
    } finally {
      this.submitting = false;
    }
  }
}
