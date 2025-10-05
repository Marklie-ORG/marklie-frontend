import { MatDialogRef } from '@angular/material/dialog';
import { ClientService } from 'src/app/services/api/client.service';
import { Component, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacebookAdAccount } from '../ad-accounts-settings/ad-accounts-settings.component';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.scss',
})
export class AddClientComponent {

  clientForm: FormGroup;

  emails = signal<string[]>([]);
  phoneNumbers = signal<string[]>([]);
  facebookAdAccounts = signal<FacebookAdAccount[]>([]);

  // FacebookAdAccount

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddClientComponent>,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {
    
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      // facebookAdAccounts: [[], Validators.required],
    });

    // effect(() => {
    //   console.log(this.facebookAdAccounts())
    // })
    
  }

  async onSubmit() {

    console.log(this.clientForm);

    if (!this.clientForm.valid) {
      this.notificationService.info('Please enter a client name');
      return;
    }
    
    if (this.facebookAdAccounts().length === 0) {
      this.notificationService.info('Please add at least one ad account');
      return;
    }
    await this.clientService.createClient({
      ...this.clientForm.value, 
      emails: this.emails(), 
      phoneNumbers: this.phoneNumbers(),
      facebookAdAccounts: this.facebookAdAccounts()
    });
    this.dialogRef.close();
    
  }

  
  

}
