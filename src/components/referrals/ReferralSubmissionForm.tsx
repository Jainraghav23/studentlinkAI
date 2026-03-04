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

interface ReferralSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferralSubmissionForm({ open, onOpenChange }: ReferralSubmissionFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "offering",
    company: "",
    role: "",
    description: "",
    contact_info: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.company.trim() || !form.role.trim() || !form.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("referrals" as any).insert({
        user_id: user.id,
        type: form.type,
        company: form.company.trim(),
        role: form.role.trim(),
        description: form.description.trim(),
        contact_info: form.contact_info.trim() || null,
      } as any);

      if (error) throw error;

      toast.success("Referral submitted for approval!");
      setForm({ type: "offering", company: "", role: "", description: "", contact_info: "" });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
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
          <DialogTitle className="font-display text-xl">Post a Referral</DialogTitle>
          <DialogDescription>
            Your submission will be reviewed before it's visible to everyone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="offering">I can refer someone (Offering)</SelectItem>
                <SelectItem value="seeking">I'm looking for a referral (Seeking)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the referral opportunity..." rows={4} required />
          </div>
          <div>
            <Label htmlFor="contact_info">Contact Info (optional)</Label>
            <Input id="contact_info" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="Email, LinkedIn, etc." />
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
