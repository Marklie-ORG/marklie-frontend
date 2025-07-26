import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ButtonComponent } from "src/app/components/button/button.component";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "heading-with-button",
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: "./heading-with-button.component.html",
  styleUrls: ["./heading-with-button.component.scss"]
})
export class HeadingWithButtonComponent {
  title = input<string>("");
  description = input<string>("");
  buttonText = input<string>("");
  buttonLink = input<string>("");

  constructor(private sanitizer: DomSanitizer) {}

  getTitleHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.title());
  }

  get descriptionHTML(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.description());
  }
}
