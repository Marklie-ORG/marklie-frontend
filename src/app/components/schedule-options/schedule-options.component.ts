import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Frequency, Messages } from 'src/app/interfaces/interfaces.js';
import { ReportsDataService } from 'src/app/services/reports-data.service';

interface ScheduleOptionsMatDialogData {
  isEditMode: boolean;
  datePreset: string;
  schedulingOptionId: string;
  messages: Messages
  frequency: Frequency;
  time: string;
  dayOfWeek: string;
  dayOfMonth: number;
  intervalDays: number;
  cronExpression: string;
  reviewRequired: boolean;
}

@Component({
  selector: 'schedule-options',
  templateUrl: './schedule-options.component.html',
  styleUrl: './schedule-options.component.scss'
})
export class ScheduleOptionsComponent {
  
  @Input() isEditMode: boolean = false;
  @Input() clientUuid: string = "";
  @Input() messages: Messages = {
    whatsapp: '',
    slack: '',
    email: {
      title: '',
      body: ''
    }
  }

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
    this.messages = data.messages;
  }


  save() {
    this.dialogRef.close({
      frequency: this.data.frequency,
      time: this.data.time,
      dayOfWeek: this.data.dayOfWeek,
      dayOfMonth: this.data.dayOfMonth,
      intervalDays: this.data.intervalDays,
      messages: this.messages
    });
  }



}
