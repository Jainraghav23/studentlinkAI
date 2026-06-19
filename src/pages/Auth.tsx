import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraduationCap, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  graduationYear: z.string().min(1, "Graduation year is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<string | null>(null);
  
  // Profile fields for signup
  const [fullName, setFullName] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bio, setBio] = useState("");

  // Check if user has a pending submission or approved profile
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user && !loading) {
        // Check if user has an approved profile
        const { data: profile } = await supabase
          .from("alumni_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          navigate("/");
          return;
        }

        // Check if user has a pending submission
        const { data: submission } = await supabase
          .from("alumni_submissions")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (submission) {
          setPendingSubmission(submission.status);
        }
      }
    };

    checkUserStatus();
  }, [user, loading, navigate]);

  const handleSignIn = async () => {
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    const validation = signupSchema.safeParse({ email, password, fullName, graduationYear });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Create alumni submission for admin review (instead of profile directly)
      if (data?.user) {
        const { error: submissionError } = await supabase
          .from("alumni_submissions")
          .insert({
            user_id: data.user.id,
            full_name: fullName.trim(),
            email: email.toLowerCase().trim(),
            graduation_year: parseInt(graduationYear),
            job_title: jobTitle.trim() || null,
            company: company.trim() || null,
            location: location.trim() || null,
            specialization: specialization || null,
            linkedin_url: linkedinUrl.trim() || null,
            bio: bio.trim() || null,
            status: "pending",
          });

        if (submissionError) {
          console.error("Submission error:", submissionError);
          toast.error("Account created but submission failed. Please contact support.");
        } else {
          setSignupSuccess(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending review message for users who already signed up
  if (user && pendingSubmission) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="gradient-hero py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">UW-Madison MBA Alumni</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
              Application Status
            </h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 -mt-8">
          <Card className="w-full max-w-md shadow-card-hover">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                {pendingSubmission === "pending" ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Application Under Review</h2>
                    <p className="text-muted-foreground">
                      Your profile is being reviewed by our admin team. You will receive an email notification within 24-48 hours once your profile is approved.
                    </p>
                  </>
                ) : pendingSubmission === "rejected" ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Application Not Approved</h2>
                    <p className="text-muted-foreground">
                      Unfortunately, your application was not approved. Please contact support for more information.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Application Approved!</h2>
                    <p className="text-muted-foreground">
                      Your profile has been approved. Welcome to the alumni directory!
                    </p>
                    <Button onClick={() => navigate("/")} className="mt-4">
                      View Directory
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show success message after signup
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="gradient-hero py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">UW-Madison MBA Alumni</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
              Application Submitted!
            </h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 -mt-8">
          <Card className="w-full max-w-md shadow-card-hover">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-display text-xl font-semibold">Thank You for Joining!</h2>
                <p className="text-muted-foreground">
                  Your profile has been submitted for review. Our admin team will review your application and you will be notified via email within <strong>24-48 hours</strong> once approved.
                </p>
                <Alert className="text-left mt-6">
                  <Clock className="h-4 w-4" />
                  <AlertTitle>What happens next?</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>Admin reviews your profile details</li>
                      <li>You'll receive an email notification</li>
                      <li>Once approved, your profile will be visible in the directory</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-hero py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">UW-Madison MBA Alumni</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
            Join Our Alumni Network
          </h1>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 -mt-8">
        <Card className="w-full max-w-md shadow-card-hover">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Join Directory</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <Alert className="mb-4">
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Your profile will be reviewed by an admin before appearing in the directory (24-48 hours).
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">Profile Information</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Select value={graduationYear} onValueChange={setGraduationYear}>
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
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        placeholder="Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        placeholder="Google"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select value={specialization} onValueChange={setSpecialization}>
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
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/in/johndoe"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      maxLength={500}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {bio.length}/2000
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit for Review
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
