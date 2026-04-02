import { useState } from "react";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateWatchlist, useUpdateWatchlist } from "@/hooks/use-watchlist";
import type { Watchlist, WatchlistFormData, TvShow } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WatchlistFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allShows: TvShow[];
  initialData?: Watchlist;
}

type FormState = {
  title: string;
  description: string;
  selectedKeys: Set<string>;
};

function initForm(initialData?: Watchlist): FormState {
  if (!initialData)
    return { title: "", description: "", selectedKeys: new Set() };
  return {
    title: initialData.title,
    description: initialData.description ?? "",
    selectedKeys: new Set(
      (initialData.tvShows ?? []).map((ref) => ref["@key"]),
    ),
  };
}

export function WatchlistFormModal({
  open,
  onOpenChange,
  allShows,
  initialData,
}: WatchlistFormModalProps) {
  const isEditing = !!initialData;
  const [form, setForm] = useState<FormState>(() => initForm(initialData));
  const [errors, setErrors] = useState<{ title?: string }>({});

  const createMutation = useCreateWatchlist();
  const updateMutation = useUpdateWatchlist();
  const isPending = createMutation.isPending || updateMutation.isPending;

  function toggleShow(key: string) {
    setForm((f) => {
      const next = new Set(f.selectedKeys);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...f, selectedKeys: next };
    });
  }

  function validate(): boolean {
    if (!form.title.trim()) {
      setErrors({ title: "Título é obrigatório" });
      return false;
    }
    setErrors({});
    return true;
  }

  function buildPayload(): WatchlistFormData {
    return {
      title: form.title,
      ...(form.description.trim() ? { description: form.description } : {}),
      tvShows: Array.from(form.selectedKeys).map((key) => ({
        "@assetType": "tvShows" as const,
        "@key": key,
      })),
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = buildPayload();

    if (isEditing) {
      updateMutation.mutate(
        { key: initialData["@key"], data },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar lista" : "Nova lista"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="watchlist-title"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Título
          </Label>
          <Input
            id="watchlist-title"
            value={form.title}
            disabled={isEditing}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
            placeholder="Meus favoritos"
            aria-describedby={
              errors.title ? "watchlist-title-error" : undefined
            }
          />
          {errors.title && (
            <p
              id="watchlist-title-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.title}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="watchlist-description"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Descrição (opcional)
          </Label>
          <Textarea
            id="watchlist-description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={4}
            className="resize-none"
          />
        </div>

        {allShows.length > 0 && (
          <div className="space-y-2">
            <Label
              className="text-muted-foreground text-xs uppercase tracking-wide"
              id="watchlist-shows-label"
            >
              Séries
            </Label>
            <div
              role="group"
              aria-labelledby="watchlist-shows-label"
              className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border-subtle bg-background p-3"
            >
              {allShows.map((show) => (
                <div key={show["@key"]} className="flex items-center gap-2">
                  <Checkbox
                    id={`show-${show["@key"]}`}
                    checked={form.selectedKeys.has(show["@key"])}
                    onCheckedChange={() => toggleShow(show["@key"])}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={`show-${show["@key"]}`}
                    className="cursor-pointer text-sm text-foreground leading-none"
                  >
                    {show.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </FormDrawer>
  );
}
