import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { parseApiError, isReferenceError } from "@/lib/parse-api-error";
import {
  fetchTvShows,
  createTvShow,
  updateTvShow,
  deleteTvShow,
} from "@/services/tv-shows";
import type { TvShowFormData } from "@/types";

export function useTvShows(search = "") {
  return useQuery({
    queryKey: search
      ? [...queryKeys.tvShows.all, search]
      : queryKeys.tvShows.all,
    queryFn: () => fetchTvShows(search),
  });
}

export function useTvShow(key: string) {
  return useQuery({
    queryKey: queryKeys.tvShows.detail(key),
    queryFn: () =>
      fetchTvShows().then((shows) => shows.find((s) => s["@key"] === key)),
    enabled: !!key,
  });
}

export function useCreateTvShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TvShowFormData) => createTvShow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tvShows.all });
      toast.success("Série criada com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao criar série."));
    },
  });
}

export function useUpdateTvShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: TvShowFormData }) =>
      updateTvShow(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tvShows.all });
      toast.success("Série atualizada com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao atualizar série."));
    },
  });
}

export function useDeleteTvShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteTvShow(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tvShows.all });
      toast.success("Série removida com sucesso.");
    },
    onError: (error: unknown) => {
      if (!isReferenceError(error)) {
        toast.error(parseApiError(error, "Erro ao remover série."));
      }
    },
  });
}
