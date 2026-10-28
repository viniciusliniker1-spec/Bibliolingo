import { authCallbackInbox } from "../services/authCallbackInbox";
import { isMobileAuthCallback } from "../services/authCore";

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  // Capture BEFORE Expo Router transforms the URL. Works for cold and warm starts.
  // No network work here: the provider validates and persists the session.
  if (isMobileAuthCallback(path)) {
    authCallbackInbox.capture(path);
    return "/auth/callback";
  }
  return path;
}
