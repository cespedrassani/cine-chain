import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
          <h1 className="text-foreground text-xl font-bold">Algo deu errado</h1>
          <p className="text-muted-foreground text-sm">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </div>
      </div>
    );
  }
}
