import api from "./api";
import type { Season, SeasonFormData, AssetRef } from "@/types";

export async function readSeason(key: string): Promise<Season> {
  const response = await api.post("/query/readAsset", {
    key: { "@assetType": "seasons", "@key": key },
  });
  return response.data;
}

export async function fetchSeasons(): Promise<Season[]> {
  const response = await api.post("/query/search", {
    query: { selector: { "@assetType": "seasons" } },
  });
  return response.data.result;
}

export async function createSeason(
  data: SeasonFormData,
  tvShow: AssetRef,
): Promise<Season> {
  const response = await api.post("/invoke/createAsset", {
    asset: [{ "@assetType": "seasons", ...data, tvShow }],
  });
  return response.data.result;
}

export async function updateSeason(
  key: string,
  data: SeasonFormData,
  tvShow: AssetRef,
): Promise<Season> {
  const response = await api.put("/invoke/updateAsset", {
    update: { "@assetType": "seasons", "@key": key, ...data, tvShow },
  });
  return response.data.result;
}

export async function deleteSeason(key: string): Promise<void> {
  await api.delete("/invoke/deleteAsset", {
    data: { key: { "@assetType": "seasons", "@key": key } },
  });
}
