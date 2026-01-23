import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import { CommentSection } from "./CommentSection";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    author?: {
      full_name: string;
      avatar_url: string | null;
    };
  };
  onDeleted?: () => void;
}

export const PostCard = ({ post, onDeleted }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  const { data: likesData } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("id, user_id")
        .eq("post_id", post.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: commentsCount = 0 } = useQuery({
    queryKey: ["comments-count", post.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);

      if (error) throw error;
      return count || 0;
    },
  });

  const isLiked = likesData?.some((like) => like.user_id === user?.id);
  const likesCount = likesData?.length || 0;

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({
          post_id: post.id,
          user_id: user.id,
        });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["likes", post.id] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({
        title: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) throw error;

      toast({ title: "Post deleted" });
      onDeleted?.();
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const initials = post.author?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author?.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author?.full_name || "Unknown User"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          {user?.id === post.user_id && (
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex-col items-stretch pt-0">
        <div className="flex items-center gap-4 py-2 border-t border-b">
          <Button
            variant="ghost"
            size="sm"
            className={isLiked ? "text-red-500" : ""}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            {commentsCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
        {showComments && <CommentSection postId={post.id} />}
      </CardFooter>
    </Card>
  );
};
