# Google OAuth — Android callback repair

Baseline: `a7f5212b`, branch `fix/mobile-auth-sync-lumi-final`.

The reported text came from a 12-second polling fallback in the callback screen.
That screen mounted after the incoming Linking event; getInitialURL describes app
launch, so it can remain null during a warm return. This is a reproducible code
path, not proof of a Google provider configuration failure.

Changes:
- Capture the raw return in Expo Router's native-intent hook before route parsing.
- Retain it briefly in memory and pass only the clean callback path to navigation.
- Use Expo SDK 57's native-cached useLinkingURL fallback.
- Share callback verification and secure session persistence between all consumers.
- Do not consider an unrelated stored session proof that OAuth succeeded.
- Ignore stale AppState refresh results after a newer session change.
- Preserve password recovery and validate the exact callback scheme/path.
- Bound backend verification time and handle Android browser-dismiss races.

No database migration or provider change is introduced. Existing configuration:
- Android package: `com.bibliolingo.app`
- Supabase allowed redirect: `bibliolingo://auth/callback`
- Google Web OAuth authorized redirect:
  `https://bldjisxjhkxljblzpmru.supabase.co/auth/v1/callback`

Provider dashboards and real Google sign-in are not accessible from this environment.
Do not change the Web Site URL or create a new OAuth project. Check the two allowed
redirects above if the provider redirects elsewhere.

Validation: automated callback/inbox/service tests run in the Android workflow.
They cover early/late callback delivery, duplicate delivery, cancellation, invalid
tokens, storage confirmation, recovery, exact URL validation and timeout.
The actual Google account chooser/browser/Android intent still requires Samsung testing.

Samsung acceptance:
1. Install the new APK over the existing app; do not clear data or uninstall.
2. Open Google sign-in from the profile, select the account, and confirm the app
   shows the matching authenticated profile.
3. Close and reopen; the same account and existing progress must remain.
4. Sign out and repeat while the app is already open.
5. Test cancellation and email/password recovery separately.
