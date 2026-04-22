import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const PostForm = ({
  onPostCreated,
  groupId,
}: {
  onPostCreated?: () => void;
  groupId?: string;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("alumni_profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        ...(groupId ? { group_id: groupId } : {}),
      } as any);

      if (error) throw error;

      setContent("");
      toast({ title: "Post created successfully!" });
      onPostCreated?.();
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 min-h-[80px] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
