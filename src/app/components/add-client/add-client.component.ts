import { MatDialogRef } from '@angular/material/dialog';
import { ClientService } from 'src/app/services/api/client.service';
import { Component, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacebookAdAccount } from '../ad-accounts-settings/ad-accounts-settings.component';

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
    private clientService: ClientService
  ) {
    
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      // facebookAdAccounts: [[], Validators.required],
    });

    effect(() => {
      console.log(this.facebookAdAccounts())
    })
    
  }

  async onSubmit() {
    if (this.clientForm.valid) {
      console.log(this.clientForm.value);
      await this.clientService.createClient({
        ...this.clientForm.value, 
        emails: this.emails(), 
        phoneNumbers: this.phoneNumbers(),
        facebookAdAccounts: this.facebookAdAccounts()
      });
      this.dialogRef.close();
    }
  }

  
  

}
