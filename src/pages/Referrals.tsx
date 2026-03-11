import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReferralSubmissionForm } from "@/components/referrals/ReferralSubmissionForm";
import { ReferralCard, type Referral } from "@/components/referrals/ReferralCard";
import { ReferralFilters } from "@/components/referrals/ReferralFilters";
import { Button } from "@/components/ui/button";
import { HandshakeIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthGate } from "@/components/AuthGate";

const Referrals = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const { data: referrals, isLoading } = useQuery({
    queryKey: ["referrals", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals" as any)
        .select("*")
        .eq("status", "approved")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Referral[]) || [];
    },
  });

  const { data: myPending } = useQuery({
    queryKey: ["referrals", "my-pending", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("referrals" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Referral[]) || [];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    if (!referrals) return [];
    return referrals.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || r.company.toLowerCase().includes(q) || r.role.toLowerCase().includes(q);
      const matchesType = type === "all" || r.type === type;
      return matchesSearch && matchesType;
    });
  }, [referrals, search, type]);

  return (
    <AuthGate title="Job Referrals">
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Job Referrals
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6">
            Connect with alumni who can refer you at their company, or offer referrals to help fellow graduates land their next role.
          </p>
          {user ? (
            <Button onClick={() => setShowForm(true)} size="lg" variant="secondary">
              <HandshakeIcon className="w-5 h-5 mr-2" />
              Post a Referral
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Login to Post</Link>
            </Button>
          )}
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        <ReferralFilters search={search} onSearchChange={setSearch} type={type} onTypeChange={setType} />

        {myPending && myPending.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold mb-4 text-amber-700">Your Pending Submissions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myPending.map((r) => <ReferralCard key={r.id} referral={r} isPending />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">All Referrals</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => <ReferralCard key={r.id} referral={r} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              {referrals && referrals.length > 0 ? "No referrals match your filters." : "No referrals posted yet. Be the first!"}
            </p>
          )}
        </section>
      </main>

      <Footer />
      <ReferralSubmissionForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default Referrals;
