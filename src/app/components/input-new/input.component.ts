import { Component, input, output, model, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

export const InputVariant = {
  PRIMARY: "primary"
} as const;

export type TInputVariant = (typeof InputVariant)[keyof typeof InputVariant];

@Component({
  selector: "app-input",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./input.component.html",
  styleUrl: "./input.component.module.scss"
})
export class InputComponent {
  label = input<string>("");
  placeholder = input<string>("");
  type = input<string>("text");
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>("");
  variant = input<TInputVariant>(InputVariant.PRIMARY);

  // Two-way binding with model signal
  value = model<string>("");

  // Output signal
  valueChange = output<string>();

  // Computed signal for classes
  inputClasses = computed(() => {
    const classes = [
      "input",
      `input--${this.variant()}`,
      this.error() ? "input--error" : "",
      this.disabled() ? "input--disabled" : ""
    ];
    return classes.filter(Boolean).join(" ");
  });

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.valueChange.emit(target.value);
  }
}
