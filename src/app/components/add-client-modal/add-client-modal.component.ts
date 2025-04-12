import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService, Root2 } from '../../services/api/ad-accounts.service';

@Component({
  selector: 'app-add-client-modal',
  templateUrl: './add-client-modal.component.html',
  styleUrls: ['./add-client-modal.component.scss']
})
export class AddClientModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() addClient = new EventEmitter<any>();

  clientForm: FormGroup;
  platforms = ['Facebook', 'TikTok'];
  businesses: Root2[] = [];
  selectedAdAccounts: { [key: string]: boolean } = {};
  selectedBusiness: Root2 | null = null;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      platforms: [[], Validators.required],
      adAccounts: [[], Validators.required]
    });
  }

  async ngOnInit() {
    try {
      this.businesses = await this.reportService.getBusinesses();
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.addClient.emit(this.clientForm.value);
      this.close.emit();
    }
  }

  onClose() {
    this.close.emit();
  }

  togglePlatform(event: Event, platform: string) {
    const checkbox = event.target as HTMLInputElement;
    const currentPlatforms = this.clientForm.get('platforms')?.value as string[] || [];
    
    if (checkbox.checked) {
      this.clientForm.get('platforms')?.setValue([...currentPlatforms, platform]);
    } else {
      this.clientForm.get('platforms')?.setValue(
        currentPlatforms.filter(p => p !== platform)
      );
    }
  }

  toggleAdAccount(event: Event, accountId: string, accountName: string) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedAdAccounts[accountId] = checkbox.checked;
    
    const currentAccounts = this.clientForm.get('adAccounts')?.value as string[] || [];
    if (checkbox.checked) {
      this.clientForm.get('adAccounts')?.setValue([...currentAccounts, accountId]);
    } else {
      this.clientForm.get('adAccounts')?.setValue(
        currentAccounts.filter(id => id !== accountId)
      );
    }
  }

  isAdAccountSelected(accountId: string): boolean {
    return this.selectedAdAccounts[accountId] || false;
  }

  selectBusiness(business: Root2) {
    this.selectedBusiness = business;
  }
} 