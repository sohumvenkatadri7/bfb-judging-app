"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
}

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const colors = ["#10B981", "#1E293B", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];
    const newPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(timer);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size * 1.5,
            backgroundColor: piece.color,
            borderRadius: piece.size > 8 ? "50%" : "2px",
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${2 + Math.random() * 1.5}s ease-out ${piece.delay}s forwards`,
            opacity: 0,
            animationFillMode: "forwards",
          }}
        />
      ))}
    </div>
  );
}
