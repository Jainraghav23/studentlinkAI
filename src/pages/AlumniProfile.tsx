import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Linkedin,
  ArrowLeft,
  Loader2,
  User,
  Globe,
  
} from "lucide-react";

const AlumniProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: alumni, isLoading, error } = useQuery({
    queryKey: ["alumni-profile", id],
    queryFn: async () => {
      // Use the public view which excludes sensitive columns (email, claim_token)
      const { data, error } = await supabase
        .from("alumni_profiles_public" as any)
        .select(
          "id, full_name, graduation_year, job_title, company, location, specialization, linkedin_url, bio, avatar_url, candidate_type, country"
        )
        .eq("id", id!)
        .maybeSingle();

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const initials = alumni?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Profile Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The alumni profile you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{alumni.full_name} | UW-Madison MBA Alumni</title>
        <meta
          name="description"
          content={`${alumni.full_name}, Class of ${alumni.graduation_year}. ${alumni.job_title ? `${alumni.job_title} at ${alumni.company}` : "UW-Madison MBA Alumni"}`}
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Button variant="ghost" asChild className="mb-8">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Directory
              </Link>
            </Button>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <Avatar className="w-32 h-32 md:w-40 md:h-40 shadow-lg border-4 border-background">
                <AvatarImage src={alumni.avatar_url || undefined} alt={alumni.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-cardinal-light text-primary-foreground font-display text-4xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {alumni.full_name}
                </h1>
                <div className="flex items-center gap-2 text-lg text-primary mb-4">
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-medium">Class of {alumni.graduation_year}</span>
                </div>

                {(alumni.job_title || alumni.company) && (
                  <div className="flex items-start gap-2 text-muted-foreground mb-2">
                    <Briefcase className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      {alumni.job_title && (
                        <span className="font-medium text-foreground">{alumni.job_title}</span>
                      )}
                      {alumni.job_title && alumni.company && " at "}
                      {alumni.company && <span>{alumni.company}</span>}
                    </div>
                  </div>
                )}

                {alumni.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>{alumni.location}</span>
                  </div>
                )}

                {alumni.candidate_type === "international" && alumni.country && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Globe className="w-5 h-5 flex-shrink-0" />
                    <span>From {alumni.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {alumni.bio && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                      About
                    </h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {alumni.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!alumni.bio && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No bio available for this alumni.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Candidate Type */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                    Candidate Type
                  </h3>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
                    {alumni.candidate_type === "international" && <Globe className="w-4 h-4" />}
                    {alumni.candidate_type || "Domestic"}
                    {alumni.candidate_type === "international" && alumni.country && ` — ${alumni.country}`}
                  </span>
                </CardContent>
              </Card>

              {/* Specialization */}
              {alumni.specialization && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                      Specialization
                    </h3>
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      {alumni.specialization}
                    </span>
                  </CardContent>
                </Card>
              )}

              {/* Connect */}
              {alumni.linkedin_url && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                      Connect
                    </h3>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        const url = alumni.linkedin_url!.startsWith("http") 
                          ? alumni.linkedin_url! 
                          : `https://${alumni.linkedin_url}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      View LinkedIn Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AlumniProfile;
