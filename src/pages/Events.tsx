import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventSubmissionForm } from "@/components/events/EventSubmissionForm";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthGate } from "@/components/AuthGate";

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
  created_at: string;
  user_id: string;
}

const Events = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { data: approvedEvents, isLoading } = useQuery({
    queryKey: ["events", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events" as any)
        .select("*")
        .eq("status", "approved")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data as unknown as Event[]) || [];
    },
  });

  const { data: pastEvents } = useQuery({
    queryKey: ["events", "past"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events" as any)
        .select("*")
        .eq("status", "approved")
        .lt("event_date", new Date().toISOString())
        .order("event_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data as unknown as Event[]) || [];
    },
  });

  const { data: myPendingEvents } = useQuery({
    queryKey: ["events", "my-pending", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("events" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Event[]) || [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Alumni Events
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6">
            Connect with fellow alumni through events, meetups, and workshops.
          </p>
          {user ? (
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              variant="secondary"
            >
              <CalendarPlus className="w-5 h-5 mr-2" />
              Host an Event
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Login to Host Events</Link>
            </Button>
          )}
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 flex-1 space-y-10">
        {/* Pending events notice */}
        {myPendingEvents && myPendingEvents.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-amber-700">
              Your Pending Events
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myPendingEvents.map((event) => (
                <EventCard key={event.id} event={event} isPending />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming events */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">
            Upcoming Events
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : approvedEvents && approvedEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No upcoming events. Be the first to host one!
            </p>
          )}
        </section>

        {/* Past events */}
        {pastEvents && pastEvents.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4 text-muted-foreground">
              Past Events
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <EventSubmissionForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default Events;
