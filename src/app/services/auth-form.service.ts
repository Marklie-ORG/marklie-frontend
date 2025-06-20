import { Injectable } from '@angular/core';

interface SignUpFormData {
  email: string;
  password: string;
  isSignInMode: boolean;
  isSignUpMode: boolean;
  isForgotPasswordMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthFormService {
  private formData: SignUpFormData = {
    email: '',
    password: '',
    isSignInMode: false,
    isSignUpMode: true,
    isForgotPasswordMode: false
  };

  saveFormData(data: SignUpFormData) {
    this.formData = { ...data };
  }

  getFormData(): SignUpFormData {
    return { ...this.formData };
  }

  clearFormData() {
    this.formData = {
      email: '',
      password: '',
      isSignInMode: false,
      isSignUpMode: true,
      isForgotPasswordMode: false
    };
  }
} 