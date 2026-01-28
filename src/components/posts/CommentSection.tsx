import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Send, Trash2, Pencil, X, Check } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data: commentsData, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("alumni_profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return commentsData.map((comment) => ({
        ...comment,
        author: profileMap.get(comment.user_id) || {
          full_name: "Unknown User",
          avatar_url: null,
        },
      })) as Comment[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["comments-count", postId] });
      toast({ title: "Comment deleted" });
    } catch (error: any) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from("comments")
        .update({ content: editContent.trim() })
        .eq("id", commentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast({ title: "Comment updated" });
      cancelEditing();
    } catch (error: any) {
      toast({
        title: "Error updating comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {comment.author?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.author?.full_name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                      {comment.updated_at && new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime() + 1000 && (
                        <span className="ml-1 text-muted-foreground/70">(edited)</span>
                      )}
                    </span>
                    {user?.id === comment.user_id && editingCommentId !== comment.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => startEditing(comment)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={cancelEditing}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditComment(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSubmitting || !newComment.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
};
