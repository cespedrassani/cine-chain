import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  readSeason,
  fetchSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
} from "@/services/seasons";
import type { SeasonFormData, AssetRef } from "@/types";

export function useSeason(key: string) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(key),
    queryFn: () => readSeason(key),
    enabled: !!key,
  });
}

export function useSeasonsByShow(tvShowKey: string) {
  return useQuery({
    queryKey: queryKeys.seasons.byShow(tvShowKey),
    queryFn: () =>
      fetchSeasons().then((seasons) =>
        seasons.filter((s) => s.tvShow["@key"] === tvShowKey),
      ),
    enabled: !!tvShowKey,
  });
}

export function useCreateSeason(tvShowKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      tvShow,
    }: {
      data: SeasonFormData;
      tvShow: AssetRef;
    }) => createSeason(data, tvShow),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.seasons.byShow(tvShowKey),
      });
      toast.success("Temporada criada com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSeason(tvShowKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      data,
      tvShow,
    }: {
      key: string;
      data: SeasonFormData;
      tvShow: AssetRef;
    }) => updateSeason(key, data, tvShow),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.seasons.byShow(tvShowKey),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.seasons.detail(variables.key),
      });
      toast.success("Temporada atualizada com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSeason(tvShowKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteSeason(key),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.seasons.byShow(tvShowKey),
      });
      toast.success("Temporada removida com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
