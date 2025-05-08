import {Injectable} from '@angular/core';
import {environment} from '@env/environment.js';


@Injectable({
  providedIn: 'root'
})
export class FacebookLoginService {

    connectFacebook() {
        const appId = '1187569946099353';
        const redirectUri = environment.facebookLoginCallbackUrl;
        const scope = 'ads_management,ads_read,business_management,instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,read_insights';

        window.location.href = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}`;
    }
}
