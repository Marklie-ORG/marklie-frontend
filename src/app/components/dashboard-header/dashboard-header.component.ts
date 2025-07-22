import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/api/auth.service.js';
import {
  faArrowRightFromBracket,
  faBell,
  faChevronDown,
  faCoffee,
  faComment, faCommentAlt, faCommentDollar,
  faCommentDots,
  faCreditCard,
  faUser
} from "@fortawesome/free-solid-svg-icons";
@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss',
})
export class DashboardHeaderComponent implements OnInit {
  isDropdownOpen = false;
  userName: string = 'Oleksii Konts';
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getDecodedAccessTokenInfo()
    this.email = userInfo.email;
    this.userName = userInfo.firstName + ' ' + userInfo.lastName;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 150);
  }

  signOut() {
    this.authService.clearTokens();
    this.router.navigate(['/']);
  }


  protected readonly faCoffee = faCoffee;
  protected readonly faUser = faUser;
  protected readonly faComment = faComment;
  protected readonly faBell = faBell;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faCreditCard = faCreditCard;
  protected readonly faCommentDots = faCommentDots;
  protected readonly faArrowRightFromBracket = faArrowRightFromBracket;
  protected readonly faCommentAlt = faCommentAlt;
  protected readonly faCommentDollar = faCommentDollar;
}
