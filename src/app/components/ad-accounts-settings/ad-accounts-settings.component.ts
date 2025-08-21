import { Component, effect, inject, Input, input, model, signal } from '@angular/core';
import { AdAccountsService, Business, AdAccount } from 'src/app/services/api/ad-accounts.service';
import { NotificationService } from 'src/app/services/notification.service';

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
  @Input() fixedSelectedBusinessId: string | null = null;
  selectedBusiness: Business | null = null;
  selectedAdAccounts: { [key: string]: boolean } = {};
    
  adAccountsService = inject(AdAccountsService);
  notificationService = inject(NotificationService);

  facebookAdAccounts = model<FacebookAdAccount[]>([]);

  constructor() {
    effect(() => {
      const accounts = this.facebookAdAccounts();
      this.selectedAdAccounts = accounts.reduce((acc, account) => {
        acc[account.adAccountId] = true;
        return acc;
      }, {} as { [key: string]: boolean });

      // Keep selected business in sync with current accounts
      if (this.fixedSelectedBusinessId) {
        this.selectedBusinessId = this.fixedSelectedBusinessId;
      }
      else {
        this.selectedBusinessId = accounts.length > 0 ? accounts[0].businessId : null;
      }
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

  private isLastSelectedAccount(accountId: string): boolean {
    const currentAccounts = this.getCurrentFacebookAdAccounts();
    return currentAccounts.length === 1 && currentAccounts[0].adAccountId === accountId;
  }

  isCheckboxDisabled(account: AdAccount): boolean {
    if (!account.business) {
      return true;
    }
    if (this.isAdAccountDisabled(account.business.id)) {
      return true;
    }
    if (this.fixedSelectedBusinessId && this.isLastSelectedAccount(account.id)) {
      return true;
    }
    return false;
  }

  isAdAccountSelected(accountId: string): boolean {
    return this.selectedAdAccounts[accountId] || false;
  }

  private updateAccountSelection(account: AdAccount, checked: boolean): boolean {
    const currentAccounts = this.getCurrentFacebookAdAccounts();

    if (this.fixedSelectedBusinessId && !checked && currentAccounts.length <= 1) {
      this.notificationService.info('At least one ad account has to be selected');
      return false;
    }

    this.selectedAdAccounts[account.id] = checked;
    this.selectedBusinessId = account.business.id;

    if (checked) {
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

    const updatedAccounts = this.getCurrentFacebookAdAccounts();

    if (!this.fixedSelectedBusinessId && updatedAccounts.length === 0) {
      this.selectedBusinessId = null;
    }

    return true;
  }

  toggleAdAccount(event: Event, account: AdAccount) {
    const checkbox = event.target as HTMLInputElement;
    const ok = this.updateAccountSelection(account, checkbox.checked);
    if (!ok) {
      checkbox.checked = true;
    }
  }

  onAccountOptionClick(account: AdAccount, event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'label') {
      return;
    }
    if (!account.business) {
      return;
    }
    if (this.isCheckboxDisabled(account)) {
      this.disabledAdAccountAlert(account);
      return;
    }
    const newChecked = !this.isAdAccountSelected(account.id);
    this.updateAccountSelection(account, newChecked);
  }

  disabledAdAccountAlert(account: AdAccount) {
    if (!account.business) {
      return;
    }
    // Reason 1: disabled due to different business selection
    if (this.isAdAccountDisabled(account.business.id)) {
      this.notificationService.info('Please select ad accounts that are associated with the selected business');
      return;
    }
    // Reason 2: disabled because it is the last selected account while fixedSelectedBusinessId is set
    if (this.fixedSelectedBusinessId && this.isLastSelectedAccount(account.id)) {
      this.notificationService.info('At least one ad account has to be selected');
    }
  }

  getCurrentFacebookAdAccounts() {
    return this.facebookAdAccounts() || [];
  }

}
