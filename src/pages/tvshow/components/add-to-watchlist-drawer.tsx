import { useRef, useState } from "react";
import { Check, ListVideo } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/use-watchlist";
import { updateWatchlist } from "@/services/watchlists";
import { posterGradient } from "@/lib/poster-gradient";
import { queryKeys } from "@/lib/query-keys";
import type { TvShow, WatchlistFormData } from "@/types";

interface AddToWatchlistDrawerProps {
  show: TvShow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToWatchlistDrawer({
  show,
  open,
  onOpenChange,
}: AddToWatchlistDrawerProps) {
  const { data: watchlists = [], isLoading } = useWatchlist();
  const queryClient = useQueryClient();

  const initialSelected = new Set(
    watchlists
      .filter((w) =>
        (w.tvShows ?? []).some((ref) => ref?.["@key"] === show["@key"]),
      )
      .map((w) => w["@key"]),
  );

  const initialSelectedRef = useRef(initialSelected);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(initialSelected),
  );

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: WatchlistFormData }) =>
      updateWatchlist(key, data),
  });

  function toggle(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function handleSave() {
    const changed = watchlists.filter((w) => {
      const wasSelected = initialSelectedRef.current.has(w["@key"]);
      const isNowSelected = selectedKeys.has(w["@key"]);
      return wasSelected !== isNowSelected;
    });

    if (changed.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await Promise.all(
        changed.map((watchlist) => {
          const isAdded = selectedKeys.has(watchlist["@key"]);
          const tvShows = isAdded
            ? [
                ...(watchlist.tvShows ?? []),
                { "@assetType": "tvShows" as const, "@key": show["@key"] },
              ]
            : (watchlist.tvShows ?? []).filter(
                (ref) => ref["@key"] !== show["@key"],
              );

          return updateMutation.mutateAsync({
            key: watchlist["@key"],
            data: {
              title: watchlist.title,
              ...(watchlist.description
                ? { description: watchlist.description }
                : {}),
              tvShows,
            },
          });
        }),
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
      toast.success(
        changed.length === 1
          ? "Lista atualizada com sucesso."
          : `${changed.length} listas atualizadas.`,
      );
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar as listas.");
    }
  }

  const [from, to] = posterGradient(show.title);
  const selectedCount = selectedKeys.size;

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar à lista"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-primary text-xl shrink-0"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            aria-hidden="true"
          >
            {show.title.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {show.title}
            </p>
            <p className="text-xs text-muted-foreground">
              Idade +{show.recommendedAge}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : watchlists.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <ListVideo
              className="h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-foreground font-medium text-sm">
                Nenhuma lista criada
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Crie uma lista na página de listas primeiro.
              </p>
            </div>
          </div>
        ) : (
          <>
            {selectedCount > 0 && (
              <p className="text-muted-foreground text-xs">
                {selectedCount}{" "}
                {selectedCount === 1
                  ? "lista selecionada"
                  : "listas selecionadas"}
              </p>
            )}

            <div className="space-y-2">
              {watchlists.map((watchlist) => {
                const selected = selectedKeys.has(watchlist["@key"]);
                const [wFrom, wTo] = posterGradient(watchlist.title);
                const count = (watchlist.tvShows ?? []).length;

                return (
                  <button
                    key={watchlist["@key"]}
                    type="button"
                    onClick={() => toggle(watchlist["@key"])}
                    aria-pressed={selected}
                    aria-label={`${selected ? "Remover de" : "Adicionar a"} ${watchlist.title}`}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected
                        ? "border-primary/50"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-primary text-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${wFrom}, ${wTo})`,
                      }}
                      aria-hidden="true"
                    >
                      {watchlist.title.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {watchlist.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? "série" : "séries"}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      }`}
                      aria-hidden="true"
                    >
                      {selected && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </FormDrawer>
  );
}
