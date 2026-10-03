import { useEffect, useMemo, useState } from "react";
import { bibleBooks, bibleBookByOsis, type BibleTestament } from "../../content/bible/catalog";
import {
  BIBLE_TRANSLATION,
  loadBibleBook,
  type BibleBookData,
  type BibleVerse
} from "../../services/bible";

const READING_KEY = "bibliolingo:bible-location";

function readLocation() {
  try {
    const value = JSON.parse(localStorage.getItem(READING_KEY) ?? "null") as {
      book?: string;
      chapter?: number;
    } | null;
    return {
      book: value?.book && bibleBookByOsis.has(value.book) ? value.book : "Gen",
      chapter: Math.max(1, Number(value?.chapter) || 1)
    };
  } catch {
    return { book: "Gen", chapter: 1 };
  }
}

function legacyCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.readOnly = true;
  area.style.position = "fixed";
  area.style.opacity = "0.01";
  document.body.appendChild(area);
  area.focus({ preventScroll: true });
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied;
}

async function copyText(text: string) {
  if (legacyCopy(text)) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error("copy-failed");
}

export function Bible() {
  const initial = useMemo(readLocation, []);
  const initialBook = bibleBookByOsis.get(initial.book) ?? bibleBooks[0];
  const [testament, setTestament] = useState<BibleTestament>(initialBook.testament);
  const [bookOsis, setBookOsis] = useState(initialBook.osis);
  const [chapterNumber, setChapterNumber] = useState(Math.min(initial.chapter, initialBook.chapters));
  const [bookData, setBookData] = useState<BibleBookData>();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const selectedBook = bibleBookByOsis.get(bookOsis) ?? bibleBooks[0];
  const testamentBooks = bibleBooks.filter((book) => book.testament === testament);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    setBookData(undefined);
    loadBibleBook(selectedBook, controller.signal)
      .then(setBookData)
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(
          navigator.onLine
            ? reason instanceof Error
              ? reason.message
              : "Não foi possível carregar este livro."
            : "Este livro ainda não foi aberto neste aparelho. Conecte-se uma vez para disponibilizá-lo offline."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selectedBook.osis]);

  useEffect(() => {
    try {
      localStorage.setItem(
        READING_KEY,
        JSON.stringify({ book: selectedBook.osis, chapter: chapterNumber })
      );
    } catch {
      // A leitura continua mesmo quando preferências locais estão indisponíveis.
    }
  }, [selectedBook.osis, chapterNumber]);

  const chapter = bookData?.chapters.find((item) => item.chapter === chapterNumber);
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const visibleVerses = (chapter?.verses ?? []).filter(
    (verse) =>
      !normalizedQuery ||
      String(verse.number) === normalizedQuery ||
      verse.text.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
  );

  const selectTestament = (next: BibleTestament) => {
    setTestament(next);
    const first = bibleBooks.find((book) => book.testament === next);
    if (first && selectedBook.testament !== next) {
      setBookOsis(first.osis);
      setChapterNumber(1);
      setQuery("");
    }
  };

  const selectBook = (osis: string) => {
    const book = bibleBookByOsis.get(osis);
    if (!book) return;
    setBookOsis(osis);
    setChapterNumber(1);
    setQuery("");
  };

  const moveChapter = (direction: -1 | 1) => {
    const currentBookIndex = bibleBooks.findIndex((book) => book.osis === selectedBook.osis);
    const candidate = chapterNumber + direction;
    if (candidate >= 1 && candidate <= selectedBook.chapters) {
      setChapterNumber(candidate);
    } else {
      const nextBook = bibleBooks[currentBookIndex + direction];
      if (!nextBook) return;
      setTestament(nextBook.testament);
      setBookOsis(nextBook.osis);
      setChapterNumber(direction === 1 ? 1 : nextBook.chapters);
    }
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verseText = (verse: BibleVerse) =>
    selectedBook.name +
    " " +
    chapterNumber +
    ":" +
    verse.number +
    " — " +
    verse.text +
    " (" +
    BIBLE_TRANSLATION.shortName +
    ")";

  const copyVerse = async (verse: BibleVerse) => {
    try {
      await copyText(verseText(verse));
      setNotice("Versículo copiado.");
    } catch {
      setNotice("Não foi possível copiar. Verifique a permissão da área de transferência.");
    }
  };

  const shareVerse = async (verse: BibleVerse) => {
    const text = verseText(verse);
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedBook.name + " " + chapterNumber + ":" + verse.number, text });
        return;
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
      }
    }
    await copyVerse(verse);
  };

  return (
    <main className="page bible-page">
      <header className="page-header">
        <p className="eyebrow">66 livros · leitura por demanda</p>
        <h1>Bíblia</h1>
      </header>

      <section className="translation-card">
        <div>
          <p className="eyebrow">Tradução ativa</p>
          <h2>{BIBLE_TRANSLATION.name}</h2>
          <p>{BIBLE_TRANSLATION.license} · fonte aberta versionada</p>
        </div>
        <span className="public-domain-badge">uso livre</span>
      </section>

      <div className="testament-tabs" role="tablist" aria-label="Testamento">
        <button type="button" role="tab" aria-selected={testament === "old"} onClick={() => selectTestament("old")}>
          Antigo Testamento
        </button>
        <button type="button" role="tab" aria-selected={testament === "new"} onClick={() => selectTestament("new")}>
          Novo Testamento
        </button>
      </div>

      <section className="reader-controls" aria-label="Selecionar passagem">
        <label>
          <span>Livro</span>
          <select value={selectedBook.osis} onChange={(event) => selectBook(event.target.value)}>
            {testamentBooks.map((book) => (
              <option value={book.osis} key={book.osis}>{book.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Capítulo</span>
          <select
            value={chapterNumber}
            onChange={(event) => {
              setChapterNumber(Number(event.target.value));
              setQuery("");
            }}
          >
            {Array.from({ length: selectedBook.chapters }, (_, index) => index + 1).map((number) => (
              <option value={number} key={number}>{number}</option>
            ))}
          </select>
        </label>
      </section>

      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Buscar no capítulo atual</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={"Buscar em " + selectedBook.name + " " + chapterNumber}
        />
      </label>

      <section className="bible-reader" aria-live="polite">
        <header className="reader-heading">
          <div>
            <p className="eyebrow">{BIBLE_TRANSLATION.shortName}</p>
            <h2>{selectedBook.name} {chapterNumber}</h2>
          </div>
          <span>{chapter?.verses.length ?? 0} versículos</span>
        </header>

        {loading && <div className="reader-state"><div className="brand-mark pulse">B</div><p>Carregando o livro…</p></div>}
        {error && (
          <div className="reader-state">
            <strong>Conteúdo indisponível</strong>
            <p>{error}</p>
            <button type="button" className="secondary-button" onClick={() => selectBook(selectedBook.osis)}>
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="verse-list">
            {visibleVerses.map((verse) => (
              <article className="verse-row" key={verse.number}>
                <button
                  type="button"
                  className="verse-number"
                  aria-label={"Copiar " + selectedBook.name + " " + chapterNumber + ":" + verse.number}
                  onClick={() => copyVerse(verse)}
                >
                  {verse.number}
                </button>
                <p>{verse.text}</p>
                <button
                  type="button"
                  className="verse-share"
                  aria-label={"Compartilhar versículo " + verse.number}
                  onClick={() => shareVerse(verse)}
                >
                  ↗
                </button>
              </article>
            ))}
            {!visibleVerses.length && <div className="empty-card">Nenhum versículo corresponde à busca neste capítulo.</div>}
          </div>
        )}
      </section>

      <nav className="chapter-navigation" aria-label="Navegação entre capítulos">
        <button type="button" className="secondary-button" disabled={selectedBook.osis === "Gen" && chapterNumber === 1} onClick={() => moveChapter(-1)}>
          ← Anterior
        </button>
        <button type="button" className="primary-button" disabled={selectedBook.osis === "Rev" && chapterNumber === 22} onClick={() => moveChapter(1)}>
          Próximo →
        </button>
      </nav>

      <aside className="license-note">
        <strong>Licença e procedência</strong>
        <p>
          Almeida 1819 em domínio público, fornecida pelo projeto Midvash Bible Data.
          A ARA é protegida por direitos autorais e só poderá ser adicionada mediante autorização do titular.
          Livros abertos ficam no cache para releitura offline.
        </p>
        <a href={BIBLE_TRANSLATION.sourceUrl} target="_blank" rel="noreferrer">Consultar fonte e licença</a>
      </aside>

      {notice && (
        <div className="toast" role="status">
          {notice}
          <button type="button" aria-label="Fechar aviso" onClick={() => setNotice(undefined)}>×</button>
        </div>
      )}
    </main>
  );
}
