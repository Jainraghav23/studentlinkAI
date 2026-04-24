import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Upload, X, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

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

// Best-effort: extract storage object path from a public URL of the group-covers bucket.
function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  const marker = "/group-covers/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  currentCoverUrl: string | null;
  onUpdated: (newUrl: string | null) => void;
}

export const GroupCoverEditDialog = ({ open, onOpenChange, groupId, currentCoverUrl, onUpdated }: Props) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview("");
  };

  const handleFile = (f: File | null) => {
    if (!f) { reset(); return; }
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const deleteOldCover = async () => {
    const path = extractStoragePath(currentCoverUrl);
    if (!path) return;
    // Best-effort delete; ignore errors (e.g. external URL or already gone)
    await supabase.storage.from("group-covers").remove([path]);
  };

  const handleReplace = async () => {
    if (!user || !file) return;
    setSaving(true);
    try {
      const blob = await resizeImage(file);
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("group-covers")
        .upload(path, blob, { contentType: TARGET_TYPE, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("group-covers").getPublicUrl(path);
      const newUrl = data.publicUrl;

      const { error: updErr } = await supabase
        .from("groups" as any)
        .update({ cover_image_url: newUrl } as any)
        .eq("id", groupId);
      if (updErr) throw updErr;

      // Clean up old file after successful update
      await deleteOldCover();

      toast.success("Cover updated");
      onUpdated(newUrl);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update cover");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const { error } = await supabase
        .from("groups" as any)
        .update({ cover_image_url: null } as any)
        .eq("id", groupId);
      if (error) throw error;
      await deleteOldCover();
      toast.success("Cover removed");
      onUpdated(null);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove cover");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit cover image</DialogTitle>
          <DialogDescription>
            Upload a new cover or remove the current one. Images are auto-resized to 1200×600.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentCoverUrl && !preview && (
            <div>
              <Label className="text-xs text-muted-foreground">Current cover</Label>
              <div className="mt-1 rounded-md overflow-hidden border">
                <img src={currentCoverUrl} alt="Current cover" className="w-full h-32 object-cover" />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="g-cover-edit">{currentCoverUrl ? "Replace with" : "Upload cover"}</Label>
            {preview ? (
              <div className="relative mt-2 rounded-md overflow-hidden border">
                <img src={preview} alt="New cover preview" className="w-full h-40 object-cover" />
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
                htmlFor="g-cover-edit"
                className="mt-2 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload (auto-resized, max 10MB)
                </span>
                <Input
                  id="g-cover-edit"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
          {currentCoverUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={saving || removing}
              className="text-destructive hover:text-destructive"
            >
              {removing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Remove cover
            </Button>
          )}
          <Button
            type="button"
            onClick={handleReplace}
            disabled={!file || saving || removing}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
            Save new cover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
