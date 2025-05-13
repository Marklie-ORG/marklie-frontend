import { Component, OnInit } from '@angular/core';
import { SignUpFormService } from '../../services/api/signup-form.service.js';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.scss']
})
export class AuthDialogComponent implements OnInit {
  constructor(public formService: SignUpFormService) {}

  ngOnInit(): void {}
}
