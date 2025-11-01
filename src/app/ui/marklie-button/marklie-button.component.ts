import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'marklie-button',
  templateUrl: './marklie-button.component.html',
  styleUrl: './marklie-button.component.scss',
  standalone: true,
  imports: [CommonModule, FaIconComponent, FontAwesomeModule]
})
export class MarkieButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() icon?: IconDefinition;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() ariaLabel?: string;

  @Output() clicked = new EventEmitter<void>();

  onButtonClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }

  get buttonClasses(): string[] {
    const classes = [
      `btn-${this.variant}`,
      `btn-${this.size}`,
      this.fullWidth ? 'btn-full-width' : '',
      this.loading ? 'btn-loading' : '',
      this.disabled ? 'btn-disabled' : '',
    ];
    return classes.filter(c => c !== '');
  }
}
