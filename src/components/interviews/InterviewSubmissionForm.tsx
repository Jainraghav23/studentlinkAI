import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InterviewSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterviewSubmissionForm({ open, onOpenChange }: InterviewSubmissionFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    interview_date: "",
    difficulty: "medium",
    result: "pending",
    rounds: "",
    experience: "",
    questions: "",
    tips: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.company.trim() || !form.role.trim() || !form.experience.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("interview_experiences" as any).insert({
        user_id: user.id,
        company: form.company.trim(),
        role: form.role.trim(),
        interview_date: form.interview_date || null,
        difficulty: form.difficulty,
        result: form.result,
        rounds: form.rounds ? parseInt(form.rounds) : null,
        experience: form.experience.trim(),
        questions: form.questions.trim() || null,
        tips: form.tips.trim() || null,
      } as any);

      if (error) throw error;

      toast.success("Interview experience submitted for approval!");
      setForm({ company: "", role: "", interview_date: "", difficulty: "medium", result: "pending", rounds: "", experience: "", questions: "", tips: "" });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Share Interview Experience</DialogTitle>
          <DialogDescription>
            Your submission will be reviewed before it's visible to everyone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Google" required />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Product Manager" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="result">Outcome</Label>
              <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rounds">Rounds</Label>
              <Input id="rounds" type="number" value={form.rounds} onChange={(e) => setForm({ ...form, rounds: e.target.value })} placeholder="3" min={1} />
            </div>
          </div>
          <div>
            <Label htmlFor="interview_date">Interview Date</Label>
            <Input id="interview_date" type="date" value={form.interview_date} onChange={(e) => setForm({ ...form, interview_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="experience">Experience *</Label>
            <Textarea id="experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="Describe the interview process..." rows={5} required />
          </div>
          <div>
            <Label htmlFor="questions">Interview Questions</Label>
            <Textarea id="questions" value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} placeholder="List any questions asked..." rows={3} />
          </div>
          <div>
            <Label htmlFor="tips">Tips & Advice</Label>
            <Textarea id="tips" value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} placeholder="Any advice for future candidates..." rows={3} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit for Approval
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
