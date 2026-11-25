import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth-guard';
import { tokenValido } from '../../testing/token-teste';

describe('authGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
  });

  const executar = () =>
    TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  it('sem sessão redireciona ao /login', () => {
    const r = executar() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(r)).toBe('/login');
  });

  it('com sessão válida libera a rota', () => {
    sessionStorage.setItem('financeiro.sessao',
      JSON.stringify({ token: tokenValido(), tipo: 'Bearer', expiraEmSegundos: 3600 }));
    expect(executar()).toBe(true);
  });
});
