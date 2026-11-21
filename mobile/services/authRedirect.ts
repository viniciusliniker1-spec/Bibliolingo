import { MOBILE_AUTH_CALLBACK_URL } from "./authCore";

/** Endereço para onde o login (e-mail, Google, Facebook) devolve a pessoa. No celular é o link do app (bibliolingo://). */
export function authRedirectUrl() {
  return MOBILE_AUTH_CALLBACK_URL;
}
