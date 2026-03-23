import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Helmet } from "react-helmet-async";
import {
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  Linkedin,
  Globe,
  Loader2,
} from "lucide-react";

interface DistinguishedProfile {
  id: string;
  full_name: string;
  graduation_year: number;
  job_title: string | null;
  company: string | null;
  location: string | null;
  specialization: string | null;
  linkedin_url: string | null;
  bio: string | null;
  avatar_url: string | null;
  candidate_type: string | null;
  country: string | null;
}

const HallOfFame = () => {
  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ["hall-of-fame"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_profiles_public" as any)
        .select("id, full_name, graduation_year, job_title, company, location, specialization, linkedin_url, bio, avatar_url, candidate_type, country")
        .eq("is_distinguished", true)
        .order("graduation_year", { ascending: false });

      if (error) throw error;
      return data as unknown as DistinguishedProfile[];
    },
  });

  return (
    <>
      <Helmet>
        <title>Hall of Fame | UW-Madison MBA Alumni</title>
        <meta name="description" content="Celebrating our most distinguished UW-Madison MBA alumni who have made exceptional contributions to their fields." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-50 via-background to-background pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Hall of Fame
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Distinguished Alumni
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Celebrating our most accomplished alumni who have made exceptional contributions to their fields and communities.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-16">
              <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                No Distinguished Alumni Yet
              </h2>
              <p className="text-muted-foreground">
                Distinguished alumni will be featured here once selected by administrators.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((person) => {
                const initials = person.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Link
                    key={person.id}
                    to={`/alumni/${person.id}`}
                    className="group relative bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden block border border-amber-200/50"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16 shadow-md group-hover:scale-105 transition-transform duration-300 ring-2 ring-amber-400/50">
                            <AvatarImage src={person.avatar_url || undefined} alt={person.full_name} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white font-display text-xl">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                            <Award className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-amber-600 transition-colors">
                            {person.full_name}
                          </h3>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <GraduationCap className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">Class of {person.graduation_year}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {(person.job_title || person.company) && (
                          <div className="flex items-start gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              {person.job_title && <p className="font-medium text-foreground">{person.job_title}</p>}
                              {person.company && <p className="text-muted-foreground">{person.company}</p>}
                            </div>
                          </div>
                        )}
                        {person.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{person.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {person.specialization && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                            {person.specialization}
                          </span>
                        )}
                        {person.candidate_type === "international" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <Globe className="w-3 h-3" />
                            {person.country || "International"}
                          </span>
                        )}
                      </div>

                      {person.bio && (
                        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                          {person.bio}
                        </p>
                      )}

                      {person.linkedin_url && (
                        <div className="mt-4 pt-4 border-t">
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const url = person.linkedin_url!.startsWith("http")
                                ? person.linkedin_url!
                                : `https://${person.linkedin_url}`;
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                            className="text-muted-foreground hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Linkedin className="w-5 h-5" />
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default HallOfFame;
