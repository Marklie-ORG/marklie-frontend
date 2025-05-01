import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { UserService } from '../../api/services/api/user.service';
@Component({
  selector: 'app-fb-login-callback',
  templateUrl: './fb-login-callback.component.html',
  styleUrl: './fb-login-callback.component.scss'
})
export class FbLoginCallbackComponent {

  accessToken: string = ''

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      console.log('Facebook auth code:', code);
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      const code = params['code'];
      if (code) {
        // const redirectUri = 'http://192.168.89.185:4200/fb-login-callback';
        const redirectUri = environment.facebookLoginCallbackUrl;
        // const redirectUri = 'https://derevian.co/saas/fb-login-callback';
        try {
          const response = await this.userService.handleFacebookLogin(code, redirectUri);
          if (response.status === 200) {
            this.router.navigate(['/dashboard']);
          }
        }
        catch(response) {
          console.error('Error getting access token:', response);
        }
      }
    });
  }
}
