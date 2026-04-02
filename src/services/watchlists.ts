import api from "./api";
import type { Watchlist, WatchlistFormData } from "@/types";

export async function fetchWatchlists(): Promise<Watchlist[]> {
  const response = await api.post("/query/search", {
    query: { selector: { "@assetType": "watchlist" } },
  });
  return response.data.result;
}

export async function createWatchlist(
  data: WatchlistFormData,
): Promise<Watchlist> {
  const response = await api.post("/invoke/createAsset", {
    asset: [{ "@assetType": "watchlist", ...data }],
  });
  return response.data.result;
}

export async function updateWatchlist(
  key: string,
  data: WatchlistFormData,
): Promise<Watchlist> {
  const response = await api.put("/invoke/updateAsset", {
    update: { "@assetType": "watchlist", "@key": key, ...data },
  });
  return response.data.result;
}

export async function deleteWatchlist(key: string): Promise<void> {
  await api.delete("/invoke/deleteAsset", {
    data: { key: { "@assetType": "watchlist", "@key": key } },
  });
}
