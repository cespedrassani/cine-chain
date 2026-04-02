import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function FormDrawer({
  open,
  onOpenChange,
  title,
  children,
}: FormDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300",
          open && mounted ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={open ? undefined : true}
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full sm:w-[420px]",
          "bg-card border-l border-border flex flex-col outline-none",
          "transition-transform duration-300 ease-in-out",
          open && mounted
            ? "translate-x-0"
            : "translate-x-full pointer-events-none",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-foreground font-semibold text-base">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>,
    document.body,
  );
}
