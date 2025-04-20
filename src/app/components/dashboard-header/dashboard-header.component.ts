import { Component, OnInit } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { AuthService } from 'src/app/services/api/auth.service';
@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent implements OnInit {
  isMobileMenuOpen: boolean = false;
  email: string = '';

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const access_token = this.authService.getAccessToken() || '';
    const decodedToken = jwtDecode(access_token);
    this.email = (decodedToken as any).email || '';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }



}
