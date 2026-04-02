import { useState } from "react";
import { Plus, ListVideo } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QueryError } from "@/components/shared/query-error";
import { WatchlistCard } from "@/pages/watchlist/components/watchlist-card";
import { WatchlistFormModal } from "@/pages/watchlist/components/watchlist-form-modal";
import { useWatchlist, useDeleteWatchlist } from "@/hooks/use-watchlist";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTvShows } from "@/hooks/use-tv-shows";
import type { Watchlist } from "@/types";
import { Button } from "@/components/ui/button";

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
      <div className="w-full bg-secondary" style={{ paddingBottom: "75%" }} />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-1/3" />
      </div>
    </div>
  );
}

export function WatchlistPage() {
  usePageTitle("Watchlist");
  const { data: watchlists = [], isLoading, isError, refetch } = useWatchlist();
  const { data: shows = [] } = useTvShows();
  const deleteMutation = useDeleteWatchlist();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Watchlist | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Watchlist | undefined>();

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(watchlist: Watchlist) {
    setEditing(watchlist);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget["@key"], {
      onSuccess: () => setDeleteTarget(undefined),
    });
  }

  return (
    <div>
      <h1 className="sr-only">Watchlist</h1>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h2 className="flex items-center gap-3 text-foreground text-lg font-bold">
          <span className="w-1 h-6 bg-primary rounded-full shrink-0" />
          Minhas Listas
        </h2>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Nova Lista</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <QueryError onRetry={refetch} />
      ) : watchlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed rounded-xl">
          <ListVideo
            className="h-12 w-12 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="text-center">
            <p className="text-foreground font-medium">Nenhuma lista criada</p>
            <p className="text-muted-foreground text-sm mt-1">
              Crie uma lista para organizar seus shows favoritos.
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova Lista
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
          {watchlists.map((watchlist) => (
            <WatchlistCard
              key={watchlist["@key"]}
              watchlist={watchlist}
              shows={shows}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <WatchlistFormModal
        key={editing?.["@key"] ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        allShows={shows}
        initialData={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        onConfirm={confirmDelete}
        title="Excluir lista"
        description={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
