import { Component, OnInit, signal, computed } from '@angular/core';
import { FeatureSuggestionsService, FeatureSuggestionDto, FeatureCommentDto } from '@services/api/feature-suggestions.service';
import { faThumbsUp, faCommentDots, faPlus, faSortAmountDown, faClock, faFire, faChevronUp } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-suggested-features',
	templateUrl: './suggested-features.component.html',
	styleUrls: ['./suggested-features.component.scss']
})
export class SuggestedFeaturesComponent implements OnInit {
	suggestions = signal<FeatureSuggestionDto[]>([]);
	title = signal('');
	description = signal('');
	loading = signal(false);
	commentsMap = new Map<string, FeatureCommentDto[]>();
	commentDraft = new Map<string, string>();

	query = signal('');
	sortBy = signal<'new' | 'top'>('top');

	filtered = computed(() => {
		const q = this.query().toLowerCase().trim();
		let list = this.suggestions();
		if (q) {
			list = list.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
		}
		if (this.sortBy() === 'top') {
			list = [...list].sort((a, b) => b.upvotes - a.upvotes || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
		} else {
			list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
		return list;
	});

	// icons
	faThumbsUp = faThumbsUp;
	faCommentDots = faCommentDots;
	faPlus = faPlus;
	faSortAmountDown = faSortAmountDown;
	faClock = faClock;
	faFire = faFire;
	faChevronUp = faChevronUp;

	constructor(private service: FeatureSuggestionsService) {}

	async ngOnInit() {
		await this.refresh();
	}

	async refresh() {
		this.loading.set(true);
		try {
			const list = await this.service.list();
			this.suggestions.set(list);
		} finally {
			this.loading.set(false);
		}
	}

	async create() {
		if (!this.title().trim() || !this.description().trim()) return;
		await this.service.create(this.title(), this.description());
		this.title.set('');
		this.description.set('');
		await this.refresh();
	}

	async toggleUpvote(s: FeatureSuggestionDto) {
		const res = await this.service.toggleUpvote(s.uuid);
		const updated = this.suggestions().map(it => it.uuid === s.uuid ? {
			...it,
			upvotes: it.upvotes + (res.upvoted ? 1 : -1),
			userHasUpvoted: res.upvoted
		} : it);
		this.suggestions.set(updated);
	}

	async loadComments(s: FeatureSuggestionDto) {
		if (this.commentsMap.has(s.uuid)) return;
		const comments = await this.service.getComments(s.uuid);
		this.commentsMap.set(s.uuid, comments);
	}

	isCommentsLoaded(uuid: string) {
		return this.commentsMap.has(uuid);
	}

	getDraft(s: FeatureSuggestionDto) {
		return this.commentDraft.get(s.uuid) || '';
	}

	setDraft(s: FeatureSuggestionDto, value: string) {
		this.commentDraft.set(s.uuid, value);
	}

	async addComment(s: FeatureSuggestionDto) {
		const draft = (this.commentDraft.get(s.uuid) || '').trim();
		if (!draft) return;
		await this.service.addComment(s.uuid, draft);
		this.commentDraft.set(s.uuid, '');
		this.commentsMap.delete(s.uuid);
		await this.loadComments(s);
		const updated = this.suggestions().map(it => it.uuid === s.uuid ? { ...it, commentsCount: it.commentsCount + 1 } : it);
		this.suggestions.set(updated);
	}
} 