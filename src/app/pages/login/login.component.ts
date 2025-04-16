import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import Facebook from "facebook-js-sdk";
declare var FB: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(
    private router: Router
  ) {}

  ngOnInit(){
  }

  fbLogin() {
    const appId = '1187569946099353';
    const redirectUri = 'https://derevian.co/saas/fb-login-callback';
    // const redirectUri = 'http://localhost:4200/fb-login-callback';
    const scope = 'ads_management,ads_read,business_management,catalog_management,commerce_account_manage_orders,commerce_account_read_orders,commerce_account_read_reports,commerce_account_read_settings,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_events,instagram_manage_insights,instagram_manage_messages,instagram_shopping_tag_products,leads_retrieval,manage_fundraisers,page_events,pages_manage_ads,pages_show_list,pages_manage_cta,pages_manage_engagement,pages_manage_instant_articles,pages_manage_metadata,pages_manage_posts,pages_messaging,pages_read_engagement,pages_read_user_content,publish_video,read_insights,read_page_mailboxes,whatsapp_business_manage_events,whatsapp_business_management,whatsapp_business_messaging';

    const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    // Redirect to Facebook login dialog
    window.location.href = authUrl;
  }

  signInWithFacebook() {
    
    FB.init({
      appId: '1187569946099353', // Replace with your App ID
      cookie: true,
      xfbml: true,
      version: 'v22.0' // Ensure to use the latest version
    });

    FB.AppEvents.logPageView();

    FB.getLoginStatus(function(response: any) {
      console.log(response);
    });

    FB.login((response:any) => {
      console.log(response);
      this.getFacebookUserProfile();
    }, {
      config_id: "948776370752030",
      scope: 'ads_management'
      // scope: 'read_insights'
      // ,pages_show_list,ads_management,ads_read,business_management,instagram_basic,instagram_manage_insights,pages_read_engagement,instagram_branded_content_brand,instagram_branded_content_ads_brand
    });
  }

  getFacebookUserProfile() {
    FB.api('/me', { fields: 'name,email,picture' }, (response: any) => {
      console.log('User Profile:', response);
      localStorage.setItem('userAvatar', response.picture.data.url);
      localStorage.setItem('userName', response.name);
      this.router.navigate(['/home']);
    });
  }

}
