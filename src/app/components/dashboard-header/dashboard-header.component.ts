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
import { ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UserService } from '../../services/api/user.service.js';
@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss',
})
export class DashboardHeaderComponent implements OnInit {
  isDropdownOpen = false;
  userName: string = 'Oleksii Konts';
  email: string = '';

  // Feedback UI state
  isFeedbackOpen = false;
  feedbackMessage: string = '';
  sending = false;
  feedbackSent = false;

  @ViewChild('triggerButton') triggerButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('menu') menu?: ElementRef<HTMLElement>;
  @ViewChild('feedbackContainer') feedbackContainer?: ElementRef<HTMLElement>;
  @ViewChildren('menuItem') menuItems?: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getDecodedAccessTokenInfo()
    console.log(userInfo)
    this.email = userInfo.email;
    this.userName = userInfo.firstName + ' ' + userInfo.lastName;
  }

  toggleFeedback() {
    this.isFeedbackOpen = !this.isFeedbackOpen;
    if (this.isFeedbackOpen) {
      this.feedbackSent = false;
    }
  }

  onFeedbackKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.sendFeedback();
    }
  }

  async sendFeedback() {
    if (this.sending) return;
    const message = (this.feedbackMessage || '').trim();
    if (!message) return;
    try {
      this.sending = true;
      await this.userService.sendFeedback(message);
      this.feedbackSent = true;
      this.feedbackMessage = '';
      // Auto-close after a short delay
      setTimeout(() => {
        this.isFeedbackOpen = false;
        this.feedbackSent = false;
      }, 1200);
    } finally {
      this.sending = false;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      // Focus first item after menu renders
      setTimeout(() => this.focusFirstItem(), 0);
    }
  }

  closeDropdown(focusTrigger: boolean = false) {
    if (!this.isDropdownOpen) return;
    this.isDropdownOpen = false;
    if (focusTrigger) {
      setTimeout(() => this.triggerButton?.nativeElement.focus(), 0);
    }
  }

  onTriggerKeydown(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (!this.isDropdownOpen) {
        this.isDropdownOpen = true;
        setTimeout(() => this.focusFirstItem(), 0);
      } else {
        this.focusFirstItem();
      }
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isDropdownOpen) {
        this.isDropdownOpen = true;
        setTimeout(() => this.focusLastItem(), 0);
      } else {
        this.focusLastItem();
      }
    } else if (key === 'Escape') {
      this.closeDropdown(true);
    }
  }

  onMenuKeydown(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'ArrowDown') {
      event.preventDefault();
      this.focusNextItem();
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      this.focusPreviousItem();
    } else if (key === 'Home') {
      event.preventDefault();
      this.focusFirstItem();
    } else if (key === 'End') {
      event.preventDefault();
      this.focusLastItem();
    } else if (key === 'Escape') {
      event.preventDefault();
      this.closeDropdown(true);
    } else if (key === 'Tab') {
      // Close on tab out
      this.closeDropdown();
    }
  }

  onMenuItemClick() {
    this.closeDropdown(true);
  }

  private getMenuItemElements(): HTMLElement[] {
    return (this.menuItems?.toArray().map(ref => ref.nativeElement) || []).filter(el => !el.hasAttribute('disabled'));
  }

  private focusFirstItem() {
    const items = this.getMenuItemElements();
    if (items.length > 0) items[0].focus();
  }

  private focusLastItem() {
    const items = this.getMenuItemElements();
    if (items.length > 0) items[items.length - 1].focus();
  }

  private focusNextItem() {
    const items = this.getMenuItemElements();
    const index = items.findIndex(el => el === document.activeElement);
    const nextIndex = index >= 0 ? (index + 1) % items.length : 0;
    if (items[nextIndex]) items[nextIndex].focus();
  }

  private focusPreviousItem() {
    const items = this.getMenuItemElements();
    const index = items.findIndex(el => el === document.activeElement);
    const prevIndex = index > 0 ? index - 1 : items.length - 1;
    if (items[prevIndex]) items[prevIndex].focus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    if (this.isDropdownOpen) {
      const clickInsideTrigger = this.triggerButton?.nativeElement.contains(target);
      const clickInsideMenu = this.menu?.nativeElement.contains(target);
      if (!clickInsideTrigger && !clickInsideMenu) {
        this.closeDropdown();
      }
    }

    if (this.isFeedbackOpen) {
      const clickInsideFeedback = this.feedbackContainer?.nativeElement.contains(target);
      if (!clickInsideFeedback) {
        this.isFeedbackOpen = false;
        this.feedbackSent = false;
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeDropdown(true);
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
