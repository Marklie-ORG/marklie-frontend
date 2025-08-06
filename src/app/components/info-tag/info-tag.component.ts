import { CommonModule } from "@angular/common";
import { Component, input, Input } from "@angular/core";

@Component({
  selector: "app-info-tag",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./info-tag.component.html",
  styleUrls: ["./info-tag.component.scss"]
})
export class InfoTagComponent {
  text = input<string>("");
  size = input<'small' | 'big'>('big');
}
