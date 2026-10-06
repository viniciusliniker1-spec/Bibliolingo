import { Fragment, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bibleBooks, bibleBookByOsis, type BibleTestament } from "../../content/bible/catalog";
import {
  bibleAnnotationId,
  parseBibleReference
} from "../../domain/bibleReference";
import { isSafeTaskReturnPath } from "../../domain/bibleNavigation";
import {
  BIBLE_TRANSLATION,
  loadBibleBook,
  type BibleBookData,
  type BibleVerse
} from "../../services/bible";
import { useApp } from "../../state/AppContext";
import type { BibleAnnotation } from "../../types/progress";

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
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedBook = bibleBookByOsis.get(searchParams.get("book") ?? "");
  const requestedChapterValue = Number(searchParams.get("chapter"));
  const requestedChapter =
    requestedBook &&
    Number.isInteger(requestedChapterValue) &&
    requestedChapterValue >= 1 &&
    requestedChapterValue <= requestedBook.chapters
      ? requestedChapterValue
      : undefined;
  const requestedVerseValue = Number(searchParams.get("verse"));
  const requestedVerse =
    Number.isInteger(requestedVerseValue) && requestedVerseValue >= 1
      ? requestedVerseValue
      : undefined;
  const returnCandidate = searchParams.get("return");
  const returnTo = isSafeTaskReturnPath(returnCandidate) ? returnCandidate : undefined;
  const savedLocation =
    state.bibleLocation?.translationId === BIBLE_TRANSLATION.id
      ? state.bibleLocation
      : undefined;
  const initialBook =
    requestedBook ??
    bibleBookByOsis.get(savedLocation?.bookOsis ?? "Gen") ??
    bibleBooks[0];
  const initialChapter = requestedBook
    ? requestedChapter ?? 1
    : Math.min(savedLocation?.chapter ?? 1, initialBook.chapters);
  const initialVerse = requestedBook ? requestedVerse : savedLocation?.verse;

  const [testament, setTestament] = useState<BibleTestament>(initialBook.testament);
  const [bookOsis, setBookOsis] = useState(initialBook.osis);
  const [chapterNumber, setChapterNumber] = useState(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<number | undefined>(initialVerse);
  const [bookData, setBookData] = useState<BibleBookData>();
  const [query, setQuery] = useState("");
  const [referenceQuery, setReferenceQuery] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const selectedBook = bibleBookByOsis.get(bookOsis) ?? bibleBooks[0];
  const testamentBooks = bibleBooks.filter((book) => book.testament === testament);
  const chapter = bookData?.chapters.find((item) => item.chapter === chapterNumber);
  const annotations = useMemo(
    () =>
      Object.values(state.bibleAnnotations)
        .filter((item) => item.translationId === BIBLE_TRANSLATION.id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [state.bibleAnnotations]
  );

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
  }, [selectedBook.osis, retryKey]);

  useEffect(() => {
    dispatch({
      type: "SET_BIBLE_LOCATION",
      location: {
        translationId: BIBLE_TRANSLATION.id,
        bookOsis: selectedBook.osis,
        chapter: chapterNumber,
        verse: selectedVerse
      }
    });
  }, [chapterNumber, dispatch, selectedBook.osis, selectedVerse]);

  useEffect(() => {
    if (!chapter || !selectedVerse) return;
    const exists = chapter.verses.some((verse) => verse.number === selectedVerse);
    if (!exists) {
      setSelectedVerse(undefined);
      setNotice("Esse versículo não existe no capítulo informado.");
      return;
    }
    const id = bibleAnnotationId(
      BIBLE_TRANSLATION.id,
      selectedBook.osis,
      chapterNumber,
      selectedVerse
    );
    setDraftNote(state.bibleAnnotations[id]?.note ?? "");
    window.setTimeout(() => {
      document.getElementById("verse-" + selectedVerse)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 80);
  }, [chapter, chapterNumber, selectedBook.osis, selectedVerse]);

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
      setSelectedVerse(undefined);
      setQuery("");
    }
  };

  const selectBook = (osis: string) => {
    const book = bibleBookByOsis.get(osis);
    if (!book) return;
    setBookOsis(osis);
    setTestament(book.testament);
    setChapterNumber(1);
    setSelectedVerse(undefined);
    setQuery("");
  };

  const openReference = (book: typeof selectedBook, chapterValue: number, verse: number) => {
    setTestament(book.testament);
    setBookOsis(book.osis);
    setChapterNumber(chapterValue);
    setSelectedVerse(verse);
    setQuery("");
  };

  const searchReference = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseBibleReference(referenceQuery, selectedBook.osis, chapterNumber);
    if (!parsed) {
      setNotice("Referência não encontrada. Tente, por exemplo, João 3:16.");
      return;
    }
    openReference(parsed.book, parsed.chapter, parsed.verse);
    setReferenceQuery("");
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
    setSelectedVerse(undefined);
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
        await navigator.share({
          title: selectedBook.name + " " + chapterNumber + ":" + verse.number,
          text
        });
        return;
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
      }
    }
    await copyVerse(verse);
  };

  const annotationFor = (verse: number) =>
    state.bibleAnnotations[
      bibleAnnotationId(BIBLE_TRANSLATION.id, selectedBook.osis, chapterNumber, verse)
    ];

  const saveAnnotation = (verse: number, note: string, bookmarked: boolean) => {
    const id = bibleAnnotationId(
      BIBLE_TRANSLATION.id,
      selectedBook.osis,
      chapterNumber,
      verse
    );
    const annotation: BibleAnnotation = {
      id,
      translationId: BIBLE_TRANSLATION.id,
      bookOsis: selectedBook.osis,
      bookName: selectedBook.name,
      chapter: chapterNumber,
      verse,
      note: note.trim(),
      bookmarked,
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: "UPSERT_BIBLE_ANNOTATION", annotation });
  };

  const selectVerseForStudy = (verse: number) => {
    const current = annotationFor(verse);
    setSelectedVerse(verse);
    setDraftNote(current?.note ?? "");
  };

  return (
    <main className="page bible-page">
      {returnTo && (
        <button type="button" className="return-to-task" onClick={() => navigate(returnTo)}>
          <span aria-hidden="true">←</span>
          {returnTo.startsWith("/formation/") ? "Voltar à Formação Pastoral" : "Voltar à tarefa na jornada"}
        </button>
      )}
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

      <form className="reference-search" onSubmit={searchReference}>
        <label htmlFor="bible-reference">Ir diretamente ao versículo</label>
        <div>
          <input
            id="bible-reference"
            value={referenceQuery}
            onChange={(event) => setReferenceQuery(event.target.value)}
            placeholder="Ex.: João 3:16 ou Jo 3:16"
            inputMode="search"
          />
          <button type="submit" className="small-button">Buscar</button>
        </div>
        <small>Você também pode digitar 3:16 no livro atual ou apenas o número do versículo.</small>
      </form>

      {annotations.length > 0 && (
        <details className="saved-verses">
          <summary>
            <span>★</span>
            <strong>Minhas marcações e notas</strong>
            <small>{annotations.length}</small>
          </summary>
          <div>
            {annotations.map((annotation) => (
              <button
                type="button"
                key={annotation.id}
                onClick={() => {
                  const book = bibleBookByOsis.get(annotation.bookOsis);
                  if (book) openReference(book, annotation.chapter, annotation.verse);
                }}
              >
                <span>{annotation.bookName} {annotation.chapter}:{annotation.verse}</span>
                <small>
                  {annotation.note || (annotation.bookmarked ? "Versículo marcado" : "Nota salva")}
                </small>
              </button>
            ))}
          </div>
        </details>
      )}

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
              setSelectedVerse(undefined);
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
        <span className="sr-only">Buscar palavra no capítulo atual</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={"Buscar palavra em " + selectedBook.name + " " + chapterNumber}
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
            <button type="button" className="secondary-button" onClick={() => setRetryKey((value) => value + 1)}>
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="verse-list">
            {visibleVerses.map((verse) => {
              const annotation = annotationFor(verse.number);
              const selected = selectedVerse === verse.number;
              return (
                <Fragment key={verse.number}>
                  <article
                    id={"verse-" + verse.number}
                    className={"verse-row " + (selected ? "selected" : "")}
                  >
                    <button
                      type="button"
                      className="verse-content"
                      aria-expanded={selected}
                      onClick={() => selectVerseForStudy(verse.number)}
                    >
                      <span className="verse-number">{verse.number}</span>
                      <span>{verse.text}</span>
                      {(annotation?.bookmarked || annotation?.note) && (
                        <span className="verse-mark" aria-label="Versículo com marcação ou nota">
                          {annotation.bookmarked ? "★" : "●"}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="verse-share"
                      aria-label={"Compartilhar versículo " + verse.number}
                      onClick={() => shareVerse(verse)}
                    >
                      ↗
                    </button>
                  </article>
                  {selected && (
                    <section className="verse-editor" aria-label={"Anotações para o versículo " + verse.number}>
                      <div className="verse-editor-heading">
                        <strong>{selectedBook.name} {chapterNumber}:{verse.number}</strong>
                        <button
                          type="button"
                          className={"bookmark-button " + (annotation?.bookmarked ? "active" : "")}
                          aria-pressed={Boolean(annotation?.bookmarked)}
                          onClick={() => {
                            saveAnnotation(verse.number, annotation?.note ?? "", !annotation?.bookmarked);
                            setNotice(annotation?.bookmarked ? "Marcação removida." : "Versículo marcado.");
                          }}
                        >
                          {annotation?.bookmarked ? "★ Marcado" : "☆ Marcar"}
                        </button>
                      </div>
                      <label>
                        <span>Minha nota</span>
                        <textarea
                          value={draftNote}
                          maxLength={10000}
                          rows={4}
                          placeholder="Escreva sua observação, oração ou ponto de estudo…"
                          onChange={(event) => setDraftNote(event.target.value)}
                        />
                      </label>
                      <div className="verse-editor-actions">
                        <button type="button" className="text-button" onClick={() => copyVerse(verse)}>Copiar</button>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => {
                            saveAnnotation(verse.number, draftNote, Boolean(annotation?.bookmarked));
                            setNotice(draftNote.trim() ? "Nota salva neste aparelho." : "Nota removida.");
                          }}
                        >
                          Salvar nota
                        </button>
                      </div>
                    </section>
                  )}
                </Fragment>
              );
            })}
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
          Notas, marcações e última leitura ficam salvas localmente e fazem parte do backup do progresso.
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
