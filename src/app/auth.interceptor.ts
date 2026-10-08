import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './service/auth.service';
import { AuthResponse } from './model/auth';

let refrescando = false;
let tokenNuevo$ = new BehaviorSubject<string | null>(null);

function esAuth(url: string): boolean {
  return url.includes('/api/usuario/login') || url.includes('/api/usuario/refresh');
}

function sinSesion(status: number): boolean {
  return status === 401 || status === 403;
}

function conToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function reintentar(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return tokenNuevo$.pipe(
    filter(t => t !== null),
    take(1),
    switchMap(t => next(conToken(req, t!)))
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const salir = (err: unknown): Observable<never> => {
    authService.logout();
    refrescando = false;
    tokenNuevo$.error(err);
    tokenNuevo$ = new BehaviorSubject<string | null>(null);
    router.navigate(['/login']);
    return throwError(() => err);
  };

  const pedido = token && !esAuth(req.url) ? conToken(req, token) : req;

  return next(pedido).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || !sinSesion(err.status) || esAuth(req.url)) {
        return throwError(() => err);
      }
      if (!authService.hayRefresh()) {
        return salir(err);
      }
      if (refrescando) {
        return reintentar(req, next).pipe(catchError(e => salir(e)));
      }
      refrescando = true;
      tokenNuevo$.next(null);
      return authService.refresh().pipe(
        switchMap((resp: AuthResponse) => {
          refrescando = false;
          tokenNuevo$.next(resp.token);
          return next(conToken(req, resp.token));
        }),
        catchError(e => salir(e))
      );
    })
  );
};
