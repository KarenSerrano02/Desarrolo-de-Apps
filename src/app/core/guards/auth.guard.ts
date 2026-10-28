import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/user.model';
import { AuthService } from '../services/auth.service';

// Solo deja pasar a usuarios con sesión iniciada
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

// Si ya inició sesión, lo manda a la pantalla de su rol
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  return auth.isLoggedIn() && user ? router.createUrlTree([auth.homeFor(user.role)]) : true;
};

// Solo deja pasar al rol indicado
export const roleGuard = (role: Role): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  if (!auth.isLoggedIn() || !user) {
    return router.createUrlTree(['/login']);
  }
  return user.role === role ? true : router.createUrlTree([auth.homeFor(user.role)]);
};
