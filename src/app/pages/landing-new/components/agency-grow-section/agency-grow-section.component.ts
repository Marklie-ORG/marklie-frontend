import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "src/app/components/button/button.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "agency-grow-section",
  standalone: true,
  imports: [CommonModule, ButtonComponent, FontAwesomeModule],
  templateUrl: "./agency-grow-section.component.html",
  styleUrls: ["./agency-grow-section.component.scss"]
})
export class AgencyGrowSectionComponent {
  faArrowRight = faArrowRight;
}
