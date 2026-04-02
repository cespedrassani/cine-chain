import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Season } from "@/types";

interface SeasonCardProps {
  season: Season;
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
}

export function SeasonCard({ season, onEdit, onDelete }: SeasonCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={() => navigate(`/seasons/${encodeURIComponent(season["@key"])}`)}
    >
      <CardContent className="flex items-center justify-between gap-2 py-4">
        <div>
          <p className="font-medium">Season {season.number}</p>
          <p className="text-sm text-muted-foreground">{season.year}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Editar Temporada ${season.number}`}
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(season);
            }}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Excluir Temporada ${season.number}`}
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(season);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
