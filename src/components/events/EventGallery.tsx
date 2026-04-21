import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface EventPhoto {
  id: string;
  event_id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

interface EventGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

export function EventGallery({ open, onOpenChange, eventId, eventTitle }: EventGalleryProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<EventPhoto | null>(null);

  const { data: photos, isLoading } = useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_photos" as any)
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as EventPhoto[]) || [];
    },
    enabled: open,
  });

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setPendingFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile || !user) return;
    setUploading(true);
    try {
      const ext = pendingFile.name.split(".").pop();
      const path = `gallery/${eventId}/${user.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("event-images")
        .upload(path, pendingFile, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("event-images").getPublicUrl(path);

      const { error: insErr } = await supabase.from("event_photos" as any).insert({
        event_id: eventId,
        user_id: user.id,
        photo_url: pub.publicUrl,
        caption: caption.trim() || null,
      });
      if (insErr) throw insErr;

      toast.success("Photo uploaded");
      setPendingFile(null);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["event-photos", eventId] });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: EventPhoto) => {
    if (!confirm("Delete this photo?")) return;
    try {
      const { error } = await supabase.from("event_photos" as any).delete().eq("id", photo.id);
      if (error) throw error;
      toast.success("Photo removed");
      queryClient.invalidateQueries({ queryKey: ["event-photos", eventId] });
      if (lightboxPhoto?.id === photo.id) setLightboxPhoto(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{eventTitle} — Gallery</DialogTitle>
          </DialogHeader>

          {user && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              <Label className="text-sm font-semibold">Share a memory</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFilePick}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <Input
                  placeholder="Caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={uploading}
                  maxLength={140}
                />
                <Button onClick={handleUpload} disabled={!pendingFile || uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-1.5" />}
                  Upload
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : photos && photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer shadow-card"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || "Event photo"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
                    </div>
                  )}
                  {user?.id === photo.user_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo);
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImagePlus className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No photos yet. Be the first to share a memory!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {lightboxPhoto && (
        <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
          <DialogContent className="max-w-5xl p-0 bg-background border-0">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto.photo_url}
              alt={lightboxPhoto.caption || "Event photo"}
              className="w-full max-h-[85vh] object-contain"
            />
            {lightboxPhoto.caption && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {lightboxPhoto.caption}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
