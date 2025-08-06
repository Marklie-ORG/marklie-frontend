import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeadingWithButtonComponent } from "../heading-with-button/heading-with-button.component";
import { InfoTagComponent } from "src/app/components/info-tag/info-tag.component";

@Component({
  selector: "automatic-delivery-section",
  imports: [CommonModule, HeadingWithButtonComponent, InfoTagComponent],
  standalone: true,
  templateUrl: "./automatic-delivery-section.component.html",
  styleUrls: ["./automatic-delivery-section.component.scss"]
})
export class AutomaticDeliverySectionComponent {}
