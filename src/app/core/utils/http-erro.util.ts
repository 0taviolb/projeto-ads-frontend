import { HttpErrorResponse } from '@angular/common/http';

/**
 * Converte um erro HTTP em mensagem para a tela.
 * - 401 é tratado pelo interceptor (limpa sessão e vai ao login).
 * - 403 NÃO derruba a sessão: apenas informa falta de permissão.
 * `especificas` permite sobrescrever a mensagem de um status no contexto do componente.
 */
export function mensagemErroHttp(
  erro: unknown,
  padrao: string,
  especificas: Partial<Record<number, string>> = {}
): string {
  const e = erro as HttpErrorResponse;
  const status = e?.status;
  if (typeof status === 'number' && especificas[status]) return especificas[status]!;

  switch (status) {
    case 0:
      return 'Sem resposta da API. Verifique a rede, o servidor ou o CORS.';
    case 401:
      return 'Sessão expirada ou inválida. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para acessar este recurso.';
    default:
      return e?.error?.erro || padrao;
  }
}
