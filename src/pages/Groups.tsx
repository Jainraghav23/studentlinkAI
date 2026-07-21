import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthGate } from "@/components/AuthGate";
import { GroupCard, type Group } from "@/components/groups/GroupCard";
import { GroupFilters } from "@/components/groups/GroupFilters";
import { GroupSubmissionForm } from "@/components/groups/GroupSubmissionForm";
import { Loader2, Users } from "lucide-react";

const GroupsContent = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["groups-approved"],
    queryFn: async () => {
      const { data: groups, error } = await supabase
        .from("groups" as any)
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const list = (groups as unknown as Group[]) || [];

      const ids = list.map((g) => g.id);
      let counts = new Map<string, number>();
      if (ids.length > 0) {
        const { data: members } = await supabase
          .from("group_members" as any)
          .select("group_id")
          .in("group_id", ids);
        (members as any[] | null)?.forEach((m) => {
          counts.set(m.group_id, (counts.get(m.group_id) || 0) + 1);
        });
      }
      return { groups: list, counts };
    },
  });

  const filtered = useMemo(() => {
    const list = data?.groups || [];
    return list.filter((g) => {
      const matchesCategory = category === "all" || g.category === category;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [data, search, category]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Alumni Groups | StudentLink AI</title>
        <meta name="description" content="Join niche alumni communities — by location, industry, class year, or interest." />
      </Helmet>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Alumni Groups
            </h1>
            <p className="text-muted-foreground mt-1">
              Join sub-communities and connect with alumni who share your interests.
            </p>
          </div>
          <GroupSubmissionForm onSubmitted={refetch} />
        </div>

        <div className="mb-6">
          <GroupFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No groups found. {data?.groups.length === 0 ? "Be the first to create one!" : "Try a different search."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => (
              <GroupCard key={g.id} group={g} memberCount={data?.counts.get(g.id) || 0} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const Groups = () => (
  <AuthGate title="Alumni Groups">
    <GroupsContent />
  </AuthGate>
);

export default Groups;
