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
import { Plus, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const MAX_W = 1200;
const MAX_H = 600;
const TARGET_TYPE = "image/jpeg";
const QUALITY = 0.85;

async function resizeImage(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  const ratio = Math.min(MAX_W / img.width, MAX_H / img.height, 1);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Resize failed"))), TARGET_TYPE, QUALITY)
  );
}

export const GroupSubmissionForm = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("interest");
  const [privacy, setPrivacy] = useState("public");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) {
      setCoverFile(null);
      setCoverPreview("");
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    setSubmitting(true);
    try {
      let cover_image_url: string | null = null;
      if (coverFile) {
        setUploading(true);
        const blob = await resizeImage(coverFile);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("group-covers")
          .upload(path, blob, { contentType: TARGET_TYPE, upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("group-covers").getPublicUrl(path);
        cover_image_url = data.publicUrl;
        setUploading(false);
      }
      const { error } = await supabase.from("groups" as any).insert({
        creator_id: user.id,
        name: name.trim(),
        slug: slugify(name) || crypto.randomUUID().slice(0, 8),
        description: description.trim(),
        category,
        privacy,
        cover_image_url,
      } as any);
      if (error) throw error;
      toast.success("Group submitted! It will appear once an admin approves it.");
      setOpen(false);
      setName(""); setDescription("");
      setCoverFile(null); setCoverPreview("");
      setCategory("interest"); setPrivacy("public");
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit group");
    } finally {
      setSubmitting(false);
      setUploading(false);
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
            <Label htmlFor="g-cover">Cover image (optional)</Label>
            {coverPreview ? (
              <div className="relative mt-2 rounded-md overflow-hidden border">
                <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => handleFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="g-cover"
                className="mt-2 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload (auto-resized, max 10MB)
                </span>
                <Input
                  id="g-cover"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>
          <Button type="submit" disabled={submitting || uploading} className="w-full">
            {(submitting || uploading) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {uploading ? "Uploading cover..." : "Submit for review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};