import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventSubmission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  max_attendees: number | null;
  contact_email: string | null;
  status: string;
  created_at: string;
}

const AdminEventManagement = () => {
  const [events, setEvents] = useState<EventSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EventSubmission | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load events");
    } else {
      setEvents((data as unknown as EventSubmission[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAction = async (event: EventSubmission, action: "approved" | "rejected") => {
    setProcessing(event.id);
    try {
      const { error } = await supabase
        .from("events" as any)
        .update({ status: action } as any)
        .eq("id", event.id);

      if (error) throw error;
      toast.success(`Event "${event.title}" has been ${action}.`);
      fetchEvents();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} event`);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = events.filter((e) => e.status === "pending").length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Event Submissions</CardTitle>
          <CardDescription>
            {pendingCount > 0
              ? `${pendingCount} pending event${pendingCount > 1 ? "s" : ""} to review`
              : "No pending events"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No event submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{format(new Date(event.event_date), "PP")}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="capitalize">{event.event_type}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelected(event)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {event.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleAction(event, "approved")}
                                disabled={processing === event.id}
                              >
                                {processing === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleAction(event, "rejected")}
                                disabled={processing === event.id}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Event Details</DialogTitle>
            <DialogDescription>Review event submission</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selected.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selected.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{format(new Date(selected.event_date), "PPp")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selected.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selected.event_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Attendees</p>
                  <p className="font-medium">{selected.max_attendees || "Unlimited"}</p>
                </div>
              </div>
              {selected.contact_email && (
                <div>
                  <p className="text-sm text-muted-foreground">Contact Email</p>
                  <p className="font-medium">{selected.contact_email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{selected.description}</p>
              </div>
              {selected.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction(selected, "approved")}
                    disabled={processing === selected.id}
                  >
                    {processing === selected.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAction(selected, "rejected")}
                    disabled={processing === selected.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminEventManagement;
