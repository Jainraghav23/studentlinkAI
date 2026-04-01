import { Link } from "react-router-dom";
import { AlumniProfile } from "./AlumniDirectory";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, GraduationCap, Linkedin, Globe } from "lucide-react";

interface AlumniCardProps {
  alumni: AlumniProfile;
  index: number;
}

const AlumniCard = ({ alumni, index }: AlumniCardProps) => {
  const initials = alumni.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      to={`/alumni/${alumni.id}`}
      className="group relative bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${alumni.is_distinguished ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" : "bg-gradient-to-r from-primary to-cardinal-light opacity-80"}`} />
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className={`w-16 h-16 shadow-md group-hover:scale-105 transition-transform duration-300 ${alumni.is_distinguished ? "ring-2 ring-amber-400/50" : ""}`}>
              <AvatarImage src={alumni.avatar_url || undefined} alt={alumni.full_name} />
              <AvatarFallback className={`font-display text-xl ${alumni.is_distinguished ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" : "bg-gradient-to-br from-primary to-cardinal-light text-primary-foreground"}`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            {alumni.is_distinguished && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {alumni.full_name}
            </h3>
            
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="font-medium">Class of {alumni.graduation_year}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {(alumni.job_title || alumni.company) && (
            <div className="flex items-start gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                {alumni.job_title && <p className="font-medium text-foreground">{alumni.job_title}</p>}
                {alumni.company && <p className="text-muted-foreground">{alumni.company}</p>}
              </div>
            </div>
          )}

          {alumni.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{alumni.location}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {alumni.specialization && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {alumni.specialization}
            </span>
          )}
          {alumni.candidate_type === "international" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <Globe className="w-3 h-3" />
              {alumni.country || "International"}
            </span>
          )}
        </div>

        {/* Contact links */}
        {alumni.linkedin_url && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = alumni.linkedin_url!.startsWith("http") 
                  ? alumni.linkedin_url! 
                  : `https://${alumni.linkedin_url}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Linkedin className="w-5 h-5" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AlumniCard;
