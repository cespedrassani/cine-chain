import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { TvShowsPage } from "@/pages/tvshow/tv-shows-page";
import { TvShowDetailPage } from "@/pages/tvshow/tv-show-detail-page";
import { SeasonDetailPage } from "@/pages/season/season-detail-page";
import { WatchlistPage } from "@/pages/watchlist/watchlist-page";
import { NotFoundPage } from "@/pages/not-found-page";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/tv-shows" replace />} />
        <Route path="/tv-shows" element={<TvShowsPage />} />
        <Route path="/tv-shows/:key" element={<TvShowDetailPage />} />
        <Route path="/seasons/:key" element={<SeasonDetailPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
