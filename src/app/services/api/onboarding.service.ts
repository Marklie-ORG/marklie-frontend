import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment.js';

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

  async getOnboardingSteps() {
    return firstValueFrom(
      this.http.get<OnboardingSteps>(`${this.apiUrl}/onboarding-steps`)
    );
  }
}

export interface OnboardingSteps {
  nameAnswered: boolean;
  isOwnerAnswered: boolean;
  organizationCreated: boolean;
  clientsAmountAnswered: boolean;
  advertisingPlatformsAnswered: boolean;
  communicationPlatformsAnswered: boolean;
  howDidYouHearAnswered: boolean;
  facebookConnected: boolean;
  onboardingFinished: boolean;
}
