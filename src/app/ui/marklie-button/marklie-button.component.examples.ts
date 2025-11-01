/**
 * MARKLIE BUTTON - USAGE EXAMPLES
 * 
 * This file demonstrates various ways to use the MarkieButtonComponent
 */

import { Component } from '@angular/core';
import { MarkieButtonComponent } from './marklie-button.component';
import { faSave, faTrash, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Example 1: Basic Button
@Component({
  selector: 'app-button-basic',
  template: `
    <marklie-button (clicked)="handleClick()">
      Click me
    </marklie-button>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class BasicButtonExample {
  handleClick() {
    console.log('Button clicked!');
  }
}

// Example 2: Button Variants
@Component({
  selector: 'app-button-variants',
  template: `
    <div style="display: flex; gap: 8px;">
      <marklie-button variant="primary">Primary</marklie-button>
      <marklie-button variant="secondary">Secondary</marklie-button>
      <marklie-button variant="danger">Danger</marklie-button>
      <marklie-button variant="ghost">Ghost</marklie-button>
    </div>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ButtonVariantsExample {}

// Example 3: Button Sizes
@Component({
  selector: 'app-button-sizes',
  template: `
    <div style="display: flex; gap: 8px; align-items: center;">
      <marklie-button size="small">Small</marklie-button>
      <marklie-button size="medium">Medium</marklie-button>
      <marklie-button size="large">Large</marklie-button>
    </div>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ButtonSizesExample {}

// Example 4: Button with Icon
@Component({
  selector: 'app-button-with-icon',
  template: `
    <div style="display: flex; gap: 8px;">
      <marklie-button [icon]="faSave">
        Save
      </marklie-button>
      <marklie-button variant="danger" [icon]="faTrash">
        Delete
      </marklie-button>
      <marklie-button variant="ghost" [icon]="faArrowRight" iconPosition="right">
        Next
      </marklie-button>
    </div>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ButtonWithIconExample {
  faSave = faSave;
  faTrash = faTrash;
  faArrowRight = faArrowRight;
}

// Example 5: Button States
@Component({
  selector: 'app-button-states',
  template: `
    <div style="display: flex; gap: 8px;">
      <marklie-button>Normal</marklie-button>
      <marklie-button [disabled]="true">Disabled</marklie-button>
      <marklie-button [loading]="isLoading" (clicked)="handleAsyncClick()">
        {{ isLoading ? 'Loading...' : 'Click to Load' }}
      </marklie-button>
    </div>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ButtonStatesExample {
  isLoading = false;

  async handleAsyncClick() {
    this.isLoading = true;
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.isLoading = false;
  }
}

// Example 6: Full Width Button
@Component({
  selector: 'app-button-full-width',
  template: `
    <div style="max-width: 300px;">
      <marklie-button [fullWidth]="true" size="large">
        Subscribe Now
      </marklie-button>
    </div>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ButtonFullWidthExample {}

// Example 7: Form Submission
@Component({
  selector: 'app-button-form-submit',
  template: `
    <form (ngSubmit)="onSubmit()">
      <input type="text" placeholder="Enter name" required>
      <marklie-button type="submit">
        Submit Form
      </marklie-button>
    </form>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ButtonFormSubmitExample {
  onSubmit() {
    console.log('Form submitted!');
  }
}

// Example 8: Button Group
@Component({
  selector: 'app-button-group',
  template: `
    <div style="display: flex; gap: 8px;">
      <marklie-button variant="secondary">Cancel</marklie-button>
      <marklie-button variant="primary" [loading]="isSaving" (clicked)="save()">
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </marklie-button>
    </div>
  `,
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ButtonGroupExample {
  isSaving = false;

  async save() {
    this.isSaving = true;
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isSaving = false;
    console.log('Changes saved!');
  }
}
