import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, User } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProfile?: {
    id: string;
    full_name: string;
    graduation_year: number;
    job_title: string | null;
    company: string | null;
    location: string | null;
    specialization: string | null;
    linkedin_url: string | null;
    email: string | null;
    bio: string | null;
    avatar_url: string | null;
  } | null;
  onSuccess: () => void;
}

const SPECIALIZATIONS = [
  "Finance",
  "Marketing",
  "Strategy",
  "Operations",
  "Entrepreneurship",
  "Technology",
  "Healthcare",
  "Consulting",
  "Real Estate",
  "Supply Chain",
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2015 + i);

const ProfileForm = ({ open, onOpenChange, existingProfile, onSuccess }: ProfileFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    graduation_year: "",
    job_title: "",
    company: "",
    location: "",
    specialization: "",
    linkedin_url: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        full_name: existingProfile.full_name,
        graduation_year: existingProfile.graduation_year.toString(),
        job_title: existingProfile.job_title || "",
        company: existingProfile.company || "",
        location: existingProfile.location || "",
        specialization: existingProfile.specialization || "",
        linkedin_url: existingProfile.linkedin_url || "",
        email: existingProfile.email || "",
        bio: existingProfile.bio || "",
      });
      setAvatarUrl(existingProfile.avatar_url);
    } else {
      setFormData({
        full_name: "",
        graduation_year: "",
        job_title: "",
        company: "",
        location: "",
        specialization: "",
        linkedin_url: "",
        email: user?.email || "",
        bio: "",
      });
      setAvatarUrl(null);
    }
  }, [existingProfile, user, open]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!formData.graduation_year) {
      toast.error("Graduation year is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: formData.full_name.trim(),
        graduation_year: parseInt(formData.graduation_year),
        job_title: formData.job_title.trim() || null,
        company: formData.company.trim() || null,
        location: formData.location.trim() || null,
        specialization: formData.specialization || null,
        linkedin_url: formData.linkedin_url.trim() || null,
        email: formData.email.trim() || null,
        bio: formData.bio.trim() || null,
        avatar_url: avatarUrl,
      };

      if (existingProfile) {
        const { error } = await supabase
          .from("alumni_profiles")
          .update(profileData)
          .eq("id", existingProfile.id);

        if (error) throw error;
        toast.success("Profile updated successfully");
      } else {
        const { error } = await supabase
          .from("alumni_profiles")
          .insert(profileData);

        if (error) throw error;
        toast.success("Profile created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to save profile: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = formData.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {existingProfile ? "Edit Your Profile" : "Create Your Alumni Profile"}
          </DialogTitle>
          <DialogDescription>
            {existingProfile
              ? "Update your information to keep your profile current."
              : "Join the UW-Madison MBA alumni directory by creating your profile."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-display">
                {initials || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                </div>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG or PNG</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Graduation Year */}
            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year *</Label>
              <Select
                value={formData.graduation_year}
                onValueChange={(value) => setFormData({ ...formData, graduation_year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Class of {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="job_title">Current Role</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="Senior Product Manager"
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about your journey and what you're working on..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {existingProfile ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileForm;
