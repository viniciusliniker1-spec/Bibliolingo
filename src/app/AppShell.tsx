import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const navigation = [
  { to: "/", icon: "⌁", label: "Jornada" },
  { to: "/bible", icon: "▤", label: "Bíblia" },
  { to: "/study", icon: "✦", label: "Estudar" },
  { to: "/achievements", icon: "★", label: "Conquistas" },
  { to: "/profile", icon: "◉", label: "Perfil" }
];

export function AppShell() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();

  useEffect(() => {
    const handle = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handle);
    return () => window.removeEventListener("beforeinstallprompt", handle);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(undefined);
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <NavLink to="/" className="brand-lockup small" aria-label="Bibliolingo, página inicial">
          <div className="brand-mark" aria-hidden="true">B</div><span>Bibliolingo</span>
        </NavLink>
        {installPrompt && <button className="install-button" onClick={install}>Instalar</button>}
      </header>
      <Outlet />
      <nav className="bottom-nav" aria-label="Navegação principal">
        {navigation.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}>
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
