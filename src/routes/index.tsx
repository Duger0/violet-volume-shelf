import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kitaplığım — Okuduğum Kitaplar" },
      { name: "description", content: "Okuduğun kitapları raflardaki boş kitaplara isim ve renk vererek not et." },
      { property: "og:title", content: "Kitaplığım — Okuduğum Kitaplar" },
      { property: "og:description", content: "Okuduğun kitapları kendi mor kitaplığında sakla." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Book = { title: string; color: string } | null;

const SHELVES = 5;
const PER_SHELF = 10;
const KEY = "kitapligim-v1";
const HEIGHTS = [88, 96, 82, 100, 92, 86, 98, 90, 84, 94];

const COLORS = [
  "oklch(0.45 0.18 300)", "oklch(0.6 0.2 320)", "oklch(0.35 0.12 280)", "oklch(0.55 0.2 15)",
  "oklch(0.5 0.13 250)", "oklch(0.55 0.12 160)", "oklch(0.72 0.14 80)", "oklch(0.4 0.1 40)",
  "oklch(0.25 0.04 300)", "oklch(0.85 0.05 310)",
];

function Index() {
  const [books, setBooks] = useState<Book[]>(() => Array(SHELVES * PER_SHELF).fill(null));
  const [editing, setEditing] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (Array.isArray(saved)) setBooks(saved);
    } catch {}
  }, []);

  const save = (next: Book[]) => {
    setBooks(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const open = (i: number) => {
    setEditing(i);
    setTitle(books[i]?.title ?? "");
    setColor(books[i]?.color ?? COLORS[0]);
  };

  const submit = () => {
    if (editing === null || !title.trim()) return;
    const next = [...books];
    next[editing] = { title: title.trim(), color };
    save(next);
    setEditing(null);
  };

  const remove = () => {
    if (editing === null) return;
    const next = [...books];
    next[editing] = null;
    save(next);
    setEditing(null);
  };

  const count = books.filter(Boolean).length;
  const light = (c: string) => parseFloat(c.slice(6)) > 0.7;

  return (
    <main className="mx-auto max-w-4xl px-3 py-10">
      <header className="mb-8 text-center">
        <h1 className="font-display text-5xl font-semibold text-accent">Kitaplığım</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {count} kitap okundu · Boş bir kitaba dokun, adını ve rengini seç
        </p>
      </header>

      <div className="rounded-xl border-8 border-shelf bg-card/60 p-2 sm:p-4">
        {Array.from({ length: SHELVES }).map((_, s) => (
          <div key={s} className="mb-5 last:mb-0">
            <div className="flex h-28 items-end gap-[3px] px-1 sm:gap-1.5">
              {Array.from({ length: PER_SHELF }).map((_, b) => {
                const i = s * PER_SHELF + b;
                const book = books[i];
                const h = HEIGHTS[(b + s * 3) % HEIGHTS.length];
                return (
                  <button
                    key={i}
                    onClick={() => open(i)}
                    style={{ height: `${h}%`, background: book?.color }}
                    className={`flex flex-1 items-center justify-center overflow-hidden rounded-t-sm transition-all duration-300 ${book ? "book-filled" : "book-empty"}`}
                    aria-label={book ? book.title : "Boş kitap"}
                  >
                    {book && (
                      <span
                        className={`vertical-text truncate px-0.5 font-display text-[11px] font-semibold sm:text-sm ${light(book.color) ? "text-primary-foreground" : "text-foreground"}`}
                        style={{ maxHeight: "90%" }}
                      >
                        {book.title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="shelf-board h-3 rounded-sm" />
          </div>
        ))}
      </div>

      {editing !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border bg-popover p-6 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl font-semibold text-accent">
              {books[editing] ? "Kitabı düzenle" : "Yeni kitap"}
            </h2>
            <label className="mt-4 block text-sm text-muted-foreground">Kitabın adı</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="mt-1 w-full rounded-md border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="ör. Suç ve Ceza"
            />
            <label className="mt-4 block text-sm text-muted-foreground">Renk</label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ background: c }}
                  className={`h-9 rounded-md transition ${color === c ? "ring-2 ring-accent ring-offset-2 ring-offset-popover" : ""}`}
                  aria-label="Renk seç"
                />
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              {books[editing] && (
                <button onClick={remove} className="rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                  Kaldır
                </button>
              )}
              <button onClick={() => setEditing(null)} className="ml-auto rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                Vazgeç
              </button>
              <button
                onClick={submit}
                disabled={!title.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                Rafa koy
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
