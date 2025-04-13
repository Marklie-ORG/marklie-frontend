import { Component, OnInit } from '@angular/core';
import { OnboardingService } from '../../services/api/onboarding.service';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from 'src/app/services/api/user.service';
import { OrganizationService } from 'src/app/services/api/organization.service';

interface Platform {
  name: string;
  selected: boolean;
  customValue?: string;
}

interface ClientsRange {
  value: string;
  label: string;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule
  ]
})
export class OnboardingComponent implements OnInit {
  name: string = '';
  surname: string = '';
  isOwner: boolean | null = null;
  agencyName: string = '';
  clientsAmount: string = '';
  
  // Clients range options
  clientsRanges: ClientsRange[] = [
    { value: '1-5', label: '1-5' },
    { value: '6-10', label: '6-10' },
    { value: '11-15', label: '11-15' },
    { value: '>15', label: '> 15' }
  ];
  
  // Advertising platforms
  advertisingPlatforms: Platform[] = [
    { name: 'facebook', selected: false },
    { name: 'instagram', selected: false },
    { name: 'google', selected: false },
    { name: 'linkedin', selected: false }
  ];
  customAdvertisingPlatform: string = '';

  // Communication platforms
  communicationPlatforms: Platform[] = [
    { name: 'email', selected: false },
    { name: 'slack', selected: false },
    { name: 'whatsapp', selected: false }
  ];
  customCommunicationPlatform: string = '';

  howDidYouHear: string = '';
  inviteCode: string = '';

  // Step tracking
  currentStepIndex = 0;
  progress = 0;

  // Total steps for each path
  private readonly totalStepsForOwner = 7; // All steps for owner
  private readonly totalStepsForEmployee = 3; // Name, Type, Invite code

  constructor(
    private onboardingService: OnboardingService,
    private router: Router,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.updateProgress();
  }

  updateProgress() {
    let totalSteps: number;
    if (this.isOwner === null) {
      totalSteps = 7
    }
    else {
      totalSteps = this.isOwner ? this.totalStepsForOwner : this.totalStepsForEmployee;
    }
    this.progress = (this.currentStepIndex / totalSteps) * 100;
  }

  updateName() {
    if (this.name && this.surname) {
      this.userService.updateName(this.name, this.surname);
      this.nextStep();
    }
  }

  nextStep() {
    const totalSteps = this.isOwner ? this.totalStepsForOwner : this.totalStepsForEmployee;
    if (this.currentStepIndex < totalSteps - 1) {
      this.currentStepIndex++;
      this.updateProgress();
    }
  }

  previousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateProgress();
    }
  }

  async useInviteCode() {
    if (!this.inviteCode) {
      alert("Please enter an invite code");
      return;
    }
    try {
      const response = await this.organizationService.useInviteCode(this.inviteCode);
      if (response.status === 200) {
        this.nextStep();
        this.updateProgress(); // Update progress after selecting user type
        this.completeStep();
      }
      else {
        alert(response.body?.message);
      }
    }
    catch (response) {
      console.log(response)
      alert((response as any).error.message);
    }
  }

  createOrganization() {
    this.organizationService.createOrganization(this.agencyName);
    this.nextStep();
    this.updateProgress(); // Update progress after selecting user type
  }

  answerHowDidYouHear() {
    this.onboardingService.saveAnswer('howDidYouHear', this.howDidYouHear);
    this.nextStep();
    this.updateProgress(); // Update progress after selecting user type
    this.completeStep();
  }

  answerCommunicationPlatforms() {
    this.onboardingService.saveAnswer('communicationPlatforms', this.getSelectedCommunicationPlatforms().join(','));
    this.nextStep();
    this.updateProgress(); // Update progress after selecting user type
  }

  answerAdvertisingPlatforms() {
    this.onboardingService.saveAnswer('advertisingPlatforms', this.getSelectedAdvertisingPlatforms().join(','));
    this.nextStep();
    this.updateProgress(); // Update progress after selecting user type
  }

  answerClientsAmount() {
    this.onboardingService.saveAnswer('clientsAmount', this.clientsAmount);
    this.nextStep();
    this.updateProgress(); // Update progress after selecting user type
  }

  selectUserType(isOwner: boolean) {
    this.isOwner = isOwner;
    this.onboardingService.saveAnswer('isOwner', isOwner.toString());
    this.nextStep();
    this.updateProgress(); // Update progress after selecting user type
  }

  toggleAdvertisingPlatform(platform: Platform) {
    platform.selected = !platform.selected;
  }

  toggleCommunicationPlatform(platform: Platform) {
    platform.selected = !platform.selected;
  }

  getSelectedAdvertisingPlatforms(): string[] {
    const selectedPlatforms = this.advertisingPlatforms
      .filter(platform => platform.selected)
      .map(platform => platform.name);
    
    if (this.customAdvertisingPlatform) {
      selectedPlatforms.push(this.customAdvertisingPlatform);
    }
    
    return selectedPlatforms;
  }

  getSelectedCommunicationPlatforms(): string[] {
    const selectedPlatforms = this.communicationPlatforms
      .filter(platform => platform.selected)
      .map(platform => platform.name);
    
    if (this.customCommunicationPlatform) {
      selectedPlatforms.push(this.customCommunicationPlatform);
    }
    
    return selectedPlatforms;
  }

  async completeStep() {
    try {
      // Save the onboarding data
      // const onboardingData = {
      //   name: this.name,
      //   surname: this.surname,
      //   isOwner: this.isOwner,
      //   agencyName: this.agencyName,
      //   clientsAmount: this.clientsAmount,
      //   advertisingPlatforms: this.getSelectedAdvertisingPlatforms(),
      //   communicationPlatforms: this.getSelectedCommunicationPlatforms(),
      //   howDidYouHear: this.howDidYouHear,
      //   inviteCode: this.inviteCode
      // };

      // Call the onboarding service to save the data
      // await this.onboardingService.completeOnboarding(onboardingData);

      // Navigate to the dashboard or appropriate page
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Handle error appropriately
    }
  }

  get isFirstStep() {
    return this.currentStepIndex === 0;
  }

  get isLastStep() {
    const totalSteps = this.isOwner ? this.totalStepsForOwner : this.totalStepsForEmployee;
    return this.currentStepIndex === totalSteps - 1;
  }
} 