import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { RecordMark } from "./lib/types";
import { shortName, teamOfPlayer, teams } from "./data";
import { initials, photoPath, photoSources } from "./lib/photos";

export function TeamDot({ id }: { id: string }) {
  return <span className={`tdot ${id}`} aria-hidden="true" />;
}

export function TeamChip({ id, short }: { id: string; short?: boolean }) {
  return (
    <span className="tchip">
      <TeamDot id={id} />
      {short ? shortName(id) : teams[id]?.name}
    </span>
  );
}

/** Round headshot with a team-colour ring. Tries the self-hosted copy, then the original source, then shows initials. */
export function Avatar({ name, size = 22 }: { name: string; size?: number }) {
  const local = photoPath(name);
  const remote = photoSources[name];
  const [step, setStep] = useState(0);
  const src = step === 0 ? local : step === 1 ? remote : null;
  const team = teamOfPlayer.get(name) ?? "";
  return (
    <span className={`av ${team}`} style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.4)) }} aria-hidden="true">
      {initials(name)}
      {src && <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" onError={() => setStep((n) => n + 1)} />}
    </span>
  );
}

export function Pill({ kind, children }: { kind: "adv" | "out" | "exp"; children: ReactNode }) {
  return <span className={`pill ${kind}`}>{children}</span>;
}

export function RecordChips({ marks }: { marks: RecordMark[] }) {
  const words = { W: "win", H: "halved", L: "loss" };
  return (
    <span className="rec" aria-label={marks.map((m) => words[m]).join(", ")}>
      {marks.map((m, i) => (
        <i key={i} className={m} aria-hidden="true">
          {m}
        </i>
      ))}
    </span>
  );
}

export function playerHref(name: string) {
  return `/matches?player=${encodeURIComponent(name)}`;
}

export function PlayerLink({ name, className, children }: { name: string; className?: string; children?: ReactNode }) {
  return (
    <Link to={playerHref(name)} className={className}>
      {children ?? name}
    </Link>
  );
}

export function SecHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="sec-head">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Chips({ value, options, onChange, label }: { value: string; options: [string, string][]; onChange: (v: string) => void; label: string }) {
  return (
    <div className="chipset" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}
