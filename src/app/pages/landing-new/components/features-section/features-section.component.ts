import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeadingPointSectionComponent } from "../heading-point-section/heading-point-section.component";
import { ButtonComponent } from "src/app/components/button/button.component";

@Component({
  selector: "features-section",
  standalone: true,
  imports: [CommonModule, HeadingPointSectionComponent, ButtonComponent],
  templateUrl: "./features-section.component.html",
  styleUrls: ["./features-section.component.scss"]
})
export class FeaturesSectionComponent {}
