import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchWatchlists,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
} from "@/services/watchlists";
import type { WatchlistFormData } from "@/types";
import { parseApiError } from "@/lib/parse-api-error";

export function useWatchlist() {
  return useQuery({
    queryKey: queryKeys.watchlist.all,
    queryFn: fetchWatchlists,
  });
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WatchlistFormData) => createWatchlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
      toast.success("Lista criada com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao criar lista."));
    },
  });
}

export function useUpdateWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: WatchlistFormData }) =>
      updateWatchlist(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
      toast.success("Lista atualizada com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao atualizar lista."));
    },
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteWatchlist(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
      toast.success("Lista removida com sucesso.");
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error, "Erro ao remover Lista."));
    },
  });
}
