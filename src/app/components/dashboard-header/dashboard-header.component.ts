import { Component, OnInit } from '@angular/core';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent implements OnInit {
  isMobileMenuOpen: boolean = false;
  email: string = '';

  ngOnInit(): void {
    const access_token = localStorage.getItem('accessToken') || '';
    const decodedToken = jwtDecode(access_token);
    this.email = (decodedToken as any).email || '';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }



}
