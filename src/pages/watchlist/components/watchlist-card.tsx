import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { posterGradient } from "@/lib/poster-gradient";
import { WatchlistDrawer } from "./watchlist-shows-drawer";
import type { Watchlist, TvShow } from "@/types";

interface WatchlistCardProps {
  watchlist: Watchlist;
  shows: TvShow[];
  onDelete: (watchlist: Watchlist) => void;
}

export function WatchlistCard({
  watchlist,
  shows,
  onDelete,
}: WatchlistCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [from, to] = posterGradient(watchlist.title);

  const linkedShows = (watchlist.tvShows ?? [])
    .map((ref) => shows.find((s) => s["@key"] === ref["@key"]))
    .filter(Boolean) as TvShow[];

  function openDrawer() {
    setDrawerOpen(true);
    setOpenCount((c) => c + 1);
  }

  return (
    <>
      <div
        role="article"
        aria-label={watchlist.title}
        className="group cursor-pointer rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:border-secondary hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        tabIndex={0}
        onClick={openDrawer}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDrawer();
          }
        }}
      >
        <div
          className="relative w-full"
          style={{
            paddingBottom: "75%",
            background: `linear-gradient(135deg, ${from}, ${to})`,
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            {linkedShows.length === 0 ? (
              <span className="text-5xl font-bold text-primary select-none">
                {watchlist.title.charAt(0).toUpperCase()}
              </span>
            ) : (
              <div
                className={`grid gap-1.5 ${
                  linkedShows.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {linkedShows.slice(0, 4).map((show) => {
                  const [sf, st] = posterGradient(show.title);
                  return (
                    <div
                      key={show["@key"]}
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-primary text-sm select-none border border-white/10"
                      style={{
                        background: `linear-gradient(135deg, ${sf}, ${st})`,
                      }}
                    >
                      {show.title.charAt(0).toUpperCase()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label={`Editar lista ${watchlist.title}`}
              className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openDrawer();
              }}
            >
              <Pencil className="h-5 w-5 text-white" aria-hidden="true" />
            </button>
            <button
              aria-label={`Excluir lista ${watchlist.title}`}
              className="rounded-full p-2 bg-white/10 hover:bg-red-500/60 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(watchlist);
              }}
            >
              <Trash2 className="h-5 w-5 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-1.5 overflow-hidden">
          <p className="text-foreground font-bold text-sm truncate">
            {watchlist.title}
          </p>
          <span className="inline-block bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-md">
            {linkedShows.length} {linkedShows.length === 1 ? "série" : "séries"}
          </span>
          {watchlist.description && (
            <p className="text-muted-foreground text-[11px] leading-relaxed overflow-y-auto max-h-9">
              {watchlist.description}
            </p>
          )}
        </div>
      </div>

      <WatchlistDrawer
        key={openCount}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        watchlist={watchlist}
        allShows={shows}
      />
    </>
  );
}
