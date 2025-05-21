import { Component } from '@angular/core';
import { AuthFormService } from 'src/app/services/auth-form.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  constructor(
    public formService: AuthFormService,
  ) {}
}
