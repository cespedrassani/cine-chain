import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { parseApiError } from "@/lib/parse-api-error";
import {
  fetchEpisodes,
  createEpisode,
  updateEpisode,
  deleteEpisode,
} from "@/services/episodes";
import type { EpisodeFormData, AssetRef } from "@/types";

export function useEpisodesBySeason(seasonKey: string) {
  return useQuery({
    queryKey: queryKeys.episodes.bySeason(seasonKey),
    queryFn: () =>
      fetchEpisodes().then((episodes) =>
        episodes.filter((e) => e.season["@key"] === seasonKey),
      ),
    enabled: !!seasonKey,
  });
}

export function useEpisodesBySeasons(seasonKeys: string[]) {
  return useQuery({
    queryKey: ["episodes", "bySeasons", ...seasonKeys.slice().sort()],
    queryFn: () =>
      fetchEpisodes().then((episodes) =>
        episodes.filter((e) => seasonKeys.includes(e.season["@key"])),
      ),
    enabled: seasonKeys.length > 0,
  });
}

export function useCreateEpisode(seasonKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      season,
    }: {
      data: EpisodeFormData;
      season: AssetRef;
    }) => createEpisode(data, season),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.episodes.bySeason(seasonKey),
      });
      toast.success("Episódio criado com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao criar episódio."));
    },
  });
}

export function useUpdateEpisode(seasonKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      data,
      season,
    }: {
      key: string;
      data: EpisodeFormData;
      season: AssetRef;
    }) => updateEpisode(key, data, season),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.episodes.bySeason(seasonKey),
      });
      toast.success("Episódio atualizado com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao atualizar episódio."));
    },
  });
}

export function useDeleteEpisode(seasonKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteEpisode(key),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.episodes.bySeason(seasonKey),
      });
      toast.success("Episódio removido com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao remover episódio."));
    },
  });
}
