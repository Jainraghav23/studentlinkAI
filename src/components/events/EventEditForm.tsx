import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    event_type: string;
    max_attendees: number | null;
    contact_email: string | null;
    image_url: string | null;
    user_id: string;
  };
}

export function EventEditForm({ open, onOpenChange, event }: EventEditFormProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event.image_url);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eventDate = new Date(event.event_date);
  const [form, setForm] = useState({
    title: event.title,
    description: event.description,
    event_date: format(eventDate, "yyyy-MM-dd"),
    event_time: format(eventDate, "HH:mm"),
    location: event.location,
    event_type: event.event_type,
    max_attendees: event.max_attendees?.toString() || "",
    contact_email: event.contact_email || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.event_date || !form.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = event.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${event.user_id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("event-images").upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      } else if (removeExistingImage) {
        imageUrl = null;
      }

      const eventDateTime = form.event_time
        ? `${form.event_date}T${form.event_time}`
        : `${form.event_date}T09:00`;

      const { error } = await supabase.from("events" as any).update({
        title: form.title.trim().slice(0, 200),
        description: form.description.trim().slice(0, 2000),
        event_date: new Date(eventDateTime).toISOString(),
        location: form.location.trim().slice(0, 300),
        event_type: form.event_type,
        max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
        contact_email: form.contact_email.trim().slice(0, 255) || null,
        image_url: imageUrl,
      } as any).eq("id", event.id);

      if (error) throw error;

      toast.success("Event updated successfully!");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Event</DialogTitle>
          <DialogDescription>Update your pending event details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Event Title *</Label>
            <Input id="edit-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={200} required />
          </div>
          <div>
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea id="edit-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} rows={4} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-date">Date *</Label>
              <Input id="edit-date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} min={new Date().toISOString().split("T")[0]} required />
            </div>
            <div>
              <Label htmlFor="edit-time">Time</Label>
              <Input id="edit-time" type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-location">Location *</Label>
            <Input id="edit-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={300} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In Person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-max">Max Attendees</Label>
              <Input id="edit-max" type="number" value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} placeholder="Optional" min={1} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-email">Contact Email</Label>
            <Input id="edit-email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} maxLength={255} />
          </div>
          <div>
            <Label>Event Image</Label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative mt-2 rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeImage}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-full mt-1 h-20 border-dashed" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="w-5 h-5 mr-2" />
                Add Event Image
              </Button>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
