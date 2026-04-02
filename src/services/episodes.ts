import api from "./api";
import type { Episode, EpisodeFormData, AssetRef } from "@/types";

export async function fetchEpisodes(): Promise<Episode[]> {
  const response = await api.post("/query/search", {
    query: { selector: { "@assetType": "episodes" } },
  });
  return response.data.result;
}

export async function createEpisode(
  data: EpisodeFormData,
  season: AssetRef,
): Promise<Episode> {
  const response = await api.post("/invoke/createAsset", {
    asset: [{ "@assetType": "episodes", ...data, season }],
  });
  return response.data.result;
}

export async function updateEpisode(
  key: string,
  data: EpisodeFormData,
  season: AssetRef,
): Promise<Episode> {
  const response = await api.put("/invoke/updateAsset", {
    update: { "@assetType": "episodes", "@key": key, ...data, season },
  });
  return response.data.result;
}

export async function deleteEpisode(key: string): Promise<void> {
  await api.delete("/invoke/deleteAsset", {
    data: { key: { "@assetType": "episodes", "@key": key } },
  });
}
