import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { tokenValido } from '../../testing/token-teste';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let auth: AuthService;
  let token: string;

  beforeEach(() => {
    token = tokenValido();
    sessionStorage.setItem('financeiro.sessao',
      JSON.stringify({ token, tipo: 'Bearer', expiraEmSegundos: 3600 }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => { auth.logout(); sessionStorage.clear(); });

  it('envia Bearer para a API própria', () => {
    http.get(`${environment.apiUrl}/lancamentos`).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}/lancamentos`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });

  it('não envia Bearer em requisição externa', () => {
    http.get('https://terceiro.example.com/dados').subscribe();
    const req = ctrl.expectOne('https://terceiro.example.com/dados');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('não envia Bearer no login', () => {
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => {} });
    const req = ctrl.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.autenticado()).toBe(true); // 401 de login não derruba sessão existente
  });

  it('401 limpa a sessão e redireciona ao login', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.get(`${environment.apiUrl}/lancamentos`).subscribe({ error: () => {} });
    ctrl.expectOne(`${environment.apiUrl}/lancamentos`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.autenticado()).toBe(false);
    expect(nav).toHaveBeenCalledWith(['/login']);
  });

  it('403 preserva a sessão', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.get(`${environment.apiUrl}/lancamentos`).subscribe({ error: () => {} });
    ctrl.expectOne(`${environment.apiUrl}/lancamentos`)
      .flush({}, { status: 403, statusText: 'Forbidden' });
    expect(auth.autenticado()).toBe(true);
    expect(nav).not.toHaveBeenCalled();
  });
});
