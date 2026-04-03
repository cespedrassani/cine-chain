import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { useCreateTvShow, useUpdateTvShow } from "@/hooks/use-tv-shows";
import type { TvShow } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { tvShowSchema, type TvShowSchema } from "@/lib/schemas";

interface TvShowFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TvShow;
}

export function TvShowFormModal({
  open,
  onOpenChange,
  initialData,
}: TvShowFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TvShowSchema>({
    resolver: zodResolver(tvShowSchema) as Resolver<TvShowSchema>,
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      recommendedAge: initialData?.recommendedAge ?? 0,
    },
  });

  const createMutation = useCreateTvShow();
  const updateMutation = useUpdateTvShow();
  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: TvShowSchema) {
    if (isEditing) {
      updateMutation.mutate(
        { key: initialData["@key"], data },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  }

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        onClick={() => onOpenChange(false)}
        variant="outline"
        className="min-w-[100px]"
      >
        Cancelar
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(onSubmit)}
        disabled={isPending}
        className="min-w-[100px]"
      >
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar série" : "Nova série"}
      footer={footer}
    >
      <form
        id="tvshow-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label
            htmlFor="tvshow-title"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Título
          </Label>
          <Input
            id="tvshow-title"
            readOnly={isEditing}
            placeholder="Breaking Bad"
            aria-describedby={errors.title ? "tvshow-title-error" : undefined}
            className={isEditing ? "cursor-not-allowed opacity-50" : undefined}
            {...register("title")}
          />
          {errors.title && (
            <p
              id="tvshow-title-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.title.message}
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
            placeholder="Era uma vez..."
            rows={3}
            className="resize-none"
            aria-describedby={
              errors.description ? "tvshow-description-error" : undefined
            }
            {...register("description")}
          />
          {errors.description && (
            <p
              id="tvshow-description-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.description.message}
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
            max={99}
            aria-describedby={
              errors.recommendedAge ? "tvshow-age-error" : undefined
            }
            {...register("recommendedAge")}
          />
          {errors.recommendedAge && (
            <p
              id="tvshow-age-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.recommendedAge.message}
            </p>
          )}
        </div>
      </form>
    </FormDrawer>
  );
}
