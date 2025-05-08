import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { SlackLoginService } from 'src/app/services/slack-login.service';
import {UserService} from "../../api/services/user.service.js";

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
    private router: Router,
    private slackLoginService: SlackLoginService
  ) {}

  ngOnInit() {

    this.route.queryParams.subscribe(async (params) => {
      const code = params['code'];
      const organizationClientId = this.slackLoginService.getTargetClientIdForSlackWorkspace();

      if (code && organizationClientId) {
        const redirectUri = environment.slackLoginCallbackUrl;

        try {
          const response = await this.userService.handleSlackLogin(code, redirectUri, organizationClientId);
          this.slackLoginService.removeTargetClientIdForSlackWorkspace();
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
