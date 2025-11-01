import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ButtonComponent } from "../button/button.component";
import { RouterModule } from "@angular/router";
import { AuthService } from "@services/api/auth.service";

@Component({
  selector: "app-header-new",
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterModule],
  templateUrl: "./header-new.component.html",
  styleUrls: ["./header-new.component.scss"]
})
export class HeaderNewComponent {

  private authService = inject(AuthService);
  isMobileMenuOpen = false;

  get isSignedIn() {
    return this.authService.hasAccessToken();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

}
