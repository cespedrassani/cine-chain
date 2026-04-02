import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Tv, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QueryError } from "@/components/shared/query-error";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTvShows, useDeleteTvShow } from "@/hooks/use-tv-shows";
import { isReferenceError } from "@/lib/parse-api-error";
import { cascadeDeleteTvShow } from "@/lib/cascade-delete";
import { useDebounce } from "@/hooks/use-debounce";
import { usePageTitle } from "@/hooks/use-page-title";
import { posterGradient } from "@/lib/poster-gradient";
import type { TvShow } from "@/types";
import { TvShowCard } from "./components/tv-show-card";
import { TvShowFormModal } from "./components/tv-show-form-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
      <div className="w-full bg-secondary" style={{ paddingBottom: "112%" }} />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-1/3" />
      </div>
    </div>
  );
}

function SkeletonHero() {
  return (
    <div className="rounded-xl border bg-card h-52 sm:h-[280px] animate-pulse" />
  );
}

const INTERVAL = 5000;

function HeroCarousel({ shows }: { shows: TvShow[] }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const count = shows.length;

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent(((index % count) + count) % count);
      setTimeout(() => setAnimating(false), 600);
    },
    [animating, count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [paused, count]);

  if (count === 0) return null;

  return (
    <section aria-label="Séries em destaque" aria-roledescription="carrossel">
      <div
        className="relative w-full overflow-hidden rounded-xl border h-52 sm:h-[280px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {shows.map((show, idx) => {
            const [from, to] = posterGradient(show.title);
            return (
              <div
                key={show["@key"]}
                className="relative w-full shrink-0 h-full"
                aria-hidden={idx !== current}
              >
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
                      {show.title.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div
                    className="flex flex-col justify-center px-5 sm:px-8 max-w-lg min-w-0 overflow-hidden"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <p className="text-primary text-xs font-semibold uppercase mb-2 sm:mb-3 tracking-widest">
                      Em destaque
                    </p>
                    <div className="flex items-center gap-3 mb-2 sm:mb-3 overflow-hidden">
                      <h2 className="text-white text-xl sm:text-3xl font-bold leading-tight line-clamp-1 min-w-0">
                        {show.title}
                      </h2>
                      <span className="bg-black/40 text-muted-foreground text-[10px] px-2 py-1 rounded-lg border border-border-subtle shrink-0 whitespace-nowrap">
                        Idade +{show.recommendedAge}
                      </span>
                    </div>
                    <p className="hidden sm:block text-muted-foreground text-sm overflow-y-auto max-h-16 mb-4 pr-1">
                      {show.description}
                    </p>
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(
                            `/tv-shows/${encodeURIComponent(show["@key"])}`,
                          )
                        }
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button
              aria-label="Slide anterior"
              onClick={() => goTo(current - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10 border border-white/10"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              aria-label="Próximo slide"
              onClick={() => goTo(current + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10 border border-white/10"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {shows.map((show, i) => (
                <button
                  key={i}
                  aria-label={`Ir para slide ${i + 1}: ${show.title}`}
                  aria-current={i === current ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-5 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/5">
              <div
                key={current}
                className="h-full bg-primary/50"
                style={{
                  animation: `carousel-progress ${INTERVAL}ms linear forwards`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function TvShowsPage() {
  usePageTitle("Séries");
  const {
    data: allShows = [],
    isLoading: heroLoading,
    isError: heroError,
  } = useTvShows();
  const deleteMutation = useDeleteTvShow();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: filtered = [],
    isLoading: gridLoading,
    isFetching: gridFetching,
    isError: gridError,
    refetch: refetchGrid,
  } = useTvShows(debouncedSearch);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TvShow | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<TvShow | undefined>();
  const [forceDeleteTarget, setForceDeleteTarget] = useState<
    TvShow | undefined
  >();

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(show: TvShow) {
    setEditing(show);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget["@key"]);
      setDeleteTarget(undefined);
    } catch (error) {
      if (isReferenceError(error)) {
        setForceDeleteTarget(deleteTarget);
        setDeleteTarget(undefined);
      }
    }
  }

  function confirmForceDelete() {
    if (!forceDeleteTarget) return;
    const target = forceDeleteTarget;
    setForceDeleteTarget(undefined);
    toast.promise(cascadeDeleteTvShow(queryClient, target["@key"]), {
      loading: "Removendo vínculos e excluindo série...",
      success: "Série excluída com sucesso.",
      error: "Erro ao excluir série.",
    });
  }

  return (
    <div>
      <h1 className="sr-only">Séries</h1>
      {heroLoading ? (
        <SkeletonHero />
      ) : heroError ? null : (
        <HeroCarousel shows={allShows.slice(0, 3)} />
      )}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="flex items-center gap-3 text-foreground text-lg font-bold">
            <span className="w-1 h-6 bg-primary rounded-full shrink-0" />
            Todos as séries
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus:border-primary transition-colors w-32 sm:w-44"
              />
              <Search
                className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Nova Série</span>
            </Button>
          </div>
        </div>

        {gridLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : gridError ? (
          <QueryError onRetry={refetchGrid} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed rounded-xl">
            <Tv
              className="h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="text-foreground font-medium">
                {search
                  ? "Nenhum resultado encontrado"
                  : "Nenhum programa cadastrado"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {search
                  ? "Tente outro termo de busca."
                  : "Adicione o primeiro programa para começar."}
              </p>
            </div>
            {!search && (
              <Button onClick={openCreate} size="sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar série
              </Button>
            )}
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-200 ${gridFetching ? "opacity-50" : "opacity-100"}`}
          >
            {filtered.map((show) => (
              <TvShowCard
                key={show["@key"]}
                show={show}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      <TvShowFormModal
        key={editing?.["@key"] ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        onConfirm={confirmDelete}
        title="Excluir Show"
        description={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        onOpenChange={(open) => !open && setForceDeleteTarget(undefined)}
        onConfirm={confirmForceDelete}
        title="Forçar exclusão?"
        description={`"${forceDeleteTarget?.title}" possui temporadas, episódios ou watchlists vinculadas. Tudo será removido. Deseja continuar?`}
      />
    </div>
  );
}
