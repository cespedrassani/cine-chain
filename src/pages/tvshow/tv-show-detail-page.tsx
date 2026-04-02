import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Clapperboard,
  Star,
  Pencil,
  Trash2,
  Bookmark,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QueryError } from "@/components/shared/query-error";
import { posterGradient } from "@/lib/poster-gradient";
import { cascadeDeleteSeason, cascadeDeleteTvShow } from "@/lib/cascade-delete";
import { useTvShow } from "@/hooks/use-tv-shows";
import { useSeasonsByShow } from "@/hooks/use-seasons";
import { useEpisodesBySeasons } from "@/hooks/use-episodes";
import type { Season } from "@/types";
import { SeasonFormModal } from "../season/components/season-form-modal";
import { Button } from "@/components/ui/button";

import { usePageTitle } from "@/hooks/use-page-title";
import { Badge } from "@/components/ui/badge";
import { TvShowFormModal } from "./components/tv-show-form-modal";
import { AddToWatchlistDrawer } from "./components/add-to-watchlist-drawer";
import { SeasonCard } from "../season/components/season-card";

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
  const [seasonDeleting, setSeasonDeleting] = useState(false);
  const [tvShowDeleting, setTvShowDeleting] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [watchlistDrawerOpen, setWatchlistDrawerOpen] = useState(false);
  const [openTvShowDelete, setOpenTvShowDelete] = useState(false);
  const queryClient = useQueryClient();

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEditSeason(season: Season) {
    setEditing(season);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSeasonDeleting(true);
    try {
      await cascadeDeleteSeason(queryClient, deleteTarget["@key"]);
      setDeleteTarget(undefined);
      toast.success("Temporada excluída com sucesso.");
    } catch {
      toast.error("Erro ao excluir temporada.");
    } finally {
      setSeasonDeleting(false);
    }
  }

  async function confirmTvShowDelete() {
    if (!show) return;
    setTvShowDeleting(true);
    try {
      await cascadeDeleteTvShow(queryClient, show["@key"]);
      setOpenTvShowDelete(false);
      toast.success("Série excluída com sucesso.");
      navigate("/tv-shows");
    } catch {
      toast.error("Erro ao excluir série.");
    } finally {
      setTvShowDeleting(false);
    }
  }

  function openEditTvShow() {
    setFormTvShowOpen(true);
  }

  function openWatchlistDrawer() {
    setWatchlistDrawerOpen(true);
    setOpenCount((c) => c + 1);
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

        <div className="flex items-center gap-x-2">
          <Button variant="outline" onClick={openWatchlistDrawer} size="sm">
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
          <Button variant="outline" onClick={openEditTvShow} size="sm">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            variant="outline"
            className="border-destructive hover:bg-destructive text-destructive hover:text-destructive-foreground"
            onClick={() => setOpenTvShowDelete(true)}
            size="sm"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
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
                className="flex flex-col justify-center px-5 sm:px-8 max-w-lg min-w-0 overflow-hidden"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-3 overflow-hidden">
                  <h2 className="text-white text-xl sm:text-3xl font-bold leading-tight line-clamp-1 min-w-0">
                    {show?.title}
                  </h2>
                  <span className="bg-black/40 text-muted-foreground text-[10px] px-2 py-1 rounded-lg border border-border-subtle shrink-0 whitespace-nowrap">
                    Idade +{show?.recommendedAge}
                  </span>
                </div>
                <p className="hidden sm:block text-muted-foreground text-sm overflow-y-auto max-h-16 mb-4 pr-1">
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
            <span className="hidden sm:inline">Nova Temporada</span>
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
                <SeasonCard
                  key={season["@key"]}
                  onDelete={setDeleteTarget}
                  onEdit={openEditSeason}
                  season={season}
                />
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
        loading={seasonDeleting}
        title="Excluir Temporada"
        description={`Tem certeza que deseja excluir a Temporada ${deleteTarget?.number}? Os episódios vinculados também serão removidos.`}
      />

      <ConfirmDialog
        open={openTvShowDelete}
        onOpenChange={(open) => !open && setOpenTvShowDelete(false)}
        onConfirm={confirmTvShowDelete}
        loading={tvShowDeleting}
        title="Excluir Série"
        description={`Tem certeza que deseja excluir "${show?.title}"? Temporadas, episódios e watchlists vinculadas também serão removidos.`}
      />

      {show && (
        <AddToWatchlistDrawer
          key={openCount}
          show={show}
          open={watchlistDrawerOpen}
          onOpenChange={setWatchlistDrawerOpen}
        />
      )}
    </div>
  );
}
