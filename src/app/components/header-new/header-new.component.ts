import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ButtonComponent } from "../button/button.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-header-new",
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterModule],
  templateUrl: "./header-new.component.html",
  styleUrls: ["./header-new.component.scss"]
})
export class HeaderNewComponent {}
