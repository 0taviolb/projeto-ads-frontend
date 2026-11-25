import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const base = environment.apiUrl.replace(/\/$/, '');
  const url = req.url.split('?')[0];

  // Só a API própria recebe o Bearer; o login nunca o recebe.
  if (!url.startsWith(base + '/') || url === base + '/auth/login') return next(req);

  const token = auth.token();
  const enviada = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(enviada).pipe(
    catchError(erro => {
      // 401 = autenticação ausente/inválida/expirada -> limpa sessão e volta ao login.
      // 403 NÃO desloga: a sessão é válida, falta permissão.
      if (erro.status === 401 && auth.token() === token) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => erro);
    })
  );
};
