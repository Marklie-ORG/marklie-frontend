import { Component, effect, inject, input, model, signal } from '@angular/core';
import { AdAccountsService, Business, AdAccount } from 'src/app/services/api/ad-accounts.service';

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

  facebookAdAccounts = model<FacebookAdAccount[]>([]);
  // FacebookAdAccount

  constructor() {
    effect(() => {
      const accounts = this.facebookAdAccounts();
      this.selectedAdAccounts = accounts.reduce((acc, account) => {
        acc[account.adAccountId] = true;
        return acc;
      }, {} as { [key: string]: boolean });

      // Keep selected business in sync with current accounts
      this.selectedBusinessId = accounts.length > 0 ? accounts[0].businessId : null;
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

  toggleAdAccount(event: Event, account: AdAccount) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedAdAccounts[account.id] = checkbox.checked;
    this.selectedBusinessId = account.business.id;

    let currentAccounts = this.getCurrentFacebookAdAccounts();

    if (checkbox.checked) {
      const newAccount: FacebookAdAccount = {
        adAccountId: account.id,
        adAccountName: account.name,
        businessId: account.business.id
      };
      this.facebookAdAccounts.set([...currentAccounts, newAccount]);
    } else {
      this.facebookAdAccounts.set(
        currentAccounts.filter(a => a.adAccountId !== account.id)
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
