import { Injectable } from '@angular/core';

interface SignUpFormData {
  email: string;
  password: string;
  isSignInMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SignUpFormService {
  private formData: SignUpFormData = {
    email: '',
    password: '',
    isSignInMode: false
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
      isSignInMode: false
    };
  }
} 