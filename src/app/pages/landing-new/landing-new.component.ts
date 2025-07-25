import { Component } from "@angular/core";
import { HeadingPointSectionComponent } from "./components/heading-point-section/heading-point-section.component";
import { CommonModule } from "@angular/common";
import { LandingHeroSectionComponent } from "./components/landing-hero-section/landing-hero-section..component";
import { LandingCommunicationSectionComponent } from "./components/landing-communication-section/landing-communication-section.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-landing-new",
  standalone: true,
  templateUrl: "./landing-new.component.html",
  styleUrls: ["./landing-new.component.scss"],
  imports: [
    CommonModule,
    LandingHeroSectionComponent,
    LandingCommunicationSectionComponent,
    HeadingPointSectionComponent,
    FontAwesomeModule
  ]
})
export class LandingNewComponent {}
