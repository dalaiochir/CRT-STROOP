"use client";

export default function Grid33({ cells }: { cells: boolean[] }) {
  return (
    <div className="grid33" aria-label="3x3 grid">
      {cells.map((filled, i) => (
        <div key={i} className={"cell " + (filled ? "cellFilled" : "")} />
      ))}
    </div>
  );
}
