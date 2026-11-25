/** Utilitário SOMENTE para testes: fabrica um JWT fake (assinatura não é validada no Angular). */
function base64Url(obj: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function criarToken(payload: object): string {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.assinatura-fake`;
}

export function tokenValido(extra: object = {}, segundos = 3600): string {
  return criarToken({ sub: '1', exp: Math.floor(Date.now() / 1000) + segundos, ...extra });
}

export function tokenExpiradoTeste(): string {
  return criarToken({ sub: '1', exp: Math.floor(Date.now() / 1000) - 60 });
}
