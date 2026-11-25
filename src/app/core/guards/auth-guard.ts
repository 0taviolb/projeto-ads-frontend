import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Proteção de NAVEGAÇÃO (presença e expiração do token). Os dados são protegidos pela API. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.sessaoValida() ? true : router.createUrlTree(['/login']);
};
