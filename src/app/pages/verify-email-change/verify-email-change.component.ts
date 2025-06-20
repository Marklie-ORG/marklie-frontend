import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/api/user.service';
@Component({
  selector: 'app-verify-email-change',
  templateUrl: './verify-email-change.component.html',
  styleUrl: './verify-email-change.component.scss'
})
export class VerifyEmailChangeComponent {

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {

    this.route.queryParams.subscribe(async (params) => {
      const token = params['token'];
      if (token) {
        // TODO: Verify token and update email
        console.log('Token received:', token);
        try {
          const response = await this.userService.verifyEmailChange(token);
          console.log('Response:', response);
          this.router.navigate(['/profile']);
        } catch (error) {
          console.error('Error verifying email change:', error);
        }
        
      }
    });

  }
  
}
