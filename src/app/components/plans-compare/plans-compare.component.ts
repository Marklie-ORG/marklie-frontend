import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SubscriptionPlan } from '../../pages/billing/billing.interfaces';

@Component({
  selector: 'app-plans-compare',
  templateUrl: './plans-compare.component.html',
  styleUrl: './plans-compare.component.scss',
})
export class PlansCompareComponent {
  @Input() plans: SubscriptionPlan[] = [];
  @Input() currentPlanId: string | null = null;
  @Output() selectPlan = new EventEmitter<string>();

  isCustom(plan: SubscriptionPlan): boolean { return plan.price === 0; }
  isCurrent(plan: SubscriptionPlan): boolean { return this.currentPlanId === plan.id; }

  getActionLabel(plan: SubscriptionPlan): string {
    const current = this.plans.find(p => p.id === this.currentPlanId) || null;
    if (!current) return plan.price === 0 ? 'Contact Sales' : 'Upgrade';
    if (plan.price === 0) return 'Contact Sales';
    if (plan.id === current.id) return 'Current';
    return plan.price < current.price ? 'Downgrade' : 'Upgrade';
  }

  canChangeTo(plan: SubscriptionPlan): boolean {
    const current = this.plans.find(p => p.id === this.currentPlanId) || null;
    if (!current) return plan.price > 0;
    if (plan.id === current.id) return false;
    return plan.price > 0;
  }

  clientRange(plan: SubscriptionPlan): string {
    const { min, max } = plan.limits.clients;
    return `${min}-${max >= 999999 ? '∞' : max} clients`;
  }

  teamRange(plan: SubscriptionPlan): string {
    const { min, max } = plan.limits.teamMembers;
    return `${min}-${max >= 999999 ? '∞' : max} team members`;
  }

  refreshLabel(plan: SubscriptionPlan): string {
    if (plan.dataRefreshHours === 0) return 'Data refresh: up to a minute';
    if (plan.dataRefreshHours === 1) return 'Data refresh: hourly';
    return `Data refresh: every ${plan.dataRefreshHours}h`;
  }
}


