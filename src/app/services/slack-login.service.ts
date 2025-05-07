import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {LocalStorageKeys, LocalStorageService} from './local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class SlackLoginService {

  constructor(private localStorageService: LocalStorageService) {}

  connectSlack(organizationClientId: string) {
    const clientId = '8822983730096.8812384257265';
    const redirectUri = environment.slackLoginCallbackUrl;
    const scopes = [
      'channels:read',
      'groups:read',
      'im:read',
      'mpim:read',
      'users:read',
      'team:read',

      'files:write',

      'channels:join',

      'chat:write',
      'chat:write.customize'
    ].join(',');

    this.saveTargetClientIdForSlackWorkspace(organizationClientId);

    window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
  }

  saveTargetClientIdForSlackWorkspace(clientId: string) {
    this.localStorageService.setItem(LocalStorageKeys.TARGET_CLIENT_ID_FOR_SLACK_WORKSPACE, clientId);
  }

  getTargetClientIdForSlackWorkspace(): string | null {
    return this.localStorageService.getItem(LocalStorageKeys.TARGET_CLIENT_ID_FOR_SLACK_WORKSPACE);
  }

  removeTargetClientIdForSlackWorkspace() {
    this.localStorageService.removeItem(LocalStorageKeys.TARGET_CLIENT_ID_FOR_SLACK_WORKSPACE);
  }
}
