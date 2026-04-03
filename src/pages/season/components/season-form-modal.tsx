import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Label } from "@/components/ui/label";
import { useCreateSeason, useUpdateSeason } from "@/hooks/use-seasons";
import type { Season } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seasonSchema, type SeasonSchema } from "@/lib/schemas";

interface SeasonFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tvShowKey: string;
  initialData?: Season;
}

export function SeasonFormModal({
  open,
  onOpenChange,
  tvShowKey,
  initialData,
}: SeasonFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SeasonSchema>({
    resolver: zodResolver(seasonSchema) as Resolver<SeasonSchema>,
    defaultValues: {
      number: initialData?.number ?? 1,
      year: initialData?.year ?? new Date().getFullYear(),
    },
  });

  const createMutation = useCreateSeason(tvShowKey);
  const updateMutation = useUpdateSeason(tvShowKey);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const tvShow = { "@assetType": "tvShows" as const, "@key": tvShowKey };

  function onSubmit(data: SeasonSchema) {
    if (isEditing) {
      updateMutation.mutate(
        {
          key: initialData["@key"],
          data: { number: initialData.number, year: data.year },
          tvShow,
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { data, tvShow },
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
      title={isEditing ? "Editar Temporada" : "Nova Temporada"}
      footer={footer}
    >
      <form
        id="season-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
              aria-describedby={
                errors.number ? "season-number-error" : undefined
              }
              {...register("number")}
            />
            {errors.number && (
              <p
                id="season-number-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.number.message}
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
            aria-describedby={errors.year ? "season-year-error" : undefined}
            {...register("year")}
          />
          {errors.year && (
            <p
              id="season-year-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.year.message}
            </p>
          )}
        </div>
      </form>
    </FormDrawer>
  );
}
