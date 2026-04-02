import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";

export function Layout() {
  return (
    <div id="main-layout" className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold focus:outline-none"
      >
        Ir para o conteúdo principal
      </a>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
