import { Component } from "@angular/core";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "src/app/components/button/button.component";
import { InfoTagComponent } from "src/app/components/info-tag/info-tag.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "landing-hero-section",
  imports: [CommonModule, ButtonComponent, InfoTagComponent, FontAwesomeModule],
  standalone: true,
  templateUrl: "./landing-hero-section.component.html",
  styleUrls: ["./landing-hero-section.component.scss"]
})
export class LandingHeroSectionComponent {
  faArrowRight = faArrowRight;
}
