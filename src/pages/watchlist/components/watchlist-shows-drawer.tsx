import { useState } from "react";
import { Check, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateWatchlist, useUpdateWatchlist } from "@/hooks/use-watchlist";
import { posterGradient } from "@/lib/poster-gradient";
import type { Watchlist, TvShow } from "@/types";

interface WatchlistDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allShows: TvShow[];
  watchlist?: Watchlist;
}

export function WatchlistDrawer({
  open,
  onOpenChange,
  allShows,
  watchlist,
}: WatchlistDrawerProps) {
  const isEditing = !!watchlist;

  const [title, setTitle] = useState(watchlist?.title ?? "");
  const [description, setDescription] = useState(watchlist?.description ?? "");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set((watchlist?.tvShows ?? []).map((ref) => ref["@key"])),
  );
  const [search, setSearch] = useState("");
  const [titleError, setTitleError] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const createMutation = useCreateWatchlist();
  const updateMutation = useUpdateWatchlist();
  const isPending = createMutation.isPending || updateMutation.isPending;

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

  function validate(): boolean {
    if (!title.trim()) {
      setTitleError("Título é obrigatório");
      return false;
    }
    setTitleError("");
    return true;
  }

  function handleSave() {
    if (!validate()) return;

    const tvShows = Array.from(selectedKeys).map((key) => ({
      "@assetType": "tvShows" as const,
      "@key": key,
    }));

    const data = {
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      tvShows,
    };

    if (isEditing) {
      updateMutation.mutate(
        { key: watchlist["@key"], data },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  }

  const selectedCount = selectedKeys.size;

  const query = debouncedSearch.trim().toLowerCase();
  const visibleShows = query
    ? allShows.filter((s) => s.title.toLowerCase().includes(query))
    : allShows;

  const selectedShows = visibleShows.filter((s) => selectedKeys.has(s["@key"]));
  const unselectedShows = visibleShows.filter(
    (s) => !selectedKeys.has(s["@key"]),
  );

  function renderCard(show: TvShow) {
    const selected = selectedKeys.has(show["@key"]);
    const [from, to] = posterGradient(show.title);

    return (
      <button
        key={show["@key"]}
        type="button"
        onClick={() => toggle(show["@key"])}
        aria-pressed={selected}
        aria-label={`${selected ? "Remover" : "Adicionar"} ${show.title}`}
        className={`rounded-xl border-2 overflow-hidden transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          selected
            ? "border-primary/50"
            : "border-border hover:border-muted-foreground/40"
        }`}
      >
        <div
          className="relative w-full"
          style={{
            paddingBottom: "80%",
            background: `linear-gradient(135deg, ${from}, ${to})`,
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-xl font-bold text-primary select-none">
              {show.title.charAt(0).toUpperCase()}
            </span>
          </div>

          <div
            className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected
                ? "border-primary bg-primary"
                : "border-white/50 bg-black/20"
            }`}
            aria-hidden="true"
          >
            {selected && (
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            )}
          </div>
        </div>

        <div
          className={`px-1.5 py-1 transition-colors ${
            selected ? "bg-primary/10" : "bg-card"
          }`}
        >
          <p className="text-[10px] font-semibold text-foreground truncate">
            {show.title}
          </p>
        </div>
      </button>
    );
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar lista" : "Nova lista"}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label
            htmlFor="drawer-title"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Título
          </Label>
          <Input
            id="drawer-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            placeholder="Nome da lista"
            aria-describedby={titleError ? "drawer-title-error" : undefined}
          />
          {titleError && (
            <p
              id="drawer-title-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {titleError}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="drawer-description"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Descrição
          </Label>
          <Textarea
            id="drawer-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none"
            placeholder="Descrição da lista (opcional)"
          />
        </div>

        {allShows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                Séries
              </Label>
              {selectedCount > 0 && (
                <span className="text-muted-foreground text-xs">
                  {selectedCount}{" "}
                  {selectedCount === 1 ? "selecionada" : "selecionadas"}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar série..."
                className="w-full rounded-lg border border-input bg-muted px-3 py-2 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-colors"
              />
              <Search
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {selectedShows.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedShows.map(renderCard)}
              </div>
            )}

            {selectedShows.length > 0 && unselectedShows.length > 0 && (
              <div className="flex items-center gap-2 my-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground">
                  Não adicionadas
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            {unselectedShows.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {unselectedShows.map(renderCard)}
              </div>
            )}

            {visibleShows.length === 0 && (
              <p className="text-center text-muted-foreground text-xs py-6">
                Nenhuma série encontrada.
              </p>
            )}
          </div>
        )}
      </div>
    </FormDrawer>
  );
}
