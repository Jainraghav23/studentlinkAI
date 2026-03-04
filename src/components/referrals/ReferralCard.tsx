import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Referral {
  id: string;
  user_id: string;
  type: string;
  company: string;
  role: string;
  description: string;
  contact_info: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ReferralCardProps {
  referral: Referral;
  isPending?: boolean;
}

const typeConfig: Record<string, { label: string; className: string }> = {
  offering: { label: "Offering Referral", className: "bg-green-100 text-green-800" },
  seeking: { label: "Seeking Referral", className: "bg-blue-100 text-blue-800" },
};

export function ReferralCard({ referral, isPending }: ReferralCardProps) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = typeConfig[referral.type] || typeConfig.offering;

  return (
    <Card className={`shadow-card hover:shadow-card-hover transition-shadow ${isPending ? "border-amber-300 bg-amber-50/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <h3 className="font-display text-lg font-semibold truncate">{referral.company}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{referral.role}</span>
            </div>
          </div>
          <Badge variant="secondary" className={typeInfo.className}>{typeInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">
          {expanded ? referral.description : referral.description.slice(0, 200)}
          {referral.description.length > 200 && !expanded && "..."}
        </p>

        {expanded && referral.contact_info && (
          <div className="pt-2 border-t space-y-1">
            <p className="text-sm font-semibold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-primary" /> Contact
            </p>
            <p className="text-sm text-muted-foreground">{referral.contact_info}</p>
          </div>
        )}

        {(referral.description.length > 200 || referral.contact_info) && (
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            {expanded ? "Show Less" : "Read More"}
          </Button>
        )}

        {isPending && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending Approval</Badge>
        )}
      </CardContent>
    </Card>
  );
}
