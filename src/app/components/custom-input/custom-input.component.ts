import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'custom-input',
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss'
})
export class CustomInputComponent {

  @Input() label: string = '';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Input() placeholder: string = '';
}
