import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { SubscriptionService } from '@services/api/subscription.service';

type Proration = 'create_prorations' | 'none';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private subscriptionService = inject(SubscriptionService);
  private route = inject(ActivatedRoute);

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentEl: StripePaymentElement | null = null;

  // plan & current sub context
  plan: any = null;
  hasActive = false;
  currentPlanId: string | null = null;

  // ui
  ready = false;
  submitting = false;
  success = false;
  email = '';
  cardError: string | null = null;
  notice: string | null = null;
  proration: Proration = 'create_prorations';

  private setupClientSecret: string | null = null;

  private router = inject(Router);

  async ngOnInit() {
    // 1) chosen plan
    const planId = this.route.snapshot.queryParamMap.get('planId');
    const plans = await this.subscriptionService.getPlans();         // { plans: [...] }
    this.plan = plans.find((p: any) => p.id === planId) ?? plans[0];

    // 2) current subscription context
    const current = await this.subscriptionService.getCurrent();        // { hasActiveSubscription, subscription? }
    this.hasActive = !!current?.hasActiveSubscription;
    this.currentPlanId = current?.subscription?.plan?.id ?? null;

    // 3) load Stripe + SetupIntent
    this.stripe = await loadStripe('pk_test_51RGHSSPopkXwk2s92AhBG4FluoDJcEND3pGR4rpc81vQ1uYtVCNS3j72BCg85nSxUl9ec2LUWm0SzLxt04f8PLpg00QIjGnn2Q');
    const si = await this.subscriptionService.createSetupIntent();      // { clientSecret }
    this.setupClientSecret = si.clientSecret;

    // 4) Payment Element (email-only—no extra Stripe contact fields)
    this.elements = this.stripe!.elements({ clientSecret: this.setupClientSecret });
    this.paymentEl = this.elements.create('payment', {
      layout: { type: 'tabs' },
      defaultValues: { billingDetails: { email: this.email || undefined } },
    });
    this.paymentEl.mount('#payment-element');

    this.ready = true;
  }

  ngOnDestroy() {
    try { this.paymentEl?.unmount(); } catch {}
  }

  // Optional: call from a toggle/select in your template if desired
  setProration(p: Proration) { this.proration = p; }

  async onSubmit() {
    if (!this.stripe || !this.elements || !this.plan || !this.setupClientSecret) return;

    this.submitting = true;
    this.cardError = null;
    this.notice = null;

    try {
      // 1) Validate + submit Payment Element (required before confirm)
      const { error: submitError } = await this.elements.submit();
      if (submitError) {
        this.cardError = submitError.message || 'Validation failed';
        this.submitting = false;
        return;
      }

      // 2) Confirm SetupIntent (saves/updates default PM for customer)
      const { setupIntent, error } = await this.stripe.confirmSetup({
        elements: this.elements,
        clientSecret: this.setupClientSecret,
        confirmParams: {
          payment_method_data: { billing_details: { email: this.email || undefined } },
        },
        redirect: 'if_required',
      });

      if (error) {
        this.cardError = error.message || 'Card confirmation failed';
        this.submitting = false;
        return;
      }

      const paymentMethodId = setupIntent?.payment_method as string | undefined;

      // 3) Act based on current subscription state
      if (!this.hasActive) {
        // New subscription
        await this.subscriptionService.subscribe({
          planId: this.plan.id,
          paymentMethodId, // collected above
        });
        this.success = true;
        this.notice = 'Subscription created successfully.';
        return;
      }

      // Already subscribed: if plan is different, update (upgrade/downgrade)
      if (this.currentPlanId !== this.plan.id) {
        await this.subscriptionService.update({
          planId: this.plan.id,
          prorationBehavior: this.proration,
        });
        this.success = true;
        this.notice = 'Subscription updated successfully.';
      } else {
        // Same plan — just saved/updated the payment method
        this.success = true;
        this.notice = 'Payment method updated.';
      }

      if (this.success) {
        this.router.navigate(['/complete'], { queryParams: { session_id: setupIntent?.id } });
      }

    } catch (e: any) {
      this.cardError = e?.error?.message || e?.message || 'Something went wrong';
    } finally {
      this.submitting = false;
    }
  }
}
