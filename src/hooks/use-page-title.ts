import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | CineChain` : "CineChain";
  }, [title]);
}
