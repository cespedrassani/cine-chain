import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Clapperboard,
  Star,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QueryError } from "@/components/shared/query-error";
import { posterGradient } from "@/lib/poster-gradient";
import { useTvShow } from "@/hooks/use-tv-shows";
import { useSeasonsByShow, useDeleteSeason } from "@/hooks/use-seasons";
import { useEpisodesBySeasons } from "@/hooks/use-episodes";
import type { Season } from "@/types";
import { SeasonFormModal } from "../season/components/season-form-modal";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { Badge } from "@/components/ui/badge";
import { TvShowFormModal } from "./components/tv-show-form-modal";

function SkeletonHeader() {
  return (
    <div className="rounded-xl border bg-card h-52 sm:h-[280px] animate-pulse" />
  );
}

function SkeletonSeasonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card animate-pulse">
      <div className="w-12 h-12 bg-secondary rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-secondary rounded w-1/4" />
        <div className="h-3 bg-secondary rounded w-1/6" />
      </div>
    </div>
  );
}

export function TvShowDetailPage() {
  const { key: encodedKey } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const key = decodeURIComponent(encodedKey ?? "");

  const {
    data: show,
    isLoading: showLoading,
    isError: showError,
    refetch: refetchShow,
  } = useTvShow(key);
  usePageTitle(show?.title ?? "");
  const { data: seasons = [], isLoading: seasonsLoading } =
    useSeasonsByShow(key);
  const deleteMutation = useDeleteSeason(key);

  const seasonKeys = seasons.map((s) => s["@key"]);
  const { data: allEpisodes = [] } = useEpisodesBySeasons(seasonKeys);

  const ratedEpisodes = allEpisodes.filter(
    (e) => e.rating != null && e.rating > 0,
  );
  const avgRating =
    ratedEpisodes.length > 0
      ? ratedEpisodes.reduce((sum, e) => sum + (e.rating ?? 0), 0) /
        ratedEpisodes.length
      : null;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Season | undefined>();
  const [formTvShowOpen, setFormTvShowOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Season | undefined>();

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEditSeason(season: Season) {
    setEditing(season);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget["@key"], {
      onSuccess: () => setDeleteTarget(undefined),
    });
  }

  function openEditTvShow() {
    setFormTvShowOpen(true);
  }

  const [from, to] = posterGradient(show?.title ?? "");

  if (showError) {
    return <QueryError onRetry={refetchShow} />;
  }

  if (!showLoading && !show) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed rounded-xl">
        <Clapperboard
          className="h-12 w-12 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="text-center">
          <p className="text-foreground font-medium">Série não encontrada</p>
          <p className="text-muted-foreground text-sm mt-1">
            Esta série pode ter sido removida ou o link está incorreto.
          </p>
        </div>
        <Button onClick={() => navigate("/tv-shows")} size="sm">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-row items-center justify-between">
        <button
          aria-label="Voltar"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </button>

        <Button variant="outline" onClick={openEditTvShow} size="sm">
          Editar Série
        </Button>
      </div>

      {showLoading ? (
        <SkeletonHeader />
      ) : (
        <div className="relative w-full overflow-hidden rounded-xl border h-52 sm:h-[280px]">
          <div className="relative w-full shrink-0 h-full">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${from}, ${to})`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, transparent 30%, rgba(0,0,0,0.85) 70%)",
              }}
            />

            <div className="relative h-full flex items-stretch">
              <div
                className="shrink-0 h-full hidden sm:flex items-center justify-center"
                style={{
                  aspectRatio: "2/2",
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                }}
              >
                <span className="text-8xl font-bold text-primary select-none">
                  {show?.title.charAt(0).toUpperCase()}
                </span>
              </div>

              <div
                className="flex flex-col justify-center px-5 sm:px-8 max-w-lg"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <h2 className="text-white text-xl sm:text-3xl font-bold leading-tight line-clamp-1">
                    {show?.title}
                  </h2>
                  <span className="bg-black/40 text-muted-foreground text-[10px] px-2 py-1 rounded-lg border border-border-subtle">
                    Idade +{show?.recommendedAge}
                  </span>
                </div>
                <p className="hidden sm:block text-muted-foreground text-sm line-clamp-2 mb-4">
                  {show?.description}
                </p>
                <div className="flex items-center gap-x-4">
                  {allEpisodes && allEpisodes.length > 0 && (
                    <Badge>
                      {allEpisodes.length} temporada
                      {allEpisodes.length > 1 && `s`}
                    </Badge>
                  )}
                  {avgRating !== null && (
                    <span className="flex items-center gap-1">
                      <Star
                        className="h-4 w-4 fill-primary text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-foreground font-bold text-sm">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-sm">/10</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-3 text-foreground text-lg font-bold">
            <span className="w-1 h-6 bg-primary rounded-full shrink-0" />
            Temporadas
          </h2>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova Temporada
          </Button>
        </div>

        {seasonsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonSeasonRow key={i} />
            ))}
          </div>
        ) : seasons.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed rounded-xl">
            <Clapperboard
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="text-foreground font-medium">
                Nenhuma temporada cadastrada
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Adicione a primeira temporada para começar.
              </p>
            </div>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar primeira temporada
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {seasons
              .slice()
              .sort((a, b) => a.number - b.number)
              .map((season) => (
                <div
                  key={season["@key"]}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver Temporada ${season.number} (${season.year})`}
                  className="group flex items-center gap-4 p-4 rounded-xl border bg-card cursor-pointer transition-all duration-200 hover:border-secondary hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() =>
                    navigate(`/seasons/${encodeURIComponent(season["@key"])}`)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(
                        `/seasons/${encodeURIComponent(season["@key"])}`,
                      );
                    }
                  }}
                >
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${from}, ${to})`,
                    }}
                  >
                    <span className="text-primary font-bold text-sm">
                      T{season.number}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-bold text-sm">
                      Temporada {season.number}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {season.year}
                    </p>
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
                        openEditSeason(season);
                      }}
                    >
                      <Pencil
                        className="h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      aria-label={`Excluir Temporada ${season.number}`}
                      className="rounded-full p-1.5 bg-white/10 hover:bg-red-500/60 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(season);
                      }}
                    >
                      <Trash2
                        className="h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      <TvShowFormModal
        key={show?.["@key"] ?? "new"}
        open={formTvShowOpen}
        onOpenChange={setFormTvShowOpen}
        initialData={show}
      />

      <SeasonFormModal
        key={editing?.["@key"] ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        tvShowKey={key}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        onConfirm={confirmDelete}
        title="Excluir Temporada"
        description={`Tem certeza que deseja excluir a Temporada ${deleteTarget?.number}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
