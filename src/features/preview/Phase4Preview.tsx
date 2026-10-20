import { useState } from "react";
import { Link } from "react-router-dom";

const screens = [
  ["Início", "Meta semanal, próximo passo e desafios com hierarquia simples."],
  ["Trilhas", "Mapa dos 66 livros preservado, com progresso e bloqueios legíveis."],
  ["Lição", "Conteúdo, exercício e feedback no mesmo fluxo, sem alterar gabaritos."],
  ["Revisar", "Fila priorizada, motivo da revisão e ajuda contextual do Noah."],
  ["Professor Noah", "Tutor como apoio contextual, não como uma tela genérica de chat."],
  ["Conquistas", "Medalhas e marcos obtidos pelas regras existentes."],
  ["Comunidade", "Grupos por convite e metas coletivas, ainda sem publicar dados."],
  ["Perfil", "Identidade da conta, evolução e sincronização."],
  ["Notificações", "Categorias opcionais, horário principal e silêncio."]
] as const;

export function Phase4Preview() {
  const [active, setActive] = useState(0);
  const [dark, setDark] = useState(false);
  return (
    <main className={"phase4-preview " + (dark ? "preview-dark" : "")}>
      <header className="preview-header">
        <div><p>PRÉVIA ISOLADA · NÃO SUBSTITUI A INTERFACE ATUAL</p><h1>Bibliolingo Design System</h1><span>Identidade própria: confiável, acolhedora e orientada ao aprendizado.</span></div>
        <button type="button" onClick={() => setDark((value) => !value)}>{dark ? "Ver claro" : "Ver escuro"}</button>
      </header>
      <nav className="preview-tabs" aria-label="Telas propostas">
        {screens.map(([name], index) => <button type="button" aria-pressed={active === index} className={active === index ? "active" : ""} onClick={() => setActive(index)} key={name}>{name}</button>)}
      </nav>
      <section className="preview-stage">
        <aside className="preview-phone">
          <div className="preview-status"><strong>Bibliolingo</strong><span>7 dias · 420 XP</span></div>
          <div className="preview-hero"><small>{screens[active][0].toUpperCase()}</small><h2>{screens[active][0]}</h2><p>{screens[active][1]}</p><button>Continuar</button></div>
          <div className="preview-card"><span className="preview-icon">B</span><div><strong>Seu próximo passo</strong><p>Cards arredondados, foco visível e texto com contraste AA.</p></div></div>
          <div className="preview-progress"><span style={{ width: "68%" }} /></div>
          <div className="preview-card secondary"><div><strong>Professor Noah</strong><p>Explicações personalizadas com base no contexto autorizado.</p></div><button>Perguntar</button></div>
        </aside>
        <article className="preview-notes"><p className="eyebrow">Proposta selecionada</p><h2>{screens[active][0]}</h2><p>{screens[active][1]}</p><dl><div><dt>Verde</dt><dd>#21A675</dd></div><div><dt>Azul</dt><dd>#244B72</dd></div><div><dt>Dourado</dt><dd>#F5BC47</dd></div></dl><p>A comunidade aparece somente como proposta. Criar grupos ficará desativado até existirem banco, RLS e consentimento validados.</p></article>
      </section>
      <Link className="text-button" to="/profile">Voltar sem aplicar esta prévia</Link>
    </main>
  );
}
