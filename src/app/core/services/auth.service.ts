import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../models/auth.model';
import { decodificarPayload, tokenExpirado } from '../utils/jwt.util';

const MAX_TIMEOUT = 2_147_483_647; // limite do setTimeout (~24,8 dias)

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly chave = 'financeiro.sessao';
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  // sessionStorage preserva a sessão ao recarregar a aba, mas NÃO protege contra XSS.
  private sessao = signal<LoginResponse | null>(this.restaurar());

  readonly token = computed(() => this.sessao()?.token ?? null);
  readonly autenticado = computed(() => !!this.token());
  readonly claims = computed(() => {
    const t = this.token();
    return t ? decodificarPayload(t) : null;
  });
  /** Só existe se o backend incluir a claim `nome`. */
  readonly nome = computed(() => this.claims()?.nome ?? null);
  readonly perfil = computed(() => this.claims()?.perfil ?? null);
  /** Apenas conveniência de UI; a autorização real é do servidor. */
  readonly podeVerUsuarios = computed(() => this.perfil() !== 'OPERADOR');

  constructor() {
    this.agendarExpiracao();
  }

  login(dados: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, dados)
      .pipe(
        tap(res => {
          sessionStorage.setItem(this.chave, JSON.stringify(res));
          this.sessao.set(res);
          this.agendarExpiracao();
        })
      );
  }

  logout() {
    this.cancelarTemporizador();
    sessionStorage.removeItem(this.chave);
    this.sessao.set(null);
  }

  /** Verifica presença E validade (exp) do token; se expirou, limpa a sessão. */
  sessaoValida(): boolean {
    const t = this.token();
    if (!t) return false;
    if (tokenExpirado(t)) {
      this.logout();
      return false;
    }
    return true;
  }

  private restaurar(): LoginResponse | null {
    try {
      const salva = JSON.parse(sessionStorage.getItem(this.chave) ?? 'null');
      if (salva && typeof salva.token === 'string' && !tokenExpirado(salva.token)) {
        return salva as LoginResponse;
      }
      sessionStorage.removeItem(this.chave);
      return null;
    } catch {
      return null;
    }
  }

  /** Ao expirar com a tela aberta, limpa a sessão e leva ao login. */
  private agendarExpiracao() {
    this.cancelarTemporizador();
    const t = this.token();
    const exp = t ? decodificarPayload(t)?.exp : undefined;
    if (typeof exp !== 'number') return;

    const restante = Math.max(exp * 1000 - Date.now(), 0);
    this.temporizador = setTimeout(() => {
      if (this.sessaoValida()) this.agendarExpiracao();
      else this.router.navigate(['/login']);
    }, Math.min(restante, MAX_TIMEOUT));
  }

  private cancelarTemporizador() {
    if (this.temporizador !== null) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }
}
