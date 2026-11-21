import * as WebBrowser from "expo-web-browser";

/** Abre o login do provedor (Google/Facebook) no navegador do sistema e espera o retorno ao app. */
export function openAuthSessionAsync(url: string, redirectUrl: string) {
  return WebBrowser.openAuthSessionAsync(url, redirectUrl);
}
