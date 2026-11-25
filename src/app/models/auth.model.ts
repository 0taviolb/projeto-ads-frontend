export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
}

export type PerfilUsuario = 'ADMIN' | 'OPERADOR';

/** Claims do JWT. O Angular apenas LÊ o payload; quem valida assinatura é o Spring Security. */
export interface JwtPayload {
  iss?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  nome?: string;
  perfil?: string;
}
