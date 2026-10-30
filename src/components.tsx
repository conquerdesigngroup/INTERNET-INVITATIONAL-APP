import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { RecordMark } from "./lib/types";
import { shortName, teams } from "./data";

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
