import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppShell } from "./app/AppShell";
import { Achievements } from "./features/achievements/Achievements";
import { Bible } from "./features/bible/Bible";
import { Home } from "./features/journey/Home";
import { LessonPlayer } from "./features/lesson/LessonPlayer";
import { Onboarding } from "./features/onboarding/Onboarding";
import { Profile } from "./features/profile/Profile";
import { Study } from "./features/review/Study";
import { AppProvider, useApp } from "./state/AppContext";

const FormationHub = lazy(() =>
  import("./features/formation/FormationHub").then((module) => ({ default: module.FormationHub }))
);
const FormationPlayer = lazy(() =>
  import("./features/formation/FormationPlayer").then((module) => ({ default: module.FormationPlayer }))
);

function LazyScreen({ children }: { children: ReactNode }) {
  return <Suspense fallback={<main className="loading-state"><div className="brand-mark pulse">B</div><p>Preparando o conteúdo…</p></main>}>{children}</Suspense>;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Bibliolingo render error", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <main className="center-state">
          <div className="brand-mark">B</div>
          <h1>Algo não saiu como esperado</h1>
          <p>Seu progresso salvo continua seguro. Recarregue para tentar novamente.</p>
          <button className="primary-button" onClick={() => window.location.reload()}>Recarregar</button>
        </main>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="center-state">
      <div className="brand-mark">?</div>
      <h1>Página não encontrada</h1>
      <p>O caminho informado não existe nesta versão.</p>
      <button className="primary-button" onClick={() => navigate("/")}>Ir para a jornada</button>
    </main>
  );
}

function Application() {
  const { state, ready, storageError } = useApp();
  if (!ready) {
    return <main className="loading-state"><div className="brand-mark pulse">B</div><p>Preparando sua jornada…</p></main>;
  }
  if (!state.profile.onboarded) return <Onboarding />;

  return (
    <>
      {storageError && <div className="storage-banner" role="alert">{storageError}</div>}
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="bible" element={<Bible />} />
          <Route path="study" element={<Study />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="profile" element={<Profile />} />
          <Route path="formation" element={<LazyScreen><FormationHub /></LazyScreen>} />
        </Route>
        <Route path="lesson/:activityId" element={<LessonPlayer />} />
        <Route path="formation/activity/:activityId" element={<LazyScreen><FormationPlayer /></LazyScreen>} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppProvider>
          <Application />
        </AppProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
