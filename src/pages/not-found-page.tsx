import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  usePageTitle("Página não encontrada");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-foreground text-4xl font-bold">404</h1>
        <p className="text-foreground font-medium">Página não encontrada</p>
        <p className="text-muted-foreground text-sm mt-1">
          O endereço que você acessou não existe.
        </p>
      </div>
      <Button onClick={() => navigate("/tv-shows")}>Voltar ao início</Button>
    </div>
  );
}
