import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service.js';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUrl = router.url;

  if (currentUrl.startsWith('/view-report')) {
    return true;
  }

  if (authService.getAccessToken()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
