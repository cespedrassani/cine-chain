import { posterGradient } from "@/lib/poster-gradient";
import type { Season } from "@/types";
import { ChevronRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SeasonCardProps {
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
  season: Season;
  isDeleting?: boolean;
}

export function SeasonCard({
  season,
  onEdit,
  onDelete,
  isDeleting,
}: SeasonCardProps) {
  const navigate = useNavigate();
  const [from, to] = posterGradient(season?.tvShow?.["@key"] ?? season["@key"]);
  return (
    <div
      key={season["@key"]}
      role="button"
      tabIndex={0}
      aria-label={`Ver Temporada ${season.number} (${season.year})`}
      className={`group flex items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isDeleting ? "pointer-events-none opacity-60" : "cursor-pointer hover:border-secondary hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]"}`}
      onClick={() =>
        !isDeleting &&
        navigate(`/seasons/${encodeURIComponent(season["@key"])}`)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/seasons/${encodeURIComponent(season["@key"])}`);
        }
      }}
    >
      <div
        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${from}, ${to})`,
        }}
      >
        <span className="text-primary font-bold text-sm">T{season.number}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-foreground font-bold text-sm">
          Temporada {season.number}
        </p>
        <p className="text-muted-foreground text-xs mt-0.5">{season.year}</p>
      </div>

      <div
        className="flex items-center gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label={`Editar Temporada ${season.number}`}
          className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(season);
          }}
        >
          <Pencil className="h-4 w-4 text-white" aria-hidden="true" />
        </button>
        <button
          aria-label={`Excluir Temporada ${season.number}`}
          disabled={isDeleting}
          className="rounded-full p-1.5 bg-white/10 hover:bg-red-500/60 transition-colors disabled:pointer-events-none"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(season);
          }}
        >
          {isDeleting ? (
            <Loader2
              className="h-4 w-4 text-white animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Trash2 className="h-4 w-4 text-white" aria-hidden="true" />
          )}
        </button>
      </div>

      <ChevronRight
        className="h-4 w-4 text-muted-foreground shrink-0"
        aria-hidden="true"
      />
    </div>
  );
}
