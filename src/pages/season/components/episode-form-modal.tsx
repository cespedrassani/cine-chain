import { useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { useCreateEpisode, useUpdateEpisode } from "@/hooks/use-episodes";
import type { Episode } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { episodeSchema, type EpisodeSchema } from "@/lib/schemas";

interface EpisodeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonKey: string;
  initialData?: Episode;
}

export function EpisodeFormModal({
  open,
  onOpenChange,
  seasonKey,
  initialData,
}: EpisodeFormModalProps) {
  const isEditing = !!initialData;
  const dateInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EpisodeSchema>({
    resolver: zodResolver(episodeSchema) as Resolver<EpisodeSchema>,
    defaultValues: {
      episodeNumber: initialData?.episodeNumber ?? 1,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      releaseDate: initialData?.releaseDate
        ? initialData.releaseDate.split("T")[0]
        : "",
      rating: initialData?.rating !== undefined ? initialData.rating : 0,
    },
  });

  const { ref: releaseDateRef, ...releaseDateRest } = register("releaseDate");

  const createMutation = useCreateEpisode(seasonKey);
  const updateMutation = useUpdateEpisode(seasonKey);
  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: EpisodeSchema) {
    const season = { "@assetType": "seasons" as const, "@key": seasonKey };
    const payload = {
      episodeNumber: data.episodeNumber,
      title: data.title,
      description: data.description,
      releaseDate: new Date(data.releaseDate).toISOString(),
      ...(data.rating !== "" ? { rating: Number(data.rating) } : {}),
    };

    if (isEditing) {
      updateMutation.mutate(
        { key: initialData["@key"], data: payload, season },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { data: payload, season },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  const footer = (
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
        onClick={handleSubmit(onSubmit)}
        disabled={isPending}
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
      title={isEditing ? "Editar Episódio" : "Novo Episódio"}
      footer={footer}
    >
      <form
        id="episode-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
              aria-describedby={
                errors.episodeNumber ? "episode-number-error" : undefined
              }
              {...register("episodeNumber")}
            />
            {errors.episodeNumber && (
              <p
                id="episode-number-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.episodeNumber.message}
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
            placeholder="Piloto"
            aria-describedby={errors.title ? "episode-title-error" : undefined}
            {...register("title")}
          />
          {errors.title && (
            <p
              id="episode-title-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.title.message}
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
            className="resize-none"
            rows={4}
            placeholder="Era uma vez..."
            aria-describedby={
              errors.description ? "episode-description-error" : undefined
            }
            {...register("description")}
          />
          {errors.description && (
            <p
              id="episode-description-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.description.message}
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
          <div className="relative">
            <Input
              id="episode-date"
              type="date"
              min="1900-01-01"
              max={new Date().toISOString().split("T")[0]}
              aria-describedby={
                errors.releaseDate ? "episode-date-error" : undefined
              }
              className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:hidden"
              ref={(e) => {
                releaseDateRef(e);
                dateInputRef.current = e;
              }}
              {...releaseDateRest}
            />
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label="Abrir calendário"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
          {errors.releaseDate && (
            <p
              id="episode-date-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.releaseDate.message}
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
            placeholder="8.5"
            aria-describedby={
              errors.rating ? "episode-rating-error" : undefined
            }
            {...register("rating")}
          />
          {errors.rating && (
            <p
              id="episode-rating-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.rating.message}
            </p>
          )}
        </div>
      </form>
    </FormDrawer>
  );
}
