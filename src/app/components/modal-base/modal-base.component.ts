import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'modal-base',
  templateUrl: './modal-base.component.html',
  styleUrl: './modal-base.component.scss'
})
export class ModalBaseComponent {

  constructor(public dialogRef: MatDialogRef<ModalBaseComponent>) {}
  
}
