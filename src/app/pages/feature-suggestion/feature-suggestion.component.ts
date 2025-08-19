import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeatureSuggestionsService, FeatureSuggestionDto, FeatureCommentDto } from '@services/api/feature-suggestions.service';
import { faChevronUp, faCommentDots } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-feature-suggestion',
	templateUrl: './feature-suggestion.component.html',
	styleUrls: ['./feature-suggestion.component.scss']
})
export class FeatureSuggestionComponent implements OnInit {
	faChevronUp = faChevronUp;
	faCommentDots = faCommentDots;

	suggestion = signal<FeatureSuggestionDto | null>(null);
	comments = signal<FeatureCommentDto[]>([]);
	loading = signal(true);
	commentDraft = signal('');

	constructor(private route: ActivatedRoute, private service: FeatureSuggestionsService) {}

	async ngOnInit() {
		const uuid = this.route.snapshot.paramMap.get('uuid')!;
		await this.load(uuid);
	}

	private async load(uuid: string) {
		this.loading.set(true);
		try {
			const [s, c] = await Promise.all([
				this.service.getOne(uuid),
				this.service.getComments(uuid)
			]);
			this.suggestion.set(s);
			this.comments.set(c);
		} finally {
			this.loading.set(false);
		}
	}

	async toggleUpvote() {
		const s = this.suggestion();
		if (!s) return;
		const res = await this.service.toggleUpvote(s.uuid);
		this.suggestion.set({ ...s, upvotes: s.upvotes + (res.upvoted ? 1 : -1), userHasUpvoted: res.upvoted });
	}

	async addComment() {
		const s = this.suggestion();
		const text = this.commentDraft().trim();
		if (!s || !text) return;
		await this.service.addComment(s.uuid, text);
		this.commentDraft.set('');
		await this.load(s.uuid);
	}
} 