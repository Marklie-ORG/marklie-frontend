import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service.js';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getAccessToken()) {
    return true;
  }

  // Redirect to login page if not authenticated
  router.navigate(['/']);
  return false;
};
