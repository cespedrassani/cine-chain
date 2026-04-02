export type AssetRef = {
  "@assetType": string;
  "@key": string;
};

export interface TvShow {
  "@assetType": "tvShows";
  "@key": string;
  title: string;
  description: string;
  recommendedAge: number;
}

export interface Season {
  "@assetType": "seasons";
  "@key": string;
  number: number;
  year: number;
  tvShow: AssetRef;
}

export interface Episode {
  "@assetType": "episodes";
  "@key": string;
  episodeNumber: number;
  title: string;
  description: string;
  releaseDate: string;
  rating?: number;
  season: AssetRef;
}

export interface Watchlist {
  "@assetType": "watchlist";
  "@key": string;
  title: string;
  description?: string;
  tvShows?: AssetRef[];
}

export type TvShowFormData = Omit<TvShow, "@assetType" | "@key">;
export type SeasonFormData = Omit<Season, "@assetType" | "@key" | "tvShow">;
export type EpisodeFormData = Omit<Episode, "@assetType" | "@key" | "season">;
export type WatchlistFormData = Omit<Watchlist, "@assetType" | "@key">;
