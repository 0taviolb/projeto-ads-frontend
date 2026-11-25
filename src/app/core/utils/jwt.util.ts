import { JwtPayload } from '../../models/auth.model';

/**
 * Decodifica o payload (Base64URL + UTF-8) de um JWT.
 * Não valida a assinatura: isso é responsabilidade exclusiva do servidor.
 * Retorna null para tokens malformados.
 */
export function decodificarPayload(token: string): JwtPayload | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3 || !partes[1]) return null;

    let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';

    const binario = atob(base64);
    const bytes = Uint8Array.from(binario, c => c.charCodeAt(0));
    const objeto = JSON.parse(new TextDecoder().decode(bytes));

    return objeto && typeof objeto === 'object' && !Array.isArray(objeto)
      ? (objeto as JwtPayload)
      : null;
  } catch {
    return null;
  }
}

/** true se o token for malformado, sem `exp` ou já expirado (Date.now() >= exp * 1000). */
export function tokenExpirado(token: string, agora: number = Date.now()): boolean {
  const exp = decodificarPayload(token)?.exp;
  if (typeof exp !== 'number') return true;
  return agora >= exp * 1000;
}
