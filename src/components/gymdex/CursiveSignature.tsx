"use client";

interface CursiveSignatureProps {
  name: string;
}

export default function CursiveSignature({ name }: CursiveSignatureProps) {
  if (!name.trim()) return null;

  return (
    <div className="mt-4 p-4 bg-white/5 border border-border rounded-lg">
      <p className="text-xs text-muted mb-2">Signature Preview</p>
      <p
        className="text-3xl text-foreground"
        style={{ fontFamily: "var(--font-cursive), cursive" }}
      >
        {name}
      </p>
      <div className="mt-2 border-b border-muted/30" />
    </div>
  );
}
