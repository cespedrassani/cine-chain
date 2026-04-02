import api from "./api";
import type { TvShow, TvShowFormData } from "@/types";

export async function fetchTvShows(search = ""): Promise<TvShow[]> {
  const selector: Record<string, unknown> = { "@assetType": "tvShows" };
  if (search) selector.title = { $regex: `(?i)${search}` };
  const response = await api.post("/query/search", { query: { selector } });
  return response.data.result;
}

export async function createTvShow(data: TvShowFormData): Promise<TvShow> {
  const response = await api.post("/invoke/createAsset", {
    asset: [{ "@assetType": "tvShows", ...data }],
  });
  return response.data.result;
}

export async function updateTvShow(
  key: string,
  data: TvShowFormData,
): Promise<TvShow> {
  const response = await api.put("/invoke/updateAsset", {
    update: { "@assetType": "tvShows", "@key": key, ...data },
  });
  return response.data.result;
}

export async function deleteTvShow(key: string): Promise<void> {
  await api.delete("/invoke/deleteAsset", {
    data: { key: { "@assetType": "tvShows", "@key": key } },
  });
}
