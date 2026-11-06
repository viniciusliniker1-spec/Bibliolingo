import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { BibleStudyNote, StudyNoteBlock, StudyNoteBlockType } from "../../types/progress";

const BLOCKS: { type: StudyNoteBlockType; label: string; command: string }[] = [
  { type: "paragraph", label: "Texto", command: "/texto" },
  { type: "heading", label: "Título", command: "/titulo" },
  { type: "list", label: "Lista", command: "/lista" },
  { type: "quote", label: "Citação", command: "/citacao" },
  { type: "table", label: "Tabela", command: "/tabela" },
  { type: "passage", label: "Passagem bíblica", command: "/passagem" }
];

function uid(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function createBlock(type: StudyNoteBlockType, reference?: string): StudyNoteBlock {
  const now = new Date().toISOString();
  return { id: uid("block"), type, content: "", reference: type === "passage" ? reference : undefined, createdAt: now, updatedAt: now };
}

function createNote(bookOsis: string, bookName: string, chapter: number): BibleStudyNote {
  const now = new Date().toISOString();
  return { id: uid("note"), title: bookName + " " + chapter, bookOsis, bookName, chapter, pinned: false, blocks: [createBlock("paragraph")], comments: [], createdAt: now, updatedAt: now };
}

export function BibleStudyNotebook({ open, onClose, bookOsis, bookName, chapter, verse, notes, onSave, onRemove }: {
  open: boolean;
  onClose: () => void;
  bookOsis: string;
  bookName: string;
  chapter: number;
  verse?: number;
  notes: BibleStudyNote[];
  onSave: (note: BibleStudyNote) => void;
  onRemove: (noteId: string) => void;
}) {
  const chapterNotes = useMemo(() => notes
    .filter((note) => note.bookOsis === bookOsis && note.chapter === chapter)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)), [bookOsis, chapter, notes]);
  const [draft, setDraft] = useState(() => chapterNotes[0] ?? createNote(bookOsis, bookName, chapter));
  const [command, setCommand] = useState("");
  const [verseComment, setVerseComment] = useState("");
  const [notice, setNotice] = useState("");
  const reference = bookName + " " + chapter + (verse ? ":" + verse : "");

  useEffect(() => {
    if (!open) return;
    setDraft(chapterNotes[0] ?? createNote(bookOsis, bookName, chapter));
    setNotice("");
  }, [open, bookOsis, bookName, chapter, verse]);

  if (!open) return null;
  const touch = (next: BibleStudyNote) => setDraft({ ...next, updatedAt: new Date().toISOString() });
  const addBlock = (type: StudyNoteBlockType) => {
    touch({ ...draft, blocks: [...draft.blocks, createBlock(type, reference)] });
    setCommand("");
  };
  const updateBlock = (blockId: string, patch: Partial<StudyNoteBlock>) => touch({
    ...draft,
    blocks: draft.blocks.map((block) => block.id === blockId ? { ...block, ...patch, updatedAt: new Date().toISOString() } : block)
  });
  const submitCommand = (event: FormEvent) => {
    event.preventDefault();
    const selected = BLOCKS.find((item) => item.command === command.trim().toLocaleLowerCase("pt-BR"));
    if (selected) addBlock(selected.type);
    else if (command.trim()) {
      const block = createBlock("paragraph");
      touch({ ...draft, blocks: [...draft.blocks, { ...block, content: command.trim() }] });
      setCommand("");
    }
  };
  const addVerseComment = () => {
    if (!verse || !verseComment.trim()) return;
    const now = new Date().toISOString();
    touch({ ...draft, comments: [...draft.comments, { id: uid("comment"), anchorVerse: verse, body: verseComment.trim(), createdAt: now, updatedAt: now }] });
    setVerseComment("");
  };

  return <aside className="web-study-notebook" aria-label={"Caderno de estudo de " + reference}>
    <header>
      <div><p className="eyebrow">Caderno de estudo</p><h2>{reference}</h2></div>
      <button type="button" className="text-button" onClick={onClose}>Fechar</button>
    </header>
    <div className="web-study-notebook-scroll">
      {chapterNotes.length > 0 && <nav aria-label="Notas deste capítulo">
        {chapterNotes.map((note) => <button type="button" key={note.id} className={note.id === draft.id ? "active" : ""} onClick={() => setDraft(note)}>
          {note.pinned ? "★ " : ""}{note.title}
        </button>)}
      </nav>}
      <div className="web-note-title">
        <input value={draft.title} onChange={(event) => touch({ ...draft, title: event.target.value })} placeholder="Título da nota" />
        <button type="button" className={draft.pinned ? "active" : ""} onClick={() => touch({ ...draft, pinned: !draft.pinned })}>{draft.pinned ? "★ Fixada" : "☆ Fixar"}</button>
      </div>
      {verse && <section className="web-verse-comments">
        <h3>Comentários em {reference}</h3>
        {draft.comments.filter((comment) => comment.anchorVerse === verse).map((comment) => <blockquote key={comment.id}>
          <p>{comment.body}</p>
          <button type="button" className="text-button" onClick={() => touch({ ...draft, comments: draft.comments.filter((item) => item.id !== comment.id) })}>Excluir</button>
        </blockquote>)}
        <textarea value={verseComment} onChange={(event) => setVerseComment(event.target.value)} placeholder="Comentário ligado a este versículo" rows={3} />
        <button type="button" className="secondary-button" onClick={addVerseComment}>Adicionar ao versículo</button>
      </section>}
      <section className="web-note-blocks">
        {draft.blocks.map((block) => <article key={block.id} data-block-type={block.type}>
          <header><strong>{BLOCKS.find((item) => item.type === block.type)?.label ?? block.type}</strong><button type="button" className="text-button" onClick={() => touch({ ...draft, blocks: draft.blocks.filter((item) => item.id !== block.id), comments: draft.comments.filter((item) => item.anchorBlockId !== block.id) })}>Remover</button></header>
          {block.type === "passage" && <input value={block.reference ?? ""} onChange={(event) => updateBlock(block.id, { reference: event.target.value })} placeholder="João 3:16" />}
          <textarea value={block.content} onChange={(event) => updateBlock(block.id, { content: event.target.value })} rows={block.type === "heading" ? 2 : 5} placeholder={block.type === "table" ? "Coluna 1 | Coluna 2" : "Escreva aqui…"} />
        </article>)}
      </section>
      {verse && <button type="button" className="secondary-button" onClick={() => addBlock("passage")}>Inserir passagem {reference}</button>}
      <form className="web-block-command" onSubmit={submitCommand}>
        <label htmlFor="note-command">Novo bloco</label>
        <input id="note-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder='Digite texto ou "/passagem"' />
        {command.startsWith("/") && <div>{BLOCKS.filter((item) => item.command.startsWith(command.toLocaleLowerCase("pt-BR"))).map((item) => <button type="button" key={item.command} onClick={() => addBlock(item.type)}>{item.label}<small>{item.command}</small></button>)}</div>}
        <button type="submit" className="secondary-button">Adicionar bloco</button>
      </form>
      {notice && <p className="web-note-notice" role="status">{notice}</p>}
      <button type="button" className="primary-button" onClick={() => { onSave({ ...draft, updatedAt: new Date().toISOString() }); setNotice("Nota salva na conta."); }}>Salvar nota</button>
      <button type="button" className="text-button danger" onClick={() => { onRemove(draft.id); setDraft(createNote(bookOsis, bookName, chapter)); setNotice("Nota removida."); }}>Excluir nota</button>
    </div>
  </aside>;
}
