# Marklie Button Component

A reusable, accessible button component with multiple variants, sizes, and states.

## Features

- **Multiple Variants**: primary, secondary, danger, ghost
- **Multiple Sizes**: small, medium (default), large
- **States**: normal, disabled, loading
- **Icon Support**: Optional FontAwesome icon with left/right positioning
- **Full Width Option**: Can span full width of container
- **Accessibility**: ARIA labels, focus states, keyboard support
- **Type Support**: button, submit, reset

## Basic Usage

```html
<!-- Simple primary button -->
<marklie-button (clicked)="handleClick()">
  Click me
</marklie-button>
```

## Props

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Button color variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disable button interactions |
| `loading` | `boolean` | `false` | Show loading spinner |
| `fullWidth` | `boolean` | `false` | Span full container width |
| `icon` | `IconDefinition` | `undefined` | FontAwesome icon |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position relative to text |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility |

### Output Events

| Event | Type | Description |
|-------|------|-------------|
| `clicked` | `EventEmitter<void>` | Emitted when button is clicked |

## Examples

```html
<!-- Primary button with icon -->
<marklie-button 
  variant="primary" 
  [icon]="faSave"
  (clicked)="save()">
  Save Changes
</marklie-button>

<!-- Secondary button -->
<marklie-button variant="secondary">
  Cancel
</marklie-button>

<!-- Danger button with loading state -->
<marklie-button 
  variant="danger" 
  [loading]="isDeleting"
  (clicked)="delete()">
  Delete
</marklie-button>

<!-- Ghost button with right-positioned icon -->
<marklie-button 
  variant="ghost" 
  [icon]="faArrowRight"
  iconPosition="right">
  Learn More
</marklie-button>

<!-- Large, full-width button -->
<marklie-button 
  size="large" 
  [fullWidth]="true"
  (clicked)="submit()">
  Submit
</marklie-button>

<!-- Small, disabled button -->
<marklie-button 
  size="small" 
  [disabled]="true">
  Disabled
</marklie-button>

<!-- Submit button in forms -->
<marklie-button type="submit">
  Submit Form
</marklie-button>
```

## CSS Classes

The component applies automatic classes based on props:

- `.btn-{variant}` - Primary, secondary, danger, or ghost
- `.btn-{size}` - Small, medium, or large
- `.btn-full-width` - When fullWidth is true
- `.btn-loading` - When loading is true
- `.btn-disabled` - When disabled is true

## Styling

The button uses Flexbox for layout and includes:
- Smooth transitions on hover/active states
- Loading spinner animation
- Focus outline for accessibility
- Shadow effects on hover for primary/danger variants
- Responsive icon positioning

## Accessibility

- Keyboard support (tab, space, enter)
- ARIA labels for screen readers
- Focus visible outline
- Disabled state prevents interaction
- Semantic HTML button element

## Import in Components

```typescript
import { MarkieButtonComponent } from '@ui/marklie-button/marklie-button.component';

// Use in standalone components
@Component({
  selector: 'app-example',
  template: '<marklie-button (clicked)="onClick()">Click</marklie-button>',
  standalone: true,
  imports: [MarkieButtonComponent]
})
export class ExampleComponent {}

// Or in modules
@NgModule({
  imports: [MarkieButtonComponent]
})
export class MyModule {}
```
