import { Alumni } from "@/data/alumni";
import { MapPin, Briefcase, GraduationCap } from "lucide-react";

interface AlumniCardProps {
  alumni: Alumni;
  index: number;
}

const AlumniCard = ({ alumni, index }: AlumniCardProps) => {
  const initials = alumni.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className="group relative bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-navy-light to-secondary opacity-80" />
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-navy-light flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            <span className="text-primary-foreground font-display text-xl font-semibold">
              {initials}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {alumni.name}
            </h3>
            
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4 text-secondary" />
              <span className="font-medium">Class of {alumni.graduationYear}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">{alumni.currentRole}</p>
              <p className="text-muted-foreground">{alumni.company}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{alumni.location}</span>
          </div>
        </div>

        {/* Specialization badge */}
        <div className="mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {alumni.specialization}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlumniCard;
