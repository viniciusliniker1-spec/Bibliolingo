import { useState } from "react";
import { useNavigate } from "react-router-dom";

const chapters = [
  { chapter: 1, title: "Criação e ordem", themes: ["criação", "bondade", "imagem de Deus"] },
  { chapter: 2, title: "Jardim e vocação", themes: ["descanso", "trabalho", "comunhão"] },
  { chapter: 3, title: "Queda e esperança", themes: ["tentação", "ruptura", "graça"] }
];

export function Bible() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const visible = chapters.filter((item) =>
    (item.title + " " + item.themes.join(" ")).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="page bible-page">
      <header className="page-header"><p className="eyebrow">Biblioteca</p><h1>Bíblia</h1></header>
      <div className="testament-tabs" role="tablist" aria-label="Testamento">
        <button role="tab" aria-selected="true">Antigo Testamento</button>
        <button role="tab" aria-selected="false" disabled>Novo Testamento</button>
      </div>
      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Buscar nos capítulos disponíveis</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tema em Gênesis 1–3" />
      </label>
      <section className="book-card">
        <div className="book-monogram" aria-hidden="true">Gn</div>
        <div><p className="eyebrow">Livro piloto</p><h2>Gênesis</h2><p>3 capítulos disponíveis para estudo</p></div>
      </section>
      <div className="chapter-list">
        {visible.map((item) => (
          <article className="chapter-card" key={item.chapter}>
            <span className="chapter-number">{item.chapter}</span>
            <div><h3>{item.title}</h3><p>{item.themes.join(" · ")}</p></div>
            <button className="small-button" onClick={() => navigate("/")}>Ver jornada</button>
          </article>
        ))}
      </div>
      {!visible.length && <div className="empty-card">Nenhum tema disponível corresponde à busca.</div>}
      <aside className="license-note">
        <strong>Texto bíblico e licenças</strong>
        <p>Esta fase traz referências e material pedagógico, sem incorporar uma tradução integral protegida. O leitor será ativado após selecionar uma tradução com licença compatível.</p>
      </aside>
    </main>
  );
}
