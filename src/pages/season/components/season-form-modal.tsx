import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { useCreateSeason, useUpdateSeason } from "@/hooks/use-seasons";
import type { Season, SeasonFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SeasonFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tvShowKey: string;
  initialData?: Season;
}

const empty: SeasonFormData = { number: 1, year: new Date().getFullYear() };

function initForm(initialData?: Season): SeasonFormData {
  if (!initialData) return empty;
  return { number: initialData.number, year: initialData.year };
}

export function SeasonFormModal({
  open,
  onOpenChange,
  tvShowKey,
  initialData,
}: SeasonFormModalProps) {
  const isEditing = !!initialData;
  const [form, setForm] = useState<SeasonFormData>(() => initForm(initialData));
  const [errors, setErrors] = useState<
    Partial<Record<keyof SeasonFormData, string>>
  >({});

  const createMutation = useCreateSeason(tvShowKey);
  const updateMutation = useUpdateSeason(tvShowKey);
  const isPending = createMutation.isPending || updateMutation.isPending;

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.number || form.number < 1)
      next.number = "O número da temporada deve ser pelo menos 1";
    if (!form.year || form.year < 1900) next.year = "Informe um ano válido";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const tvShow = { "@assetType": "tvShows" as const, "@key": tvShowKey };

    if (isEditing) {
      updateMutation.mutate(
        {
          key: initialData["@key"],
          data: { number: initialData.number, year: form.year },
          tvShow,
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { data: form, tvShow },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Temporada" : "Nova Temporada"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditing && (
          <div className="space-y-1.5">
            <Label
              htmlFor="season-number"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Número da Temporada
            </Label>
            <Input
              id="season-number"
              type="number"
              min={1}
              value={form.number}
              onChange={(e) =>
                setForm((f) => ({ ...f, number: Number(e.target.value) }))
              }
              aria-describedby={
                errors.number ? "season-number-error" : undefined
              }
            />
            {errors.number && (
              <p
                id="season-number-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.number}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label
            htmlFor="season-year"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Ano
          </Label>
          <Input
            id="season-year"
            type="number"
            min={1900}
            value={form.year}
            onChange={(e) =>
              setForm((f) => ({ ...f, year: Number(e.target.value) }))
            }
            aria-describedby={errors.year ? "season-year-error" : undefined}
          />
          {errors.year && (
            <p
              id="season-year-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.year}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </FormDrawer>
  );
}
