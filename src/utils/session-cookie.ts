/*
 * A plain "signed in" flag readable by src/proxy.ts on the server. It holds no
 * token — the tokens stay in the auth store — it only lets the proxy redirect
 * signed-out visitors away from /account before the page renders.
 */
export const SESSION_COOKIE = "zc_session";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export function setSessionCookie() {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SEVEN_DAYS}; samesite=lax${secure}`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
