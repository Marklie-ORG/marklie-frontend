import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly apiUrl = `${environment.apiUrl}/onboarding`;

  constructor(private http: HttpClient) {}

  async saveAnswer(question: string, answer: string) {
    return firstValueFrom(
      this.http.post<{
        message: string;
      }>(`${this.apiUrl}/answer`, {
        question: question,
        answer: answer
      })
    );
  }
}
