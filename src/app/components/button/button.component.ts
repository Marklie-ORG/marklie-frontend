import { Component, EventEmitter, Output, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { input } from "@angular/core";

import {
  ButtonSize,
  ButtonVariant,
  TButtonSize,
  TButtonVariant
} from "./types";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [CommonModule, RouterModule, FaIconComponent],
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"]
})
export class ButtonComponent {
  // Signal-based inputs (new API)
  size = input<TButtonSize>(ButtonSize.MEDIUM);
  variant = input<TButtonVariant>(ButtonVariant.PRIMARY);
  disabled = input(false);
  loading = input(false);
  type = input<"button" | "submit" | "reset">("button");
  fullWidth = input(false);
  link = input<string | undefined>(undefined);
  target = input<"_blank" | "_self" | "_parent" | "_top">("_self");
  icon = input<IconProp>(undefined as unknown as IconProp);
  iconPosition = input<"left" | "right">("left");
  iconVariant = input<"dark" | "light">("dark");

  @Output() clicked = new EventEmitter<void>();

  // Computed signals
  isLink = computed(() => !!this.link());
  buttonClasses = computed(() => {
    const classes = [
      "btn",
      `btn--${this.size()}`,
      `btn--${this.variant()}`,
      this.fullWidth() ? "btn--full-width" : "",
      this.disabled() ? "btn--disabled" : "",
      this.loading() ? "btn--loading" : "",
      this.isLink() ? "btn--link" : "",
      this.icon() ? `btn--with-icon btn--icon-${this.iconPosition()}` : ""
    ];
    return classes.filter(Boolean).join(" ");
  });

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
