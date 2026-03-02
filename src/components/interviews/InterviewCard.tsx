import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, Calendar, BarChart3, Trophy, Layers, ChevronDown, ChevronUp, Lightbulb, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export interface InterviewExperience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  interview_date: string | null;
  difficulty: string;
  result: string;
  rounds: number | null;
  experience: string;
  questions: string | null;
  tips: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InterviewCardProps {
  interview: InterviewExperience;
  isPending?: boolean;
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: "Easy", className: "bg-green-100 text-green-800" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-800" },
  hard: { label: "Hard", className: "bg-red-100 text-red-800" },
};

const resultConfig: Record<string, { label: string; className: string }> = {
  offered: { label: "Offered", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  declined: { label: "Declined", className: "bg-muted text-muted-foreground" },
};

export function InterviewCard({ interview, isPending }: InterviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const diff = difficultyConfig[interview.difficulty] || difficultyConfig.medium;
  const res = resultConfig[interview.result] || resultConfig.pending;

  return (
    <Card className={`shadow-card hover:shadow-card-hover transition-shadow ${isPending ? "border-amber-300 bg-amber-50/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <h3 className="font-display text-lg font-semibold truncate">{interview.company}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{interview.role}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="secondary" className={diff.className}>{diff.label}</Badge>
            <Badge variant="secondary" className={res.className}>{res.label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {interview.rounds && (
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {interview.rounds} round{interview.rounds > 1 ? "s" : ""}
            </span>
          )}
          {interview.interview_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(interview.interview_date), "MMM yyyy")}
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed">
          {expanded ? interview.experience : interview.experience.slice(0, 200)}
          {interview.experience.length > 200 && !expanded && "..."}
        </p>

        {expanded && interview.questions && (
          <div className="pt-2 border-t space-y-1">
            <p className="text-sm font-semibold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-primary" /> Interview Questions
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{interview.questions}</p>
          </div>
        )}

        {expanded && interview.tips && (
          <div className="pt-2 border-t space-y-1">
            <p className="text-sm font-semibold flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-primary" /> Tips & Advice
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{interview.tips}</p>
          </div>
        )}

        {(interview.experience.length > 200 || interview.questions || interview.tips) && (
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
