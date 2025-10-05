import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@services/api/auth.service';
import { OrganizationService } from '@services/api/organization.service';

@Component({
  selector: 'app-activate-client-access',
  templateUrl: './activate-client-access.component.html',
  styleUrl: './activate-client-access.component.scss'
})
export class ActivateClientAccessComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const token = params['token'];
      if (token) {
        console.log(token);
        await this.organizationService.verifyClientAccess(token)
        await this.authService.refreshAndReplaceToken();
        const decodedToken = this.authService.getDecodedAccessTokenInfo();
        console.log(decodedToken);
        this.router.navigate(['/client-database', decodedToken.clientUuid]);
      }
    });
  }

}
