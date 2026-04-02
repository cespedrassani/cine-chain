import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { useCreateEpisode, useUpdateEpisode } from "@/hooks/use-episodes";
import type { Episode, EpisodeFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EpisodeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonKey: string;
  initialData?: Episode;
}

type FormState = Omit<EpisodeFormData, "releaseDate" | "rating"> & {
  releaseDate: string;
  rating: string;
};

const empty: FormState = {
  episodeNumber: 1,
  title: "",
  description: "",
  releaseDate: "",
  rating: "",
};

function initForm(initialData?: Episode): FormState {
  if (!initialData) return empty;
  return {
    episodeNumber: initialData.episodeNumber,
    title: initialData.title,
    description: initialData.description,
    releaseDate: initialData.releaseDate.split("T")[0],
    rating: initialData.rating !== undefined ? String(initialData.rating) : "",
  };
}

export function EpisodeFormModal({
  open,
  onOpenChange,
  seasonKey,
  initialData,
}: EpisodeFormModalProps) {
  const isEditing = !!initialData;
  const [form, setForm] = useState<FormState>(() => initForm(initialData));
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const createMutation = useCreateEpisode(seasonKey);
  const updateMutation = useUpdateEpisode(seasonKey);
  const isPending = createMutation.isPending || updateMutation.isPending;

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.episodeNumber || form.episodeNumber < 1)
      next.episodeNumber = "O número do episódio deve ser pelo menos 1";
    if (!form.title.trim()) next.title = "Título é obrigatório";
    if (!form.description.trim()) next.description = "Descrição é obrigatória";
    if (!form.releaseDate)
      next.releaseDate = "Data de lançamento é obrigatória";
    if (
      form.rating !== "" &&
      (Number(form.rating) < 0 || Number(form.rating) > 10)
    )
      next.rating = "A nota deve estar entre 0 e 10";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildPayload(): EpisodeFormData {
    return {
      episodeNumber: form.episodeNumber,
      title: form.title,
      description: form.description,
      releaseDate: new Date(form.releaseDate).toISOString(),
      ...(form.rating !== "" ? { rating: Number(form.rating) } : {}),
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const season = { "@assetType": "seasons" as const, "@key": seasonKey };
    const data = buildPayload();

    if (isEditing) {
      updateMutation.mutate(
        { key: initialData["@key"], data, season },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { data, season },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Episódio" : "Novo Episódio"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditing && (
          <div className="space-y-1.5">
            <Label
              htmlFor="episode-number"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Número do Episódio
            </Label>
            <Input
              id="episode-number"
              type="number"
              min={1}
              value={form.episodeNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  episodeNumber: Number(e.target.value),
                }))
              }
              aria-describedby={
                errors.episodeNumber ? "episode-number-error" : undefined
              }
            />
            {errors.episodeNumber && (
              <p
                id="episode-number-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.episodeNumber}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label
            htmlFor="episode-title"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Título
          </Label>
          <Input
            id="episode-title"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
            placeholder="Pilot"
            aria-describedby={
              errors.title ? "episode-title-error" : undefined
            }
          />
          {errors.title && (
            <p
              id="episode-title-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.title}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="episode-description"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Descrição
          </Label>
          <Textarea
            id="episode-description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="resize-none"
            rows={4}
            aria-describedby={
              errors.description ? "episode-description-error" : undefined
            }
          />
          {errors.description && (
            <p
              id="episode-description-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="episode-date"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Data de Lançamento
          </Label>
          <Input
            id="episode-date"
            type="date"
            value={form.releaseDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, releaseDate: e.target.value }))
            }
            aria-describedby={
              errors.releaseDate ? "episode-date-error" : undefined
            }
          />
          {errors.releaseDate && (
            <p
              id="episode-date-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.releaseDate}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="episode-rating"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Avaliação (opcional)
          </Label>
          <Input
            id="episode-rating"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={form.rating}
            onChange={(e) =>
              setForm((f) => ({ ...f, rating: e.target.value }))
            }
            placeholder="8.5"
            aria-describedby={
              errors.rating ? "episode-rating-error" : undefined
            }
          />
          {errors.rating && (
            <p
              id="episode-rating-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.rating}
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
