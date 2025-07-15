import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Schedule } from 'src/app/services/api/report.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
import { ReportsDataService } from 'src/app/services/reports-data.service';

interface ScheduleOptionsMatDialogData {
  reportSections: ReportSection[];
  clientUuid: string;
  schedule: any;
  isEditMode: boolean;
  datePreset: string;
  schedulingOptionId: string;
  messages: {
    whatsapp: string,
    slack: string,
    email: {
      title: string,
      body: string,
    }
  }
}

@Component({
  selector: 'schedule-options',
  templateUrl: './schedule-options.component.html',
  styleUrl: './schedule-options.component.scss'
})
export class ScheduleOptionsComponent {

  @Input() schedule: Schedule | undefined = undefined;
  @Input() isEditMode: boolean = false;
  @Input() clientUuid: string = "";
  @Input() messages: {
    whatsapp: string,
    slack: string,
    email: {
      title: string,
      body: string,
    }
  } = {
    whatsapp: '',
    slack: '',
    email: {
      title: '',
      body: ''
    }
  }

  // @Output() scheduleOptionUpdated = new EventEmitter<void>();

  selectedDatePreset: string | undefined = undefined;
  // @Output() selectedDatePresetChange = new EventEmitter<string>();

  messagesWindowOpen: boolean = false;

  accordion: any = {
    whatsapp: false,
    slack: false,
    email: false
  }

  constructor(
    public reportsDataService: ReportsDataService,
    public dialogRef: MatDialogRef<ScheduleOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleOptionsMatDialogData
  ) {
    this.schedule = data.schedule;
    this.selectedDatePreset = data.datePreset ? data.datePreset : this.reportsDataService.DATE_PRESETS[6].value;
    this.messages = data.messages;
    this.clientUuid = data.clientUuid;
  }


  save() {
    this.dialogRef.close({
      schedule: this.schedule,
      clientUuid: this.clientUuid,
      datePreset: this.selectedDatePreset,
      messages: this.messages
    });
  }



}
