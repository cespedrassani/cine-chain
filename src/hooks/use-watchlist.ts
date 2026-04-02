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
      toast.success("Watchlist criada com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteWatchlist(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
      toast.success("Watchlist removida com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
