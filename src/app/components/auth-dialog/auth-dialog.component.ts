import { Component, OnInit } from '@angular/core';
import { AuthFormService } from '../../services/auth-form.service.js';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.scss']
})
export class AuthDialogComponent implements OnInit {

  constructor(
    public formService: AuthFormService,
    public dialogRef: MatDialogRef<AuthDialogComponent>
  ) {}

  ngOnInit(): void {}
}
