import { Component, OnInit } from '@angular/core';
import { OnboardingService, OnboardingSteps } from '../../services/api/onboarding.service.js';
import { Router } from '@angular/router';
import { UserService } from '../../services/api/user.service.js';
import { OrganizationService } from '../../services/api/organization.service.js';
import { FacebookLoginService } from '../../services/api/facebook-login.service.js';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from 'src/app/services/notification.service.js';

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
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  faCheck = faCheck;

  firstName: string = '';
  lastName: string = '';
  invitationCode: string = '';

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
    { name: 'Facebook', selected: false },
    { name: 'Instagram', selected: false },
    { name: 'Google', selected: false },
    { name: 'LinkedIn', selected: false },
    { name: 'TikTok', selected: false },
    { name: 'X (Twitter)', selected: false },
    { name: 'Snapchat', selected: false },
    { name: 'YouTube', selected: false },
    { name: 'Pinterest', selected: false }
  ];
  otherAdvertisingPlatformSelected: boolean = false;
  otherAdvertisingPlatform: string = '';

  // Communication platforms
  communicationPlatforms: Platform[] = [
    { name: 'Email', selected: false },
    { name: 'Slack', selected: false },
    { name: 'Whatsapp', selected: false }
  ];
  otherCommunicationPlatformSelected: boolean = false;
  otherCommunicationPlatform: string = '';

  foundOuts: string[] = [
    'Google Ads',
    'Google Search',
    'Youtube',
    'Facebook',
    'Instagram',
    'From a friend'
  ];
  otherFoundOutSelected: boolean = false;
  otherFoundOut: string = ''; 
  foundOut: string = '';
  
  inviteCode: string = '';

  onboardingSteps: OnboardingSteps | null = null;

  isOwner = false;
  isEmployee = false;

  selected: "owner" | "employee" | null = null;

  constructor(
    private onboardingService: OnboardingService,
    private router: Router,
    private userService: UserService,
    private organizationService: OrganizationService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {

    const user = await this.userService.me();

    if (user.activeOrganization) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleFoundOut(foundOutOption: string) {
    this.otherFoundOutSelected = false;
    this.foundOut = foundOutOption;
  }

  getFoundOut() {
    if (this.otherFoundOutSelected) {
      return this.otherFoundOut;
    }
    return this.foundOut;
  }

  async finishOwnerOnboarding() {
    try {

      if (!this.firstName || !this.lastName) {
        this.notificationService.info('Please enter your name!', 4000);
        return; 
      }

      if (!this.agencyName) {
        this.notificationService.info('Please enter your agency name!', 4000);
        return;
      }

      await this.userService.updateName(this.firstName, this.lastName);
      
      await this.organizationService.createOrganization(this.agencyName);
      
      await this.onboardingService.saveAnswer('clientsAmount', this.clientsAmount);
      await this.onboardingService.saveAnswer('advertisingPlatforms', this.getSelectedAdvertisingPlatforms().join(','));
      await this.onboardingService.saveAnswer('communicationPlatforms', this.getSelectedCommunicationPlatforms().join(','));
      await this.onboardingService.saveAnswer('howDidYouHear', this.getFoundOut());
      
      this.router.navigate(['/dashboard']);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  async finishEmployeeOnboarding() {

    if (!this.firstName || !this.lastName) {
      this.notificationService.info('Please enter your name!', 4000);
      return; 
    }

    if (!this.inviteCode) {
      this.notificationService.info('Please enter an invite code', 4000);
      return;
    }

    await this.userService.updateName(this.firstName, this.lastName);

    await this.onboardingService.saveAnswer('inviteCode', this.inviteCode);

    try {
      const response = await this.organizationService.useInviteCode(this.inviteCode);
      if (response.status === 200) {
        // this.nextStep();
        // this.updateProgress(); // Update progress after selecting user type
        // this.completeStep();
      }
      else {
        this.notificationService.info('The code is invalid. Please check it again.', 4000);
        // alert(response.body?.message);
        return
      }
    }
    catch (response) {
      console.log(response)
      // alert((response as any).error.message);
      this.notificationService.info('The code is invalid. Please check it again.', 4000);
      return
    }

    this.router.navigate(['/dashboard']);
  }

  async confirmUserType() {
    
    if (this.selected === "owner") {
      this.isOwner = true;
    }
    else if (this.selected === "employee") {
      this.isEmployee = true;
    }
    else {
      this.notificationService.info('Please select the option that best describes you', 4000);
    }

    await this.onboardingService.saveAnswer('isOwner', this.isOwner.toString());

  }

  selectUserType(isOwner: boolean) {
    this.isOwner = isOwner;
    this.onboardingService.saveAnswer('isOwner', isOwner.toString());
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

    if (this.otherAdvertisingPlatformSelected) {
      selectedPlatforms.push(this.otherAdvertisingPlatform);
    }

    return selectedPlatforms;
  }

  getSelectedCommunicationPlatforms(): string[] {
    const selectedPlatforms = this.communicationPlatforms
      .filter(platform => platform.selected)
      .map(platform => platform.name);

    if (this.otherCommunicationPlatformSelected) {
      selectedPlatforms.push(this.otherCommunicationPlatform);
    }

    return selectedPlatforms;
  }

}
