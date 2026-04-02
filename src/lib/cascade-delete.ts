import type { QueryClient } from "@tanstack/react-query";
import type { Episode, Season, Watchlist } from "@/types";
import { fetchEpisodes, deleteEpisode } from "@/services/episodes";
import { fetchSeasons, deleteSeason } from "@/services/seasons";
import { fetchWatchlists, updateWatchlist } from "@/services/watchlists";
import { deleteTvShow } from "@/services/tv-shows";
import { queryKeys } from "@/lib/query-keys";

export async function cascadeDeleteSeason(
  queryClient: QueryClient,
  seasonKey: string,
): Promise<void> {
  const cached = queryClient.getQueryData<Episode[]>(
    queryKeys.episodes.bySeason(seasonKey),
  );
  const episodes =
    cached ??
    (await fetchEpisodes()).filter((e) => e.season["@key"] === seasonKey);

  await Promise.all(episodes.map((e) => deleteEpisode(e["@key"])));
  await deleteSeason(seasonKey);

  queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.episodes.bySeason(seasonKey),
  });
}

export async function cascadeDeleteTvShow(
  queryClient: QueryClient,
  tvShowKey: string,
): Promise<void> {
  const cachedSeasons = queryClient.getQueryData<Season[]>(
    queryKeys.seasons.byShow(tvShowKey),
  );
  const seasons =
    cachedSeasons ??
    (await fetchSeasons()).filter((s) => s.tvShow["@key"] === tvShowKey);

  const cachedWatchlists = queryClient.getQueryData<Watchlist[]>(
    queryKeys.watchlist.all,
  );
  const watchlists = cachedWatchlists ?? (await fetchWatchlists());
  const affectedWatchlists = watchlists.filter((w) =>
    (w.tvShows ?? []).some((ref) => ref["@key"] === tvShowKey),
  );

  const episodesBySeason = new Map<string, Episode[]>();
  for (const season of seasons) {
    const cached = queryClient.getQueryData<Episode[]>(
      queryKeys.episodes.bySeason(season["@key"]),
    );
    if (cached) episodesBySeason.set(season["@key"], cached);
  }

  const uncached = seasons.filter((s) => !episodesBySeason.has(s["@key"]));
  if (uncached.length > 0) {
    const all = await fetchEpisodes();
    for (const season of uncached) {
      episodesBySeason.set(
        season["@key"],
        all.filter((e) => e.season["@key"] === season["@key"]),
      );
    }
  }

  const allEpisodes = Array.from(episodesBySeason.values()).flat();

  await Promise.all([
    ...affectedWatchlists.map((w) =>
      updateWatchlist(w["@key"], {
        title: w.title,
        ...(w.description ? { description: w.description } : {}),
        tvShows: (w.tvShows ?? []).filter((ref) => ref["@key"] !== tvShowKey),
      }),
    ),
    ...allEpisodes.map((e) => deleteEpisode(e["@key"])),
  ]);

  await Promise.all(seasons.map((s) => deleteSeason(s["@key"])));
  await deleteTvShow(tvShowKey);

  queryClient.invalidateQueries({ queryKey: queryKeys.tvShows.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
}
