import { Component, effect, inject, input, model, signal } from '@angular/core';
import { AdAccountsService, Business } from 'src/app/services/api/ad-accounts.service';

export interface FacebookAdAccount {
  adAccountId: string;
  adAccountName: string;
  businessId: string;
}

@Component({
  selector: 'ad-accounts-settings',
  templateUrl: './ad-accounts-settings.component.html',
  styleUrl: './ad-accounts-settings.component.scss'
})
export class AdAccountsSettingsComponent {

  isLoading = true;
  businesses: Business[] = [];
  selectedBusinessId: string | null = null;
  selectedBusiness: Business | null = null;
  selectedAdAccounts: { [key: string]: boolean } = {};
    
  adAccountsService = inject(AdAccountsService);

  facebookAdAccounts = model<string[]>([]);
  // FacebookAdAccount

  constructor() {
    effect(() => {
      this.selectedAdAccounts = this.facebookAdAccounts().reduce((acc, account) => {
        acc[account] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      console.log(this.facebookAdAccounts())
    })
  }

  async ngOnInit() {
    this.businesses = await this.adAccountsService.getBusinessesHierarchy();
    this.isLoading = false;
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

  selectBusiness(business: Business) {
    this.selectedBusiness = business;
  }

  isAdAccountDisabled(accountBusinessId: string): boolean {
    return Boolean(this.selectedBusinessId && this.selectedBusinessId !== accountBusinessId);
  }

  isAdAccountSelected(accountId: string): boolean {
    return this.selectedAdAccounts[accountId] || false;
  }

  toggleAdAccount(event: Event, accountId: string, accountBusinessId: string) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedAdAccounts[accountId] = checkbox.checked;
    this.selectedBusinessId = accountBusinessId;

    let currentAccounts = this.getCurrentFacebookAdAccounts();

    if (checkbox.checked) {
      this.facebookAdAccounts.set([...currentAccounts, accountId]);
    } else {
      this.facebookAdAccounts.set(
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

  getCurrentFacebookAdAccounts() {
    return this.facebookAdAccounts() || [];
  }

}
