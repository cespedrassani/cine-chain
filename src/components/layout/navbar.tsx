import { Bookmark } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-md">
      <header className="h-16 flex items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <NavLink
          to="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="CineChain — página inicial"
        >
          <span
            className="bg-primary text-primary-foreground font-bold text-sm px-1.5 py-0.5 rounded-sm leading-none"
            aria-hidden="true"
          >
            CC
          </span>
          <span className="hidden sm:inline text-foreground font-bold text-lg tracking-wide">
            CineChain
          </span>
        </NavLink>

        <nav aria-label="Navegação principal">
          <NavLink
            to="/watchlist"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium shrink-0 transition-colors relative pb-1 ${
                isActive
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
            aria-current={undefined}
          >
            {({ isActive }) => (
              <>
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Minhas Listas</span>
                {isActive && <span className="sr-only">(página atual)</span>}
              </>
            )}
          </NavLink>
        </nav>
      </header>
      <div className="h-px bg-border" aria-hidden="true" />
    </div>
  );
}
