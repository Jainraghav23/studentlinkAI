import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarDays, MapPin, Users, Clock, Pencil, Trash2, Images } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EventEditForm } from "./EventEditForm";
import { EventGallery } from "./EventGallery";

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
  user_id: string;
}

interface EventCardProps {
  event: Event;
  isPending?: boolean;
  isPast?: boolean;
}

export function EventCard({ event, isPending, isPast }: EventCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from("events" as any).delete().eq("id", event.id);
      if (error) throw error;
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <>
      <Card className={`shadow-card overflow-hidden ${isPast ? "opacity-70" : ""}`}>
        {event.image_url && (
          <div className="w-full h-40 overflow-hidden">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-display text-lg leading-tight">{event.title}</CardTitle>
            <div className="flex gap-1 shrink-0">
              <Badge variant="outline" className="text-xs capitalize">{event.event_type}</Badge>
              {isPending && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">Pending</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
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
          {!isPending && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowGallery(true)}
            >
              <Images className="w-4 h-4 mr-1.5" />
              {isPast ? "View Gallery" : "Photo Gallery"}
            </Button>
          )}
          {isPending && (
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowEdit(true)}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={() => setShowDelete(true)}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!isPending && (
        <EventGallery
          open={showGallery}
          onOpenChange={setShowGallery}
          eventId={event.id}
          eventTitle={event.title}
        />
      )}

      {isPending && (
        <>
          <EventEditForm open={showEdit} onOpenChange={setShowEdit} event={event} />
          <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{event.title}"? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
