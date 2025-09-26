import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {SubscriptionService} from "@services/api/subscription.service.js";

@Component({
  selector: 'app-complete',
  templateUrl: './complete.component.html',
})
export class CompleteComponent implements OnInit {
  state: 'loading' | 'ok' | 'err' = 'loading';
  status = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService
  ) {}

  async ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) {
      this.state = 'err';
      this.error = 'Missing session_id';
      return;
    }

    try {
      const res = await this.subscriptionService.finalize(sessionId);
      this.status = "";
      this.state = 'ok';
    } catch (e: any) {
      this.state = 'err';
      this.error = e?.error?.message || e?.message || 'Failed to finalize';
    }
  }
}
