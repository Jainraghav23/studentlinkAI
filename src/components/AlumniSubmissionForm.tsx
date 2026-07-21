import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

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
  "Other"
];

const YEARS = Array.from({ length: 14 }, (_, i) => 2015 + i);

export function AlumniSubmissionForm() {
  const { signUp } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    graduation_year: "",
    job_title: "",
    company: "",
    location: "",
    specialization: "",
    linkedin_url: "",
    bio: "",
    candidate_type: "",
    country: "",
    website: "" // Honeypot field - bots will fill this, humans won't see it
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.password || !formData.graduation_year) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Client-side validation
    if (formData.full_name.length > 200) {
      toast.error("Name is too long (max 200 characters)");
      return;
    }

    if (formData.email.length > 320) {
      toast.error("Email is too long");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.bio.length > 2000) {
      toast.error("Bio is too long (max 2000 characters)");
      return;
    }

    if (formData.website) {
      toast.success("Your account and profile have been submitted for review!");
      setOpen(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedEmail = formData.email.toLowerCase().trim();
      const { data: authData, error: signUpError } = await signUp(normalizedEmail, formData.password);

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(signUpError.message);
        }
        return;
      }

      if (!authData?.user) {
        toast.error("Account created, but we could not finish your profile submission. Please sign in and try again.");
        return;
      }

      const { error: submissionError } = await supabase
        .from("alumni_submissions")
        .insert({
          user_id: authData.user.id,
          full_name: formData.full_name,
          email: normalizedEmail,
          graduation_year: parseInt(formData.graduation_year),
          job_title: formData.job_title || null,
          company: formData.company || null,
          location: formData.location || null,
          specialization: formData.specialization || null,
          linkedin_url: formData.linkedin_url || null,
          bio: formData.bio || null,
          candidate_type: formData.candidate_type || "domestic",
          country: formData.candidate_type === "international" ? (formData.country || null) : null,
          status: "pending",
        });

      if (submissionError) {
        console.error("Submission error:", submissionError);
        toast.error("Account created but submission failed. Please contact support.");
        return;
      }

      toast.success("Your account and profile have been submitted for review!");
      setFormData({
        full_name: "",
        email: "",
        password: "",
        graduation_year: "",
        job_title: "",
        company: "",
        location: "",
        specialization: "",
        linkedin_url: "",
        bio: "",
        candidate_type: "",
        country: "",
        website: ""
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Join Directory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Your Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              maxLength={320}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Create a password"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>

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
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="Software Engineer"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google"
                maxLength={200}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="San Francisco, CA"
              maxLength={200}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/johndoe"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate_type">Domestic or International? *</Label>
            <Select
              value={formData.candidate_type}
              onValueChange={(value) => setFormData({ ...formData, candidate_type: value, country: value === "domestic" ? "" : formData.country })}
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
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. India, China, Brazil"
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.bio.length}/2000
            </p>
          </div>

          {/* Honeypot field - hidden from users but bots will fill it */}
          <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account & Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
