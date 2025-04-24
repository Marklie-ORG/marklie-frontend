import { Injectable } from '@angular/core';
import { environment } from '@env/environment';


@Injectable({
  providedIn: 'root'
})
export class FacebookLoginService {

    connectFacebook() {
        const appId = '1187569946099353';
        const redirectUri = environment.facebookLoginCallbackUrl;
        // const redirectUri = 'http://192.168.89.185:4200/fb-login-callback';
        // const redirectUri = 'http://localhost:4200/fb-login-callback';
        const scope = 'ads_management,ads_read,business_management,catalog_management,commerce_account_manage_orders,commerce_account_read_orders,commerce_account_read_reports,commerce_account_read_settings,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_events,instagram_manage_insights,instagram_manage_messages,instagram_shopping_tag_products,leads_retrieval,manage_fundraisers,page_events,pages_manage_ads,pages_show_list,pages_manage_cta,pages_manage_engagement,pages_manage_instant_articles,pages_manage_metadata,pages_manage_posts,pages_messaging,pages_read_engagement,pages_read_user_content,publish_video,read_insights,read_page_mailboxes,whatsapp_business_manage_events,whatsapp_business_management,whatsapp_business_messaging';
    
        const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}`;
        
        // Open Facebook login dialog in a new tab
        // window.open(authUrl, '_blank');
        window.location.href = authUrl;
    }
} 