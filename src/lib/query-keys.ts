export const queryKeys = {
  tvShows: {
    all: ["tvShows"] as const,
    detail: (key: string) => ["tvShows", key] as const,
  },
  seasons: {
    all: ["seasons"] as const,
    detail: (key: string) => ["seasons", key] as const,
    byShow: (tvShowKey: string) => ["seasons", "byShow", tvShowKey] as const,
  },
  episodes: {
    bySeason: (seasonKey: string) =>
      ["episodes", "bySeason", seasonKey] as const,
  },
  watchlist: {
    all: ["watchlist"] as const,
  },
};
