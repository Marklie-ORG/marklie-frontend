import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClientService, Client } from '../../services/api/client.service';
import { SchedulesTemplatesService } from '../../services/api/schedules-templates.service';
import { NotificationService } from '@services/notification.service';

export interface UseTemplateDialogData {
  templateUuid: string;
}

@Component({
  selector: 'app-use-template',
  templateUrl: './use-template.component.html',
  styleUrl: './use-template.component.scss',
})
export class UseTemplateComponent implements OnInit {
  useTemplateForm!: FormGroup;
  clients = signal<Client[]>([]);
  loading = signal(false);
  submitting = signal(false);

  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private templateService = inject(SchedulesTemplatesService);
  private notificationService = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<UseTemplateComponent>);

  templateUuid: string = '';

  ngOnInit() {
    this.initializeForm();
    this.loadClients();
  }

  private initializeForm() {
    this.useTemplateForm = this.fb.group({
      clientUuid: ['', Validators.required],
    });
  }

  private async loadClients() {
    this.loading.set(true);
    try {
      const clientsList = await this.clientService.getClients();
      this.clients.set(clientsList);
    } catch (error) {
      console.error('Failed to load clients', error);
      this.notificationService.info('Failed to load clients');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (!this.useTemplateForm.valid || !this.templateUuid) return;

    this.submitting.set(true);
    try {
      await this.templateService.createOptionFromTemplate(
        this.templateUuid,
        this.useTemplateForm.get('clientUuid')?.value
      );
      this.notificationService.info('Template applied successfully');
      this.dialogRef.close(this.useTemplateForm.get('clientUuid')?.value);
    } catch (error) {
      console.error('Failed to apply template', error);
      this.notificationService.info('Failed to apply template. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
