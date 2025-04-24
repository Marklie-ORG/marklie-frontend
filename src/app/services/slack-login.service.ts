import { Injectable } from '@angular/core';
import { environment } from '@env/environment';


@Injectable({
  providedIn: 'root'
})
export class SlackLoginService {

    connectSlack() {
        const clientId = '8822983730096.8812384257265';
        const redirectUri = environment.slackLoginCallbackUrl;
        const scopes = 'chat:write';
    
        const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
        
        window.location.href = authUrl;
    }
} 