import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'loom-link-editor',
  templateUrl: './loom-link-editor.component.html',
  styleUrl: './loom-link-editor.component.scss'
})
export class LoomLinkEditorComponent {

  @Input() link: string = '';
  @Input() buttonLabel: string = 'Add Loom';

  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  isOpen = signal<boolean>(false);
  value = signal<string>('');

  open() {
    this.value.set(this.link || '');
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.cancel.emit();
  }

  onSave() {
    this.save.emit(this.value());
    this.isOpen.set(false);
  }
}


