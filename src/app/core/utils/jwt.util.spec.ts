import { decodificarPayload, tokenExpirado } from './jwt.util';
import { criarToken, tokenExpiradoTeste, tokenValido } from '../../testing/token-teste';

describe('jwt.util', () => {
  it('decodifica o payload com UTF-8', () => {
    const p = decodificarPayload(criarToken({ sub: '7', nome: 'José Conceição', exp: 1 }));
    expect(p?.sub).toBe('7');
    expect(p?.nome).toBe('José Conceição');
  });

  it('retorna null para token malformado', () => {
    expect(decodificarPayload('abc')).toBeNull();
    expect(decodificarPayload('a.b.c')).toBeNull();
    expect(decodificarPayload('')).toBeNull();
  });

  it('token válido não está expirado', () => {
    expect(tokenExpirado(tokenValido())).toBe(false);
  });

  it('token expirado é detectado', () => {
    expect(tokenExpirado(tokenExpiradoTeste())).toBe(true);
  });

  it('token sem exp ou malformado é tratado como expirado', () => {
    expect(tokenExpirado(criarToken({ sub: '1' }))).toBe(true);
    expect(tokenExpirado('lixo')).toBe(true);
  });
});
