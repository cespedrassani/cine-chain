import { useNavigate } from "react-router-dom";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { posterGradient } from "@/lib/poster-gradient";
import type { TvShow } from "@/types";

interface TvShowCardProps {
  show: TvShow;
  onEdit: (show: TvShow) => void;
  onDelete: (show: TvShow) => void;
}

export function TvShowCard({ show, onEdit, onDelete }: TvShowCardProps) {
  const navigate = useNavigate();
  const [from, to] = posterGradient(show.title);

  return (
    <div
      role="article"
      aria-label={show.title}
      className="group cursor-pointer rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:border-secondary hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      tabIndex={0}
      onClick={() => navigate(`/tv-shows/${encodeURIComponent(show["@key"])}`)}
      onKeyDown={(e) => {
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

        <div
          className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
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

      <div className="flex items-center justify-between pr-1.5">
        <div className="p-3 space-y-1.5">
          <p className="text-foreground font-bold text-sm truncate">
            {show.title}
          </p>
          <span className="inline-block bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-md">
            Idade +{show.recommendedAge}
          </span>
        </div>
        <div className="opacity-40">
          <ChevronRight size={16} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}
