import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Globe } from "lucide-react";

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  cover_image_url: string | null;
  privacy: string;
  status: string;
  creator_id: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  location: "Location",
  industry: "Industry",
  class_year: "Class Year",
  interest: "Interest",
};

export const GroupCard = ({ group, memberCount }: { group: Group; memberCount: number }) => {
  return (
    <Link to={`/groups/${group.id}`} className="block group">
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border-border">
        {group.cover_image_url ? (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${group.cover_image_url})` }}
          />
        ) : (
          <div className="h-32 gradient-hero" />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {group.name}
            </h3>
            {group.privacy === "private" ? (
              <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[group.category] || group.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {memberCount} member{memberCount === 1 ? "" : "s"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};