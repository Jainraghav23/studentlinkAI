import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InterviewSubmissionForm } from "@/components/interviews/InterviewSubmissionForm";
import { InterviewCard, type InterviewExperience } from "@/components/interviews/InterviewCard";
import { InterviewFilters } from "@/components/interviews/InterviewFilters";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthGate } from "@/components/AuthGate";

const Interviews = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [result, setResult] = useState("all");

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_experiences" as any)
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as InterviewExperience[]) || [];
    },
  });

  const { data: myPending } = useQuery({
    queryKey: ["interviews", "my-pending", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("interview_experiences" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as InterviewExperience[]) || [];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    if (!interviews) return [];
    return interviews.filter((i) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || i.company.toLowerCase().includes(q) || i.role.toLowerCase().includes(q);
      const matchesDifficulty = difficulty === "all" || i.difficulty === difficulty;
      const matchesResult = result === "all" || i.result === result;
      return matchesSearch && matchesDifficulty && matchesResult;
    });
  }, [interviews, search, difficulty, result]);

  return (
    <AuthGate title="Interview Experiences">
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Interview Experiences
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6">
            Learn from real interview experiences shared by fellow alumni. Get insights on questions, processes, and tips.
          </p>
          {user ? (
            <Button onClick={() => setShowForm(true)} size="lg" variant="secondary">
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              Share Your Experience
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Login to Share</Link>
            </Button>
          )}
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        <InterviewFilters
          search={search} onSearchChange={setSearch}
          difficulty={difficulty} onDifficultyChange={setDifficulty}
          result={result} onResultChange={setResult}
        />

        {myPending && myPending.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-amber-700">Your Pending Submissions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myPending.map((i) => <InterviewCard key={i.id} interview={i} isPending />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">All Experiences</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((i) => <InterviewCard key={i.id} interview={i} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              {interviews && interviews.length > 0 ? "No experiences match your filters." : "No experiences shared yet. Be the first!"}
            </p>
          )}
        </section>
      </main>

      <Footer />
      <InterviewSubmissionForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default Interviews;
