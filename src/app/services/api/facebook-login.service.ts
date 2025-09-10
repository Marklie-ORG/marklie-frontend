import {Injectable} from '@angular/core';
import {environment} from '@env/environment.js';


@Injectable({
  providedIn: 'root'
})
export class FacebookLoginService {

    connectFacebook() {
        const appId = '1042744144657355';
        const redirectUri = environment.facebookLoginCallbackUrl;
        const scope = 'ads_read,business_management,public_profile';

        window.location.href = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}`;
    }
}
