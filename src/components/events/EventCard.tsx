import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  max_attendees: number | null;
  contact_email: string | null;
  image_url: string | null;
  status: string;
}

interface EventCardProps {
  event: Event;
  isPending?: boolean;
  isPast?: boolean;
}

export function EventCard({ event, isPending, isPast }: EventCardProps) {
  return (
    <Card className={`shadow-card overflow-hidden ${isPast ? "opacity-70" : ""}`}>
      {event.image_url && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-display text-lg leading-tight">
            {event.title}
          </CardTitle>
          <div className="flex gap-1 shrink-0">
            <Badge variant="outline" className="text-xs capitalize">
              {event.event_type}
            </Badge>
            {isPending && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                Pending
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>{format(new Date(event.event_date), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{format(new Date(event.event_date), "p")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{event.location}</span>
          </div>
          {event.max_attendees && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 shrink-0" />
              <span>Max {event.max_attendees} attendees</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
