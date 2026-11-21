/**
 * Na web o login faz um redirecionamento de página inteira (sem janela pop-up): o Google costuma desconectar a janela
 * pop-up da página que a abriu, e o resultado se perdia. O retorno chega em /auth/callback, que o app processa.
 * Usa a janela de topo porque, em telas largas, o app roda dentro de uma moldura (iframe) e o Google não abre em iframe.
 */
export function openAuthSessionAsync(url: string, _redirectUrl: string): Promise<{ type: "dismiss" }> {
  const target = (() => { try { return window.top ?? window; } catch { return window; } })();
  target.location.assign(url);
  // A página sai daqui. Se continuar aberta (ex.: voltou pelo botão "voltar"), libera o botão depois de um tempo.
  return new Promise((resolve) => { setTimeout(() => resolve({ type: "dismiss" }), 20_000); });
}
