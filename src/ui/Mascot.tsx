export type MascotMood = "neutral" | "happy" | "thinking" | "sad" | "celebrate";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  decorative?: boolean;
}

const moodLabels: Record<MascotMood, string> = {
  neutral: "Mascote do Bibliolingo",
  happy: "Mascote feliz",
  thinking: "Mascote pensando",
  sad: "Mascote encorajador",
  celebrate: "Mascote celebrando"
};

export function Mascot({
  mood = "neutral",
  size = 112,
  className = "",
  decorative = false
}: MascotProps) {
  const happy = mood === "happy" || mood === "celebrate";
  const thoughtful = mood === "thinking";
  const sad = mood === "sad";
  return (
    <svg
      className={"mascot mascot-" + mood + " " + className}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : moodLabels[mood]}
    >
      <circle className="mascot-halo" cx="60" cy="60" r="54" />
      {mood === "celebrate" && (
        <g className="mascot-confetti" aria-hidden="true">
          <path d="M18 28l7 4M99 25l-7 5M15 72l8-2M104 71l-8-2" />
          <path d="M35 13l2 8M83 13l-2 8" />
        </g>
      )}
      <circle className="mascot-face" cx="60" cy="61" r="38" />
      <path className="mascot-ear" d="M27 51c-11-5-13 15-2 19 5 2 9-2 10-8" />
      <path className="mascot-ear" d="M93 51c11-5 13 15 2 19-5 2-9-2-10-8" />
      <path className="mascot-hair" d="M40 31c5-14 18-11 20-1 5-12 20-11 22 3" />
      {happy ? (
        <>
          <path className="mascot-eye" d="M42 58q6-7 12 0" />
          <path className="mascot-eye" d="M66 58q6-7 12 0" />
          <path className="mascot-mouth" d="M45 72q15 16 30 0" />
        </>
      ) : (
        <>
          <circle className="mascot-eye-fill" cx="49" cy="58" r="3.5" />
          <circle className="mascot-eye-fill" cx="72" cy="58" r="3.5" />
          {thoughtful && <path className="mascot-brow" d="M42 49l12-2M66 47l12 2" />}
          <path
            className="mascot-mouth"
            d={sad ? "M48 78q12-9 24 0" : thoughtful ? "M50 76q10 5 20 0" : "M50 74q10 8 20 0"}
          />
        </>
      )}
      {thoughtful && <circle className="mascot-thought" cx="98" cy="35" r="4" />}
    </svg>
  );
}
