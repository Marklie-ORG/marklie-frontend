import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { UserService } from '../../api/services/api/user.service';

@Component({
  selector: 'app-slack-login-callback',
  templateUrl: './slack-login-callback.component.html',
  styleUrl: './slack-login-callback.component.scss'
})
export class SlackLoginCallbackComponent {
  // ?code=8822983730096.8785307241415.d471a0104f19d3c7e8627e7f2529c93ebd52e8660e229562d496d986e44a28fb&state=

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {

    this.route.queryParams.subscribe(async (params) => {
      const code = params['code'];
      if (code) {
        const redirectUri = environment.slackLoginCallbackUrl;

        try {
          const response = await this.userService.handleSlackLogin(code, redirectUri);
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
