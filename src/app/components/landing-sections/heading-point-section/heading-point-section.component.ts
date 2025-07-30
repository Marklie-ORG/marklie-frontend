import { Component, input, computed } from "@angular/core";

@Component({
  selector: "heading-point-section",
  standalone: true,
  templateUrl: "./heading-point-section.component.html",
  styleUrls: ["./heading-point-section.component.scss"]
})
export class HeadingPointSectionComponent {
  titleLarge = input<string>("");
  titleSmall = input<string>("");
  subTitle = input<string>("");
  description = input<string>("");
}
