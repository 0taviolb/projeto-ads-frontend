import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { tokenExpiradoTeste, tokenValido } from '../../testing/token-teste';

describe('AuthService', () => {
  const CHAVE = 'financeiro.sessao';

  function criar() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => sessionStorage.clear());
  afterEach(() => TestBed.inject(AuthService).logout());

  it('login guarda a sessão e logout remove', () => {
    const auth = criar();
    const http = TestBed.inject(HttpTestingController);
    const token = tokenValido({ nome: 'Alice', perfil: 'OPERADOR' });

    auth.login({ email: 'a@a.com', senha: 'x' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ token, tipo: 'Bearer', expiraEmSegundos: 3600 });

    expect(auth.autenticado()).toBe(true);
    expect(auth.nome()).toBe('Alice');
    expect(auth.podeVerUsuarios()).toBe(false);
    expect(sessionStorage.getItem(CHAVE)).toContain(token);

    auth.logout();
    expect(auth.autenticado()).toBe(false);
    expect(sessionStorage.getItem(CHAVE)).toBeNull();
  });

  it('sem claim de perfil, o menu Usuários continua visível', () => {
    const auth = criar();
    expect(auth.perfil()).toBeNull();
    expect(auth.podeVerUsuarios()).toBe(true);
  });

  it('não restaura sessão com token expirado', () => {
    sessionStorage.setItem(CHAVE,
      JSON.stringify({ token: tokenExpiradoTeste(), tipo: 'Bearer', expiraEmSegundos: 1 }));
    const auth = criar();
    expect(auth.autenticado()).toBe(false);
    expect(sessionStorage.getItem(CHAVE)).toBeNull();
  });

  it('não restaura sessão corrompida', () => {
    sessionStorage.setItem(CHAVE, '{nao-e-json');
    expect(criar().autenticado()).toBe(false);
  });

  it('restaura sessão válida ao recarregar', () => {
    sessionStorage.setItem(CHAVE,
      JSON.stringify({ token: tokenValido(), tipo: 'Bearer', expiraEmSegundos: 3600 }));
    expect(criar().sessaoValida()).toBe(true);
  });
});
