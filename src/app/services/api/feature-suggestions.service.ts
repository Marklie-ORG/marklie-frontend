import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';

export interface FeatureSuggestionDto {
	uuid: string;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	user: { uuid: string; firstName?: string; lastName?: string; email: string };
	organizationUuid: string;
	upvotes: number;
	userHasUpvoted: boolean;
	commentsCount: number;
}

export interface FeatureCommentDto {
	uuid: string;
	comment: string;
	createdAt: string;
	user: { uuid: string; firstName?: string; lastName?: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class FeatureSuggestionsService {
	private readonly apiUrl = `${environment.apiUrl}/feature-suggestions`;

	constructor(private http: HttpClient) {}

	async list(): Promise<FeatureSuggestionDto[]> {
		return firstValueFrom(this.http.get<FeatureSuggestionDto[]>(`${this.apiUrl}/`));
	}

	async getOne(uuid: string): Promise<FeatureSuggestionDto> {
		return firstValueFrom(this.http.get<FeatureSuggestionDto>(`${this.apiUrl}/${uuid}`));
	}

	async create(title: string, description: string) {
		return firstValueFrom(this.http.post<{ uuid: string; message: string }>(`${this.apiUrl}/`, { title, description }));
	}

	async toggleUpvote(suggestionUuid: string) {
		return firstValueFrom(this.http.post<{ upvoted: boolean }>(`${this.apiUrl}/upvote`, { suggestionUuid }));
	}

	async getComments(suggestionUuid: string) {
		return firstValueFrom(this.http.get<FeatureCommentDto[]>(`${this.apiUrl}/${suggestionUuid}/comments`));
	}

	async addComment(suggestionUuid: string, comment: string) {
		return firstValueFrom(this.http.post<{ uuid: string; message: string }>(`${this.apiUrl}/comment`, { suggestionUuid, comment }));
	}
} 