import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bibleBooks } from "../content/bible/catalog";
import { getBiblePreview, type BiblePreviewVerse } from "../domain/biblePreview";
import { bibleAnnotationId } from "../domain/bibleReference";
import {
  BIBLE_TRANSLATION,
  loadBibleBook,
  type BibleBookData
} from "../services/bible";
import { useApp } from "../state/AppContext";
import type { BibleReference } from "../types/content";
import type { BibleAnnotation } from "../types/progress";

interface BibleReferencePreviewProps {
  reference: BibleReference;
  fullHref?: string;
  onClose: () => void;
}

export function BibleReferencePreview({
  reference,
  fullHref,
  onClose
}: BibleReferencePreviewProps) {
  const { state, dispatch } = useApp();
  const book = bibleBooks.find((item) => item.id === reference.bookId);
  const [data, setData] = useState<BibleBookData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<BiblePreviewVerse>();
  const [draftNote, setDraftNote] = useState("");
  const [notice, setNotice] = useState<string>();

  const preview = useMemo(
    () => (data ? getBiblePreview(data, reference) : { verses: [], truncated: false }),
    [data, reference]
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  useEffect(() => {
    if (!book) {
      setLoading(false);
      setError("Esta referência ainda não está disponível no leitor.");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    loadBibleBook(book, controller.signal)
      .then(setData)
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(
          navigator.onLine
            ? "Não foi possível carregar a passagem agora."
            : "Abra este livro uma vez online para usar a prévia offline."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [book]);

  useEffect(() => {
    const first = preview.verses[0];
    if (!first) return;
    setSelected((current) =>
      current && preview.verses.some(
        (verse) => verse.chapter === current.chapter && verse.number === current.number
      )
        ? current
        : first
    );
  }, [preview]);

  const annotationId = selected && book
    ? bibleAnnotationId(
        BIBLE_TRANSLATION.id,
        book.osis,
        selected.chapter,
        selected.number
      )
    : undefined;
  const annotation = annotationId ? state.bibleAnnotations[annotationId] : undefined;

  useEffect(() => {
    setDraftNote(annotation?.note ?? "");
  }, [annotationId, annotation?.note]);

  const saveAnnotation = (bookmarked: boolean, note = draftNote) => {
    if (!selected || !book || !annotationId) return;
    const next: BibleAnnotation = {
      id: annotationId,
      translationId: BIBLE_TRANSLATION.id,
      bookOsis: book.osis,
      bookName: book.name,
      chapter: selected.chapter,
      verse: selected.number,
      note: note.trim(),
      bookmarked,
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: "UPSERT_BIBLE_ANNOTATION", annotation: next });
  };

  return (
    <div
      className="bible-preview-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="bible-preview-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bible-preview-title"
      >
        <header className="bible-preview-header">
          <div>
            <p className="eyebrow">Prévia da Bíblia · {BIBLE_TRANSLATION.shortName}</p>
            <h2 id="bible-preview-title">{reference.label}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Fechar passagem" onClick={onClose} autoFocus>
            ×
          </button>
        </header>

        {loading && (
          <div className="preview-state">
            <div className="brand-mark pulse">B</div>
            <p>Carregando a passagem…</p>
          </div>
        )}
        {error && (
          <div className="preview-state">
            <strong>Passagem indisponível</strong>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="preview-verses">
              {preview.verses.map((verse) => {
                const active =
                  selected?.chapter === verse.chapter &&
                  selected.number === verse.number;
                return (
                  <button
                    type="button"
                    className={"preview-verse " + (active ? "active" : "")}
                    key={verse.chapter + ":" + verse.number}
                    aria-pressed={active}
                    onClick={() => setSelected(verse)}
                  >
                    <span>{verse.chapter}:{verse.number}</span>
                    <p>{verse.text}</p>
                  </button>
                );
              })}
              {preview.truncated && (
                <p className="preview-truncated">A prévia foi abreviada para manter o foco da lição.</p>
              )}
            </div>

            {selected && (
              <section className="preview-note-card" aria-label={"Nota em " + selected.chapter + ":" + selected.number}>
                <div className="preview-note-heading">
                  <strong>{book?.name} {selected.chapter}:{selected.number}</strong>
                  <button
                    type="button"
                    className={"bookmark-button " + (annotation?.bookmarked ? "active" : "")}
                    aria-pressed={Boolean(annotation?.bookmarked)}
                    onClick={() => {
                      saveAnnotation(!annotation?.bookmarked);
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
                    rows={3}
                    placeholder="Anote uma observação sem sair da lição…"
                    onChange={(event) => setDraftNote(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="small-button"
                  onClick={() => {
                    saveAnnotation(Boolean(annotation?.bookmarked));
                    setNotice(draftNote.trim() ? "Nota salva neste aparelho." : "Nota removida.");
                  }}
                >
                  Salvar nota
                </button>
                {notice && <p className="preview-notice" role="status">{notice}</p>}
              </section>
            )}
          </>
        )}

        <footer className="bible-preview-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Voltar à tarefa</button>
          {fullHref && <Link className="primary-button preview-full-link" to={fullHref}>Abrir capítulo completo</Link>}
        </footer>
      </section>
    </div>
  );
}
