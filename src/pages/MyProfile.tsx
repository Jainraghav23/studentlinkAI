import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  User, 
  Save, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Linkedin,
  Mail,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface AlumniProfile {
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
  claimed: boolean | null;
  candidate_type: string | null;
  country: string | null;
}

const SPECIALIZATIONS = [
  "Software Engineering",
  "Data Science",
  "Product Management",
  "UX Design",
  "Marketing",
  "Finance",
  "Consulting",
  "Healthcare",
  "Education",
  "Operations",
  "Strategy",
  "Entrepreneurship",
  "Technology",
  "Real Estate",
  "Supply Chain",
  "Other"
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2015 + i);

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
    avatar_url: "",
    candidate_type: "domestic",
    country: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No profile found
        setProfile(null);
      } else {
        toast.error("Failed to load profile");
        console.error(error);
      }
    } else {
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        graduation_year: data.graduation_year?.toString() || "",
        job_title: data.job_title || "",
        company: data.company || "",
        location: data.location || "",
        specialization: data.specialization || "",
        linkedin_url: data.linkedin_url || "",
        email: data.email || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        candidate_type: data.candidate_type || "domestic",
        country: data.country || "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

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

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setHasChanges(true);
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

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
      const { error } = await supabase
        .from("alumni_profiles")
        .update({
          full_name: formData.full_name.trim(),
          graduation_year: parseInt(formData.graduation_year),
          job_title: formData.job_title.trim() || null,
          company: formData.company.trim() || null,
          location: formData.location.trim() || null,
          specialization: formData.specialization || null,
          linkedin_url: formData.linkedin_url.trim() || null,
          email: formData.email.trim() || null,
          bio: formData.bio.trim() || null,
          avatar_url: formData.avatar_url || null,
          candidate_type: formData.candidate_type || "domestic",
          country: formData.candidate_type === "international" ? (formData.country.trim() || null) : null,
        })
        .eq("id", profile.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setHasChanges(false);
      fetchProfile();
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">No Profile Found</h1>
            <p className="text-muted-foreground mb-6">
              You don't have an alumni profile yet. Submit your profile to join the directory!
            </p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <header className="gradient-hero py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary-foreground/20">
              <AvatarImage src={formData.avatar_url || undefined} />
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-display text-xl">
                {initials || <User className="w-6 h-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                My Profile
              </h1>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <CheckCircle2 className="w-4 h-4" />
                <span>Claimed and Verified</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Preview</CardTitle>
                  <CardDescription>How others see your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage src={formData.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">
                        {initials || <User className="w-8 h-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-display text-xl font-semibold">
                      {formData.full_name || "Your Name"}
                    </h3>
                    {formData.graduation_year && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <GraduationCap className="w-4 h-4" />
                        Class of {formData.graduation_year}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    {(formData.job_title || formData.company) && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          {formData.job_title && <p className="font-medium">{formData.job_title}</p>}
                          {formData.company && <p className="text-muted-foreground">{formData.company}</p>}
                        </div>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    {formData.linkedin_url && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Linkedin className="w-4 h-4" />
                        <span className="truncate">LinkedIn Connected</span>
                      </div>
                    )}
                  </div>

                  {formData.specialization && (
                    <>
                      <Separator />
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {formData.specialization}
                      </span>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Photo</CardTitle>
                  <CardDescription>Upload a professional photo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={formData.avatar_url || undefined} />
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
                          <span>{formData.avatar_url ? "Change Photo" : "Upload Photo"}</span>
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
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                  <CardDescription>Your personal details</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="John Doe"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Graduation Year *</Label>
                    <Select
                      value={formData.graduation_year}
                      onValueChange={(value) => handleInputChange("graduation_year", value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="pl-10"
                        maxLength={320}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your email is private and not shown publicly
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="San Francisco, CA"
                        className="pl-10"
                        maxLength={200}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Information</CardTitle>
                  <CardDescription>Your career details</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Current Role</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => handleInputChange("job_title", e.target.value)}
                      placeholder="Senior Product Manager"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Google"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) => handleInputChange("specialization", value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                        placeholder="https://linkedin.com/in/johndoe"
                        className="pl-10"
                        maxLength={500}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidate Type</CardTitle>
                  <CardDescription>Are you a domestic or international candidate?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidate_type">Domestic or International? *</Label>
                    <Select
                      value={formData.candidate_type}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, candidate_type: value, country: value === "domestic" ? "" : prev.country }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select candidate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.candidate_type === "international" && (
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        placeholder="e.g. India, China, Brazil"
                        maxLength={100}
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About You</CardTitle>
                  <CardDescription>Tell others about your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Share your professional journey, interests, and what you're working on..."
                      rows={5}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.bio.length}/2000
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex justify-end gap-3 pb-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !hasChanges}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default MyProfile;
