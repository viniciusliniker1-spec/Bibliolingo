import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getLevelProgress } from "../domain/gamification";
import { useApp } from "../state/AppContext";
import { useAuth } from "./AuthContext";
import {
  accountUsernameError,
  getAccountUsername,
  normalizeAccountUsername
} from "./accountIdentity";
import "./auth.css";
import { useLumi } from "../lumi/LumiContext";
import { ProfilePhotoEditor } from "../features/profile/ProfilePhotoEditor";

type FormMode = "login" | "signup" | "recovery";

function syncLabel(status: string) {
  if (status === "syncing") return "Sincronizando…";
  if (status === "synced") return "Sincronizado";
  if (status === "offline") return "Aguardando internet";
  if (status === "error") return "Erro de sincronização";
  return "Somente neste dispositivo";
}

export function Account() {
  const auth = useAuth();
  const lumi = useLumi();
  const { state, syncStatus, migrationRequired, syncNow, importLocalProgress } = useApp();
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);
  const level = getLevelProgress(state.xp);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(undefined);
    try {
      if (mode === "recovery") {
        await auth.sendRecovery(email);
        setNotice("Enviamos as instruções de recuperação. Confira também a caixa de spam.");
      } else if (mode === "signup") {
        const result = await auth.signUp(email, password, displayName);
        setNotice(result === "confirm-email"
          ? "Conta criada. Confirme o e-mail para entrar."
          : "Conta criada e sessão iniciada.");
      } else {
        await auth.signIn(email, password);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  };

  if (auth.loading) {
    return <main className="page auth-page"><p>Verificando sua sessão…</p></main>;
  }

  if (auth.session) {
    const currentName = auth.session.user.user_metadata?.display_name ?? "";
    const currentUsername = getAccountUsername(auth.session.user);
    return (
      <main className="page auth-page">
        <section className="auth-card account-card">
          <p className="eyebrow">MEU PERFIL</p>
          <div className="account-heading">
            <div className="account-avatar" aria-hidden="true">
              {lumi.profilePhotoUrl
                ? <img src={lumi.profilePhotoUrl} alt="" />
                : (currentName || auth.session.user.email || "B").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>{currentName || "Estudante"}</h1>
              <p className="account-username">@{currentUsername}</p>
              <p className="account-email">Conta conectada · {auth.session.user.email}</p>
            </div>
          </div>
          <ProfilePhotoEditor />
          <div className="account-stats" aria-label="Resumo do progresso">
            <div><strong>{state.xp}</strong><span>XP</span></div>
            <div><strong>{level.level}</strong><span>Nível</span></div>
            <div><strong>{state.streak}</strong><span>Dias seguidos</span></div>
            <div><strong>{state.completedLessonIds.length}</strong><span>Lições</span></div>
          </div>
          <section className="account-sync" aria-live="polite">
            <div><strong>Sincronização</strong><span>{syncLabel(syncStatus)}</span></div>
            {migrationRequired ? (
              <>
                <p>Encontramos progresso local ainda não enviado. Confirme a mesclagem nesta conta.</p>
                <button className="primary-button" onClick={() => void importLocalProgress()}>Mesclar progresso local</button>
              </>
            ) : (
              <button className="secondary-button" onClick={() => void syncNow()}>Sincronizar agora</button>
            )}
          </section>
          <form onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setNotice(undefined);
            try {
              const nextUsername = normalizeAccountUsername(username || currentUsername);
              const usernameError = accountUsernameError(nextUsername);
              if (usernameError) {
                setNotice(usernameError);
                return;
              }
              await auth.updateProfile({
                displayName: displayName || currentName,
                username: nextUsername,
                password: newPassword || undefined
              });
              setUsername("");
              setNewPassword("");
              setNotice("Perfil atualizado.");
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Não foi possível atualizar.");
            } finally {
              setBusy(false);
            }
          }}>
            <label>Nome<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={currentName || "Seu nome"} /></label>
            <label>Nome de usuário<input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder={currentUsername} autoCapitalize="none" autoComplete="username" maxLength={24} /></label>
            <small className="account-field-help">Aparece como @{username || currentUsername} e ajuda você a reconhecer a conta ativa. O login continua sendo feito pelo e-mail.</small>
            <label>Nova senha (opcional)<input type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
            <button className="primary-button" disabled={busy}>Salvar perfil e segurança</button>
          </form>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <div className="auth-actions">
            <button className="secondary-button" onClick={() => void auth.signOut()}>Sair</button>
            <button className="text-button danger" onClick={async () => {
              if (!window.confirm("Excluir sua conta e os dados sincronizados? O progresso local será preservado.")) return;
              setBusy(true);
              try {
                await auth.deleteAccount();
                setNotice("Conta online excluída. Seu progresso local foi preservado.");
              } catch (error) {
                setNotice(error instanceof Error ? error.message : "Não foi possível excluir.");
              } finally {
                setBusy(false);
              }
            }}>Excluir conta</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <div className="brand-mark" aria-hidden="true">B</div>
        <p className="eyebrow">BIBLIOLINGO</p>
        <h1>{mode === "signup" ? "Criar conta" : mode === "recovery" ? "Recuperar senha" : "Entrar"}</h1>
        <p>
          Continue como visitante ou entre para preparar a sincronização do progresso entre seus dispositivos.
        </p>
        {!auth.configured && (
          <p className="auth-warning" role="status">
            A conta online ainda não foi ativada neste ambiente. O estudo como visitante continua funcionando.
          </p>
        )}
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>Nome<input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>
          )}
          <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          {mode !== "recovery" && (
            <label>Senha<input type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          )}
          <button className="primary-button" disabled={busy || !auth.configured}>
            {busy ? "Aguarde…" : mode === "signup" ? "Criar conta" : mode === "recovery" ? "Enviar instruções" : "Entrar"}
          </button>
        </form>
        {(auth.googleEnabled || auth.facebookEnabled) && <div className="auth-divider"><span>ou</span></div>}
        {auth.googleEnabled && <button className="secondary-button" onClick={() => auth.beginOAuth("google")}>Continuar com Google</button>}
        {auth.facebookEnabled && <button className="secondary-button" onClick={() => auth.beginOAuth("facebook")}>Continuar com Facebook</button>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <div className="auth-links">
          {mode !== "login" && <button className="text-button" onClick={() => setMode("login")}>Já tenho conta</button>}
          {mode !== "signup" && <button className="text-button" onClick={() => setMode("signup")}>Criar conta</button>}
          {mode !== "recovery" && <button className="text-button" onClick={() => setMode("recovery")}>Esqueci a senha</button>}
        </div>
        <Link className="text-button auth-guest" to="/">Continuar como visitante</Link>
      </section>
    </main>
  );
}
