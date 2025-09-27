import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  faCheck, faChevronDown, faCircleInfo, faClock, faCreditCard, faDownload, faStar
} from '@fortawesome/free-solid-svg-icons';
import { SubscriptionService } from '@services/api/subscription.service';
import { SubscriptionPlan, InvoiceRow, SubscriptionResponse } from './billing.interfaces';


@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss',
})
export class BillingComponent implements OnInit {
  private subs = inject(SubscriptionService);
  private router = inject(Router);

  period = signal<'monthly' | 'yearly'>('monthly');

  currentPlanId = signal<string | null>(null);
  currentSubId  = signal<string | null>(null);
  cancelAtPeriodEnd = signal<boolean>(false);
  renewalDateLabel = signal('Next renewal date —');

  cancellingNow = signal(false);
  cancellingLater = signal(false);
  resuming = signal(false);

  plans = signal<SubscriptionPlan[]>([]);
  invoices = signal<InvoiceRow[]>([]);

  loadingPlans = signal(false);
  loadingCancel = signal(false);
  plansError = signal<string | null>(null);

  async ngOnInit() { await this.loadPlansAndCurrent(); }

  setPeriod(p: 'monthly' | 'yearly') { this.period.set(p); }

  private fmtDate(dt: number | string): string {
    const d = typeof dt === 'number' ? new Date(dt) : new Date(Date.parse(dt));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private async loadPlansAndCurrent() {
    try {
      this.loadingPlans.set(true);
      this.plansError.set(null);

      const res = await this.subs.getPlans(); // { plans: SubscriptionPlan[] }
      const list: SubscriptionPlan[] = (res as any).plans ?? res ?? [];
      const business = list.filter(p => /business/i.test(p.name) || (p.tier === 'enterprise' && p.price === 0));
      const others   = list.filter(p => !business.includes(p));
      this.plans.set([...others, ...business]);

      const current = await this.subs.getCurrent() as SubscriptionResponse;
      if (current?.hasActiveSubscription && current.subscription) {
        this.currentSubId.set(current.subscription.id);
        this.currentPlanId.set(current.subscription.plan.id);
        this.cancelAtPeriodEnd.set(!!current.subscription.cancelAtPeriodEnd);

        const endRaw = current.subscription.currentPeriodEnd;
        if (endRaw) {
          const formatted = this.fmtDate(endRaw);
          this.renewalDateLabel.set(this.cancelAtPeriodEnd()
            ? `Ends on — ${formatted}`
            : `Next renewal date — ${formatted}`);
        } else {
          this.renewalDateLabel.set(this.cancelAtPeriodEnd() ? 'Scheduled to end — N/A' : 'Next renewal date — N/A');
        }
      } else {
        this.currentSubId.set(null);
        this.currentPlanId.set(null);
        this.cancelAtPeriodEnd.set(false);
        this.renewalDateLabel.set('Next renewal date — N/A');
      }
    } catch (e: any) {
      this.plansError.set(e?.error?.message || e?.message || 'Failed to load plans');
      this.plans.set([]);
    } finally {
      this.loadingPlans.set(false);
    }
  }

  // Navigation
  goToCheckout(planId: string) { this.router.navigate(['/checkout'], { queryParams: { planId } }); }

  // Cancellation
  async cancelAtEnd() {
    try {
      this.cancellingLater.set(true);
      await this.subs.cancel({ immediately: false });
      await this.loadPlansAndCurrent();
    } finally { this.cancellingLater.set(false); }
  }

  async cancelNow() {
    try {
      this.cancellingNow.set(true);
      await this.subs.cancel({ immediately: true });
      await this.loadPlansAndCurrent();
    } finally { this.cancellingNow.set(false); }
  }

  async resumeIfScheduled() {
    try {
      this.resuming.set(true);
      await this.subs.resume(); // implement in service if you support resume
      await this.loadPlansAndCurrent();
    } finally { this.resuming.set(false); }
  }

  // Helpers for template
  getCurrentPlan(): SubscriptionPlan | undefined {
    const id = this.currentPlanId(); if (!id) return undefined;
    return this.plans().find(p => p.id === id);
  }
  isCustom(p: SubscriptionPlan) { return p.price === 0; }
  getActionLabel(p: SubscriptionPlan): string {
    const current = this.getCurrentPlan();
    if (!current) return p.price === 0 ? 'Contact Sales' : 'Upgrade';
    if (p.price === 0) return 'Contact Sales';
    if (p.id === current.id) return 'Current';
    return p.price < current.price ? 'Downgrade' : 'Upgrade';
  }
  canChangeTo(p: SubscriptionPlan): boolean {
    const current = this.getCurrentPlan();
    if (!current) return p.price > 0;
    if (p.id === current.id) return false;
    return p.price > 0;
  }
  clientRange(p: SubscriptionPlan) {
    const { min, max } = p.limits.clients;
    return `${min}-${max >= 999999 ? '∞' : max} clients`;
  }
  teamRange(p: SubscriptionPlan) {
    const { min, max } = p.limits.teamMembers;
    return `${min}-${max >= 999999 ? '∞' : max} team members`;
  }
  refreshLabel(p: SubscriptionPlan) {
    if (p.dataRefreshHours === 0) return 'Data refresh: up to a minute';
    if (p.dataRefreshHours === 1) return 'Data refresh: hourly';
    return `Data refresh: every ${p.dataRefreshHours}h`;
  }
  isCurrent(p: SubscriptionPlan) { return this.currentPlanId() === p.id; }

  openCalendly() {
    window.open("https://calendly.com/markly-team/marklie-business-pricing-call", '_blank');
  }

  // Icons
  protected readonly faCheck = faCheck;
  protected readonly faStar = faStar;
  protected readonly faCreditCard = faCreditCard;
  protected readonly faDownload = faDownload;
  protected readonly faCircleInfo = faCircleInfo;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faClock = faClock;
}
