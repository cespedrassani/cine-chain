import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function QueryError({ onRetry, message = "Não foi possível carregar os dados." }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed rounded-xl">
      <WifiOff className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <div className="text-center">
        <p className="text-foreground font-medium">Erro ao carregar</p>
        <p className="text-muted-foreground text-sm mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
