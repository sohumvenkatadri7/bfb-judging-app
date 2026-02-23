"use client";

import React from "react";

export function GlobalHeader({ title }: { title?: string }) {
  const handleSignOut = async () => {
    await fetch('/api/login', { method: 'DELETE' });
    window.location.href = '/';
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-navy flex items-center justify-center text-white font-bold">B</div>
          <div>
            <div className="text-sm font-semibold">{title || 'BFB Dashboard'}</div>
            <div className="text-xs text-muted-foreground">Judging & Admin panel</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSignOut} className="text-sm rounded px-3 py-1 border bg-white hover:bg-gray-50">Sign out</button>
        </div>
      </div>
    </header>
  );
}
