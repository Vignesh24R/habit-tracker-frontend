import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

// Sits in front of every outgoing HTTP request — the Angular equivalent of
// middleware in Program.cs. Instead of manually adding the Authorization
// header in every single method on HabitService, this one function handles
// it for the whole app, automatically, on every request.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
