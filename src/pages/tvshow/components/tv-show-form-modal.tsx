import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { useCreateTvShow, useUpdateTvShow } from "@/hooks/use-tv-shows";
import type { TvShow, TvShowFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TvShowFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TvShow;
}

const empty: TvShowFormData = { title: "", description: "", recommendedAge: 0 };

function initForm(initialData?: TvShow): TvShowFormData {
  if (!initialData) return empty;
  return {
    title: initialData.title,
    description: initialData.description,
    recommendedAge: initialData.recommendedAge,
  };
}

export function TvShowFormModal({
  open,
  onOpenChange,
  initialData,
}: TvShowFormModalProps) {
  const isEditing = !!initialData;
  const [form, setForm] = useState<TvShowFormData>(() => initForm(initialData));
  const [errors, setErrors] = useState<
    Partial<Record<keyof TvShowFormData, string>>
  >({});

  const createMutation = useCreateTvShow();
  const updateMutation = useUpdateTvShow();
  const isPending = createMutation.isPending || updateMutation.isPending;

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = "Título é obrigatório";
    if (!form.description.trim()) next.description = "Descrição é obrigatória";
    if (!form.recommendedAge && form.recommendedAge !== 0)
      next.recommendedAge = "Idade é obrigatória";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (isEditing) {
      updateMutation.mutate(
        { key: initialData["@key"], data: form },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(form, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar série" : "Nova série"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="tvshow-title"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Título
          </Label>
          <Input
            id="tvshow-title"
            value={form.title}
            disabled={isEditing}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
            placeholder="Breaking Bad"
            aria-describedby={errors.title ? "tvshow-title-error" : undefined}
          />
          {errors.title && (
            <p
              id="tvshow-title-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.title}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="tvshow-description"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Descrição
          </Label>
          <Textarea
            id="tvshow-description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="A high school chemistry teacher..."
            rows={3}
            className="resize-none"
            aria-describedby={
              errors.description ? "tvshow-description-error" : undefined
            }
          />
          {errors.description && (
            <p
              id="tvshow-description-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="tvshow-age"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Idade Recomendada
          </Label>
          <Input
            id="tvshow-age"
            type="number"
            min={0}
            value={form.recommendedAge}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                recommendedAge: Number(e.target.value),
              }))
            }
            aria-describedby={
              errors.recommendedAge ? "tvshow-age-error" : undefined
            }
          />
          {errors.recommendedAge && (
            <p
              id="tvshow-age-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.recommendedAge}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[100px]"
          >
            {isPending && (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </FormDrawer>
  );
}
