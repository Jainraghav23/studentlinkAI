import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";

export const PostList = () => {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author profiles
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("alumni_profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return postsData.map((post) => ({
        ...post,
        author: profileMap.get(post.user_id) || {
          full_name: "Unknown User",
          avatar_url: null,
        },
      }));
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        (payload) => {
          if (payload.new && "post_id" in payload.new) {
            queryClient.invalidateQueries({
              queryKey: ["likes", payload.new.post_id],
            });
          }
          if (payload.old && "post_id" in payload.old) {
            queryClient.invalidateQueries({
              queryKey: ["likes", payload.old.post_id],
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          if (payload.new && "post_id" in payload.new) {
            queryClient.invalidateQueries({
              queryKey: ["comments", payload.new.post_id],
            });
            queryClient.invalidateQueries({
              queryKey: ["comments-count", payload.new.post_id],
            });
          }
          if (payload.old && "post_id" in payload.old) {
            queryClient.invalidateQueries({
              queryKey: ["comments", payload.old.post_id],
            });
            queryClient.invalidateQueries({
              queryKey: ["comments-count", payload.old.post_id],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-16" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDeleted={() => queryClient.invalidateQueries({ queryKey: ["posts"] })}
        />
      ))}
    </div>
  );
};
