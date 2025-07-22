import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  ButtonSize,
  ButtonVariant,
  TButtonSize,
  TButtonVariant,
} from './types';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() size: TButtonSize = ButtonSize.MEDIUM;
  @Input() variant: TButtonVariant = ButtonVariant.PRIMARY;
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: boolean = false;
  @Input() link?: string;
  @Input() target: '_blank' | '_self' | '_parent' | '_top' = '_self';
  @Input() icon?: IconDefinition;
  @Input() iconPosition?: 'left' | 'right' = 'left';
  @Input() iconVariant?: 'dark' | 'light' = 'dark';

  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }

  get buttonClasses(): string {
    const classes = [
      'btn',
      `btn--${this.size}`,
      `btn--${this.variant}`,
      this.fullWidth ? 'btn--full-width' : '',
      this.disabled ? 'btn--disabled' : '',
      this.loading ? 'btn--loading' : '',
      this.isLink ? 'btn--link' : '',
      this.icon ? `btn--with-icon btn--icon-${this.iconPosition}` : '',
    ];

    return classes.filter(Boolean).join(' ');
  }

  get isLink(): boolean {
    return !!this.link;
  }
}
