import { useMemo, useState } from "react";

interface ReadableBlockProps {
  text: string;
  limit?: number;
  className?: string;
}

export function ReadableBlock({ text, limit = 60, className = "" }: ReadableBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const collapsible = words.length > limit;
  const visible = collapsible && !expanded ? words.slice(0, limit).join(" ") + "…" : text;

  return (
    <div className={"readable-block " + className}>
      <p>{visible}</p>
      {collapsible && (
        <button
          type="button"
          className="read-more-button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Ler menos" : "Ler mais"}
        </button>
      )}
    </div>
  );
}
