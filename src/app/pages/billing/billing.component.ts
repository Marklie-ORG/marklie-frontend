import { Component, OnInit, signal } from '@angular/core';
import { faCheck, faChevronDown, faCircleInfo, faClock, faCreditCard, faDownload, faStar } from '@fortawesome/free-solid-svg-icons';

interface PlanFeature {
	text: string;
}

interface PlanCard {
	id: 'start' | 'plus' | 'growth' | 'business';
	title: string;
	priceMonthly?: number; // undefined for custom
	priceYearly?: number;
	isMostPopular?: boolean;
	features: PlanFeature[];
}

interface InvoiceRow {
	id: string;
	name: string;
	date: string; // e.g., '12 Jul 2025'
	plan: string; // e.g., 'Plus plan'
	amount: string; // e.g., 'USD $59.00'
	canDownload?: boolean;
}

@Component({
	selector: 'app-billing',
	templateUrl: './billing.component.html',
	styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {
	period = signal<'monthly' | 'yearly'>('yearly');
	currentPlanId = signal<PlanCard['id']>('plus');
	renewalDateLabel = signal('Next renewal date 12 Aug');

	plans = signal<PlanCard[]>([
		{
			id: 'start',
			title: 'Start plan',
			priceMonthly: 49,
			priceYearly: 39,
			features: [
				{ text: '1-4 clients' },
				{ text: '1 team member' },
				{ text: 'Report customization' },
				{ text: 'Loom integration' },
				{ text: 'AI notes' },
			],
		},
		{
			id: 'plus',
			title: 'Plus plan',
			priceMonthly: 99,
			priceYearly: 79,
			features: [
				{ text: '5-9 clients' },
				{ text: '5 team members' },
				{ text: 'Report customization' },
				{ text: 'Loom integration' },
				{ text: 'AI notes' },
			],
		},
		{
			id: 'growth',
			title: 'Growth plan',
			priceMonthly: 149,
			priceYearly: 119,
			isMostPopular: true,
			features: [
				{ text: '10-20 clients' },
				{ text: '20 team members' },
				{ text: 'Report customization' },
				{ text: 'Loom integration' },
				{ text: 'AI notes' },
			],
		},
		{
			id: 'business',
			title: 'Business plan',
			priceMonthly: undefined,
			priceYearly: undefined,
			features: [
				{ text: '20+ clients' },
				{ text: '20+ team members' },
				{ text: 'Report customization' },
				{ text: 'Loom integration' },
				{ text: 'AI notes' },
			],
		},
	]);

	invoices = signal<InvoiceRow[]>([
		{ id: '0012', name: 'Invoice 0012', date: '12 Jul 2025', plan: 'Plus plan', amount: 'USD $59.00', canDownload: true },
		{ id: '0011', name: 'Invoice 0011', date: '12 Jun 2025', plan: 'Plus plan', amount: 'USD $59.00', canDownload: true },
		{ id: '0010', name: 'Invoice 0010', date: '12 May 2025', plan: 'Plus plan', amount: 'USD $59.00', canDownload: true },
		{ id: '0009', name: 'Invoice 0009', date: '12 Apr 2025', plan: 'Plus plan', amount: 'USD $59.00', canDownload: true },
	]);

	ngOnInit(): void {}

	setPeriod(period: 'monthly' | 'yearly') {
		this.period.set(period);
	}

	// Icon refs for template
	protected readonly faCheck = faCheck;
	protected readonly faStar = faStar;
	protected readonly faCreditCard = faCreditCard;
	protected readonly faDownload = faDownload;
	protected readonly faCircleInfo = faCircleInfo;
	protected readonly faChevronDown = faChevronDown;
} 