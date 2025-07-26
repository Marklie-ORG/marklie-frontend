import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeadingWithButtonComponent } from "../heading-with-button/heading-with-button.component";

@Component({
  selector: "templates-delivery-section",
  imports: [CommonModule, HeadingWithButtonComponent],
  standalone: true,
  templateUrl: "./templates-delivery-section.component.html",
  styleUrls: ["./templates-delivery-section.component.scss"]
})
export class TemplatesDeliverySectionComponent {}
