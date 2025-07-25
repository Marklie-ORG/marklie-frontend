import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "heading-point-section",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./heading-point-section.component.html",
  styleUrls: ["./heading-point-section.component.scss"]
})
export class HeadingPointSectionComponent {
  title = input<string>("");
  subTitle = input<string>("");
  description = input<string>("");
}
