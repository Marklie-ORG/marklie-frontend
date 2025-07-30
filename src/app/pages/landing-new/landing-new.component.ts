import { Component } from "@angular/core";
import { HeadingPointSectionComponent } from "../../components/landing-sections/heading-point-section/heading-point-section.component";
import { CommonModule } from "@angular/common";
import { LandingHeroSectionComponent } from "../../components/landing-sections/landing-hero-section/landing-hero-section..component";
import { LandingCommunicationSectionComponent } from "../../components/landing-sections/landing-communication-section/landing-communication-section.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { AutomaticDeliverySectionComponent } from "../../components/landing-sections/automatic-delivery-section/automatic-delivery-section.component";
import { TemplatesDeliverySectionComponent } from "../../components/landing-sections/templates-delivery-section/templates-delivery-section.component";
import { FeaturesTableSectionComponent } from "../../components/landing-sections/features-table-section/features-table-section.component";
import { FreeDemoSectionComponent } from "../../components/landing-sections/free-demo-section/free-demo-section.component";
import { FeaturesSectionComponent } from "../../components/landing-sections/features-section/features-section.component";
import { AgencyGrowSectionComponent } from "../../components/landing-sections/agency-grow-section/agency-grow-section.component";

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
    FontAwesomeModule,
    AutomaticDeliverySectionComponent,
    TemplatesDeliverySectionComponent,
    FeaturesTableSectionComponent,
    FreeDemoSectionComponent,
    FeaturesSectionComponent,
    AgencyGrowSectionComponent
  ]
})
export class LandingNewComponent {}
