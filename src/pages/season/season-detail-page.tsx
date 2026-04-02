import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Film,
  Star,
  Play,
  Pencil,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QueryError } from "@/components/shared/query-error";
import { posterGradient } from "@/lib/poster-gradient";
import { useSeason } from "@/hooks/use-seasons";
import { useTvShow } from "@/hooks/use-tv-shows";
import { useEpisodesBySeason, useDeleteEpisode } from "@/hooks/use-episodes";
import { useQueryClient } from "@tanstack/react-query";
import type { Episode } from "@/types";
import { EpisodeFormModal } from "@/pages/season/components/episode-form-modal";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { SeasonFormModal } from "./components/season-form-modal";
import { cascadeDeleteSeason } from "@/lib/cascade-delete";
import { toast } from "sonner";

function SkeletonEpisodeRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b animate-pulse">
      <div className="w-8 h-3 bg-secondary rounded shrink-0" />
      <div className="w-24 h-14 bg-secondary rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-secondary rounded w-1/3" />
        <div className="h-3 bg-secondary rounded w-1/5" />
      </div>
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className="p-6 rounded-xl border bg-card overflow-hidden animate-pulse space-y-3">
      <div className="h-6 bg-secondary rounded w-20" />
      <div className="h-6 bg-secondary rounded w-48" />
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function SeasonDetailPage() {
  const { key: encodedKey } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const key = decodeURIComponent(encodedKey ?? "");

  const {
    data: season,
    isLoading: seasonLoading,
    isError: seasonError,
    refetch: refetchSeason,
  } = useSeason(key);
  const showKey = season?.tvShow["@key"] ?? "";
  const { data: show } = useTvShow(showKey);
  usePageTitle(
    show && season ? `${show.title} — Temporada ${season.number}` : "",
  );
  const { data: episodes = [], isLoading: episodesLoading } =
    useEpisodesBySeason(key);
  const deleteMutation = useDeleteEpisode(key);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [seasonFormOpen, setSeasonFormOpen] = useState(false);
  const [editing, setEditing] = useState<Episode | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Episode | undefined>();
  const [openDeleteSeason, setOpenDeleteSeason] = useState(false);
  const [seasonDeleting, setSeasonDeleting] = useState(false);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(episode: Episode) {
    setEditing(episode);
    setFormOpen(true);
  }

  function openEditSeason() {
    setSeasonFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget["@key"], {
      onSuccess: () => setDeleteTarget(undefined),
    });
  }

  async function confirmDeleteSeason() {
    if (!season) return;
    setSeasonDeleting(true);
    try {
      await cascadeDeleteSeason(queryClient, season["@key"]);
      setOpenDeleteSeason(false);
      toast.success("Temporada excluída com sucesso.");
      navigate(`/tv-shows/${encodeURIComponent(showKey)}`);
    } catch {
      toast.error("Erro ao excluir temporada.");
    } finally {
      setSeasonDeleting(false);
    }
  }

  const sorted = [...episodes].sort(
    (a, b) => a.episodeNumber - b.episodeNumber,
  );

  if (seasonError) {
    return <QueryError onRetry={refetchSeason} />;
  }

  if (!seasonLoading && !season) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed rounded-xl">
        <Film className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <div className="text-center">
          <p className="text-foreground font-medium">
            Temporada não encontrada
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Esta temporada pode ter sido removida ou o link está incorreto.
          </p>
        </div>
        <Button onClick={() => navigate("/tv-shows")} size="sm">
          Voltar
        </Button>
      </div>
    );
  }

  const tvShowKey = season?.tvShow["@key"] ?? "";

  return (
    <div className="space-y-8">
      <div className="flex flex-row items-center justify-between">
        <button
          aria-label={`Voltar para ${show?.title ?? "TV Show"}`}
          onClick={() => navigate(`/tv-shows/${encodeURIComponent(tvShowKey)}`)}
          className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </button>

        <div className="flex items-center gap-x-2">
          <Button variant="outline" onClick={openEditSeason} size="sm">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            size="sm"
            onClick={() => setOpenDeleteSeason(true)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>
      {seasonLoading ? (
        <SkeletonHeader />
      ) : (
        <div className="rounded-xl bg-card border overflow-hidden">
          <div className="p-6">
            <button
              onClick={() =>
                navigate(`/tv-shows/${encodeURIComponent(tvShowKey)}`)
              }
              className="text-primary text-sm font-medium hover:underline mb-2 block"
            >
              {show?.title ?? tvShowKey?.replace(/^tvShows:/, "")}
            </button>
            <h1 className="text-foreground text-2xl font-bold">
              Temporada {season?.number}{" "}
              <span className="text-muted-foreground font-normal text-lg">
                {season?.year}
              </span>
            </h1>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-3 text-foreground text-lg font-bold">
            <span className="w-1 h-6 bg-primary rounded-full shrink-0" />
            {episodesLoading
              ? "Episódios"
              : `${sorted.length} Episódio${sorted.length !== 1 ? "s" : ""}`}
          </h2>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo Episódio
          </Button>
        </div>

        {episodesLoading ? (
          <div className="rounded-xl border overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonEpisodeRow key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed rounded-xl">
            <Film
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="text-foreground font-medium">
                Nenhum episódio cadastrado
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Adicione o primeiro episódio para começar.
              </p>
            </div>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar primeiro episódio
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            {sorted.map((episode, idx) => (
              <div
                key={episode["@key"]}
                className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-secondary transition-colors ${idx < sorted.length - 1 ? "border-b" : ""}`}
              >
                <span className="w-6 sm:w-8 text-right text-muted-foreground text-sm shrink-0">
                  {episode.episodeNumber}
                </span>

                <div
                  className="hidden sm:flex shrink-0 w-24 h-14 rounded-xl items-center justify-center"
                  style={{
                    background: show
                      ? `linear-gradient(135deg, ${posterGradient(show.title)[0]}, ${posterGradient(show.title)[1]})`
                      : "linear-gradient(135deg, #1a1a2e, #16213e)",
                  }}
                >
                  <Play
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-bold text-sm truncate">
                    {episode.title}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {formatDate(episode.releaseDate)}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1 w-14 sm:w-20 justify-end">
                  {episode.rating != null && episode.rating > 0 ? (
                    <>
                      <Star
                        className="h-3.5 w-3.5 fill-primary text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-foreground text-sm font-bold">
                        {episode.rating.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="hidden sm:inline text-muted-foreground text-xs">
                      Avaliar
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity shrink-0">
                  <button
                    aria-label={`Editar episódio ${episode.episodeNumber}: ${episode.title}`}
                    className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
                    onClick={() => openEdit(episode)}
                  >
                    <Pencil
                      className="h-3.5 w-3.5 text-white"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    aria-label={`Excluir episódio ${episode.episodeNumber}: ${episode.title}`}
                    className="rounded-full p-1.5 bg-white/10 hover:bg-red-500/60 transition-colors"
                    onClick={() => setDeleteTarget(episode)}
                  >
                    <Trash2
                      className="h-3.5 w-3.5 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SeasonFormModal
        tvShowKey={tvShowKey}
        key={season?.["@key"] ?? "new"}
        open={seasonFormOpen}
        onOpenChange={setSeasonFormOpen}
        initialData={season}
      />

      <EpisodeFormModal
        key={editing?.["@key"] ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        seasonKey={key}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        onConfirm={confirmDelete}
        title="Excluir Episódio"
        description={`Tem certeza que deseja excluir? Esta ação não pode ser desfeita.`}
      />

      <ConfirmDialog
        open={openDeleteSeason}
        onOpenChange={(open) => !open && setOpenDeleteSeason(false)}
        onConfirm={confirmDeleteSeason}
        loading={seasonDeleting}
        title="Excluir Temporada"
        description={`Tem certeza que deseja excluir a Temporada ${season?.number}? Os episódios vinculados também serão removidos.`}
      />
    </div>
  );
}
