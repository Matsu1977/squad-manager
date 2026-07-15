import { Link } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlayerRole,
  PlayerStatus,
  ROLE_COLORS,
  STATUS_VARIANTS,
} from "@/lib/team";

interface PlayerCardProps {
  player: {
    id: string;
    first_name: string;
    last_name: string;
    role: PlayerRole;
    status: PlayerStatus;
    jersey_number?: number | null;
    photo_url?: string | null;
  };
}

export function PlayerCard({ player }: PlayerCardProps) {
  const initials = `${player.first_name[0]}${player.last_name[0]}`.toUpperCase();

  return (
    <Link to="/players/$id" params={{ id: player.id }}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={player.photo_url ?? undefined}
              alt={`${player.first_name} ${player.last_name}`}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">
              {player.first_name} {player.last_name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANTS[player.status]}>
                {player.status}
              </Badge>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${ROLE_COLORS[player.role]}`}
              >
                {player.role}
              </span>
            </div>
          </div>
          {player.jersey_number ? (
            <div className="text-2xl font-bold text-muted-foreground">
              #{player.jersey_number}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
