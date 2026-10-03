interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  tone?: "gold" | "aqua" | "rose";
}

export function ProgressBar({ value, max = 1, label, tone = "aqua" }: ProgressBarProps) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    <div className="progress-wrap">
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(value, max)}>
        <span className={"progress-fill " + tone} style={{ width: Math.round(ratio * 100) + "%" }} />
      </div>
    </div>
  );
}
