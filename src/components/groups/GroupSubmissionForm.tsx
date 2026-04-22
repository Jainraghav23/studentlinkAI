import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export const GroupSubmissionForm = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("interest");
  const [privacy, setPrivacy] = useState("public");
  const [coverUrl, setCoverUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("groups" as any).insert({
        creator_id: user.id,
        name: name.trim(),
        slug: slugify(name) || crypto.randomUUID().slice(0, 8),
        description: description.trim(),
        category,
        privacy,
        cover_image_url: coverUrl.trim() || null,
      } as any);
      if (error) throw error;
      toast.success("Group submitted! It will appear once an admin approves it.");
      setOpen(false);
      setName(""); setDescription(""); setCoverUrl("");
      setCategory("interest"); setPrivacy("public");
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit group");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Propose a new group</DialogTitle>
          <DialogDescription>
            Submit a group for admin review. Once approved, alumni can join and post.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="g-name">Name *</Label>
            <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <div>
            <Label htmlFor="g-desc">Description *</Label>
            <Textarea id="g-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="class_year">Class Year</SelectItem>
                  <SelectItem value="interest">Interest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Privacy</Label>
              <Select value={privacy} onValueChange={setPrivacy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="g-cover">Cover image URL (optional)</Label>
            <Input id="g-cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Submit for review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};