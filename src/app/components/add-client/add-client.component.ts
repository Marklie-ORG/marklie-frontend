import { MatDialogRef } from '@angular/material/dialog';
import { ClientService } from 'src/app/services/api/client.service';
import { Component, EventEmitter, Output, OnInit, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AdAccount, AdAccountsService, Root2} from "../../services/api/ad-accounts.service.js";

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.scss',
})
export class AddClientComponent {
  @Output() close = new EventEmitter<void>();
  @Output() addClient = new EventEmitter<any>();

  clientForm: FormGroup;
  platforms = ['Facebook', 'TikTok'];
  businesses: Root2[] = [];
  uniqueAdAccounts: AdAccount[] = [];
  selectedAdAccounts: { [key: string]: boolean } = {};
  selectedBusiness: Root2 | null = null;
  isLoading = true;

  selectedBusinessId: string | null = null;

  emails = signal<string[]>([]);
  phoneNumbers = signal<string[]>([]);

  constructor(
    private fb: FormBuilder,
    private adAccountsService: AdAccountsService,
    public dialogRef: MatDialogRef<AddClientComponent>,
    private clientService: ClientService
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      // platforms: [[], Validators.required],
      facebookAdAccounts: [[], Validators.required],
      // tiktokAdAccounts: [[], Validators.required]
    });

    effect(() => {
      console.log(this.emails())
      console.log(this.phoneNumbers())
    })
    
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      this.businesses = await this.adAccountsService.getBusinessesHierarchy();
      const adAccounts = this.businesses.map(business => business.ad_accounts);
      const flattenedAdAccounts = adAccounts.flat();
      this.uniqueAdAccounts = [...new Map(flattenedAdAccounts.map(account => [account.id, account])).values()];
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.clientForm.valid) {
      console.log(this.clientForm.value);
      await this.clientService.createClient({...this.clientForm.value, emails: this.emails(), phoneNumbers: this.phoneNumbers()});
      this.dialogRef.close();
    }
  }

  // togglePlatform(event: Event, platform: string) {
  //   const checkbox = event.target as HTMLInputElement;
  //   const currentPlatforms = this.clientForm.get('platforms')?.value as string[] || [];

  //   if (checkbox.checked) {
  //     this.clientForm.get('platforms')?.setValue([...currentPlatforms, platform]);
  //   } else {
  //     this.clientForm.get('platforms')?.setValue(
  //       currentPlatforms.filter(p => p !== platform)
  //     );
  //   }
  // }

  toggleAdAccount(event: Event, accountId: string, accountBusinessId: string) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedAdAccounts[accountId] = checkbox.checked;
    this.selectedBusinessId = accountBusinessId;

    let currentAccounts = this.getCurrentFacebookAdAccounts();

    if (checkbox.checked) {
      this.clientForm.get('facebookAdAccounts')?.setValue([...currentAccounts, accountId]);
    } else {
      this.clientForm.get('facebookAdAccounts')?.setValue(
        currentAccounts.filter(id => id !== accountId)
      );
    }

    currentAccounts = this.getCurrentFacebookAdAccounts();

    if (currentAccounts.length === 0) {
      this.selectedBusinessId = null;
    }

  }

  disabledAdAccountAlert(accountBusinessId: string) {
    if (this.isAdAccountDisabled(accountBusinessId)) {
      alert('You cannot select an ad account that is not associated with the selected business');
    }
  }

  isBusinessDisabled(businessId: string): boolean {
    if (!this.selectedBusinessId) {
      return false;
    }
    const businessAdAccounts = this.businesses.find(business => business.id === businessId)!.ad_accounts;
    let businessDisabled = true;
    for (let businessAdAccount of businessAdAccounts) {
      if (businessAdAccount.business?.id === this.selectedBusinessId) {
        businessDisabled = false;
      }
    }
    return businessDisabled;
  }

  getCurrentFacebookAdAccounts() {
    return this.clientForm.get('facebookAdAccounts')?.value as string[] || [];
  }

  isAdAccountSelected(accountId: string): boolean {
    return this.selectedAdAccounts[accountId] || false;
  }

  isAdAccountDisabled(accountBusinessId: string): boolean {
    return Boolean(this.selectedBusinessId && this.selectedBusinessId !== accountBusinessId);
  }

  selectBusiness(business: Root2) {
    this.selectedBusiness = business;
  }

}
