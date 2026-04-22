import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GroupMembersList } from "@/components/groups/GroupMembersList";
import { PostForm } from "@/components/posts/PostForm";
import { PostList } from "@/components/posts/PostList";
import { ArrowLeft, Loader2, Lock, Globe, Users, LogOut, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Group } from "@/components/groups/GroupCard";

const categoryLabels: Record<string, string> = {
  location: "Location",
  industry: "Industry",
  class_year: "Class Year",
  interest: "Interest",
};

const GroupDetailContent = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups" as any)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Group | null;
    },
    enabled: !!id,
  });

  const { data: membership, isLoading: loadingMembership } = useQuery({
    queryKey: ["group-membership", id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      const { data } = await supabase
        .from("group_members" as any)
        .select("id")
        .eq("group_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      return data as { id: string } | null;
    },
    enabled: !!id && !!user?.id,
  });

  const { data: memberCount } = useQuery({
    queryKey: ["group-member-count", id],
    queryFn: async () => {
      const { count } = await supabase
        .from("group_members" as any)
        .select("*", { count: "exact", head: true })
        .eq("group_id", id);
      return count || 0;
    },
    enabled: !!id,
  });

  // Realtime invalidation for membership changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`group-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_members", filter: `group_id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ["group-membership", id] });
        qc.invalidateQueries({ queryKey: ["group-member-count", id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

  const handleJoin = async () => {
    if (!user || !id) return;
    const { error } = await supabase.from("group_members" as any).insert({
      group_id: id, user_id: user.id,
    } as any);
    if (error) toast.error(error.message);
    else {
      toast.success("Joined!");
      qc.invalidateQueries({ queryKey: ["group-membership", id] });
      qc.invalidateQueries({ queryKey: ["group-member-count", id] });
    }
  };

  const handleLeave = async () => {
    if (!user || !id) return;
    const { error } = await supabase
      .from("group_members" as any)
      .delete()
      .eq("group_id", id)
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Left group");
      qc.invalidateQueries({ queryKey: ["group-membership", id] });
      qc.invalidateQueries({ queryKey: ["group-member-count", id] });
    }
  };

  if (loadingGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Group not found</h1>
            <Button asChild className="mt-4"><Link to="/groups">Back to groups</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isMember = !!membership;
  const canPost = isMember;
  const canViewPosts = group.privacy === "public" || isMember;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{group.name} | Alumni Groups</title>
        <meta name="description" content={group.description.slice(0, 160)} />
      </Helmet>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/groups"><ArrowLeft className="w-4 h-4 mr-1" /> All groups</Link>
        </Button>

        {/* Header */}
        <div className="rounded-xl overflow-hidden border mb-6">
          {group.cover_image_url ? (
            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${group.cover_image_url})` }} />
          ) : (
            <div className="h-40 gradient-hero" />
          )}
          <div className="p-6 bg-card">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary">{categoryLabels[group.category] || group.category}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {group.privacy === "private" ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {group.privacy}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {memberCount ?? 0} member{memberCount === 1 ? "" : "s"}
                  </span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">{group.name}</h1>
                <p className="text-muted-foreground mt-2">{group.description}</p>
              </div>
              <div className="shrink-0">
                {loadingMembership ? (
                  <Button disabled><Loader2 className="w-4 h-4 animate-spin" /></Button>
                ) : isMember ? (
                  <Button variant="outline" onClick={handleLeave}>
                    <LogOut className="w-4 h-4 mr-2" /> Leave
                  </Button>
                ) : (
                  <Button onClick={handleJoin}>
                    <UserPlus className="w-4 h-4 mr-2" /> Join group
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {canViewPosts ? (
              <>
                {canPost && (
                  <PostForm
                    groupId={group.id}
                    onPostCreated={() => qc.invalidateQueries({ queryKey: ["posts", group.id] })}
                  />
                )}
                {!canPost && isMember === false && (
                  <div className="p-4 border rounded-lg bg-muted/50 text-sm text-muted-foreground text-center">
                    Join this group to post.
                  </div>
                )}
                <PostList groupId={group.id} />
              </>
            ) : (
              <div className="p-8 border rounded-lg bg-muted/50 text-center">
                <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">This is a private group. Join to view posts.</p>
              </div>
            )}
          </div>
          <aside>
            <GroupMembersList groupId={group.id} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const GroupDetail = () => (
  <AuthGate title="this group">
    <GroupDetailContent />
  </AuthGate>
);

export default GroupDetail;