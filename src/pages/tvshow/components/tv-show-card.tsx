import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  BookmarkPlus,
  Pencil,
  Trash2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { posterGradient } from "@/lib/poster-gradient";
import { AddToWatchlistDrawer } from "./add-to-watchlist-drawer";
import type { TvShow } from "@/types";

interface TvShowCardProps {
  show: TvShow;
  onEdit: (show: TvShow) => void;
  onDelete: (show: TvShow) => void;
  isDeleting?: boolean;
}

export function TvShowCard({
  show,
  onEdit,
  onDelete,
  isDeleting,
}: TvShowCardProps) {
  const navigate = useNavigate();
  const [from, to] = posterGradient(show.title);
  const [watchlistDrawerOpen, setWatchlistDrawerOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  function openWatchlistDrawer() {
    setWatchlistDrawerOpen(true);
    setOpenCount((c) => c + 1);
  }

  return (
    <>
      <div
        role="article"
        aria-label={show.title}
        aria-busy={isDeleting}
        className={`group rounded-xl border bg-card overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isDeleting ? "pointer-events-none opacity-60" : "cursor-pointer hover:border-secondary hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]"}`}
        tabIndex={isDeleting ? -1 : 0}
        onClick={() =>
          !isDeleting &&
          navigate(`/tv-shows/${encodeURIComponent(show["@key"])}`)
        }
        onKeyDown={(e) => {
          if (isDeleting) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/tv-shows/${encodeURIComponent(show["@key"])}`);
          }
        }}
      >
        <div
          className="relative w-full"
          style={{
            paddingBottom: "110%",
            background: `linear-gradient(135deg, ${from}, ${to})`,
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-5xl font-bold text-primary select-none">
              {show.title.charAt(0).toUpperCase()}
            </span>
          </div>

          {isDeleting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2
                className="h-8 w-8 text-white animate-spin"
                aria-hidden="true"
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  aria-label={`Ver detalhes de ${show.title}`}
                  className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tv-shows/${encodeURIComponent(show["@key"])}`);
                  }}
                >
                  <Eye className="h-5 w-5 text-white" aria-hidden="true" />
                </button>

                <button
                  aria-label={`Adicionar ${show.title} à watchlist`}
                  className="rounded-full p-2 bg-white/10 hover:bg-primary/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    openWatchlistDrawer();
                  }}
                >
                  <BookmarkPlus
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </button>

                <button
                  aria-label={`Editar ${show.title}`}
                  className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(show);
                  }}
                >
                  <Pencil className="h-5 w-5 text-white" aria-hidden="true" />
                </button>

                <button
                  aria-label={`Excluir ${show.title}`}
                  className="rounded-full p-2 bg-white/10 hover:bg-red-500/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(show);
                  }}
                >
                  <Trash2 className="h-5 w-5 text-white" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pr-1.5 overflow-hidden">
          <div className="p-3 space-y-1.5 min-w-0">
            <p className="text-foreground font-bold text-sm truncate">
              {show.title}
            </p>
            <span className="inline-block bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-md">
              Idade +{show.recommendedAge}
            </span>
          </div>
          <ChevronRight className="text-muted-foreground" size={14} />
        </div>
      </div>

      <AddToWatchlistDrawer
        key={openCount}
        show={show}
        open={watchlistDrawerOpen}
        onOpenChange={setWatchlistDrawerOpen}
      />
    </>
  );
}
