import { useState, type FormEvent, type ReactNode } from "react";

export const FORMATION_ACCESS_CODE = "12345";
export const FORMATION_ACCESS_SESSION_KEY = "bibliolingo:formation-access";

export function isValidFormationAccessCode(value: string) {
  return value === FORMATION_ACCESS_CODE;
}

function hasSessionAccess() {
  try {
    return window.sessionStorage.getItem(FORMATION_ACCESS_SESSION_KEY) === "granted";
  } catch {
    return false;
  }
}

export function FormationAccessGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(hasSessionAccess);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (unlocked) return <>{children}</>;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidFormationAccessCode(code.trim())) {
      setError("Senha incorreta. Confira os cinco números e tente novamente.");
      return;
    }
    try {
      window.sessionStorage.setItem(FORMATION_ACCESS_SESSION_KEY, "granted");
    } catch {
      // O acesso continua válido nesta renderização quando o armazenamento está indisponível.
    }
    setError("");
    setUnlocked(true);
  };

  return (
    <main className="page formation-access-page">
      <section className="formation-access-card" aria-labelledby="formation-access-title">
        <span className="formation-entry-icon" aria-hidden="true">N</span>
        <p className="eyebrow">Área de acesso protegido</p>
        <h1 id="formation-access-title">Formação Pastoral Nazarena</h1>
        <p>Digite a senha de acesso para abrir as matérias, avaliações e o simulado pastoral.</p>
        <form onSubmit={submit} className="formation-access-form">
          <label htmlFor="formation-access-code">Senha</label>
          <input
            id="formation-access-code"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (error) setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "formation-access-error" : undefined}
            maxLength={5}
            autoFocus
          />
          {error && <p id="formation-access-error" className="formation-access-error" role="alert">{error}</p>}
          <button type="submit" className="primary-button" disabled={!code.trim()}>
            Acessar formação
          </button>
        </form>
        <a className="text-button" href="#/study">Voltar para Estudar</a>
      </section>
    </main>
  );
}
