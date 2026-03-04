import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Eye, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Referral } from "@/components/referrals/ReferralCard";

const AdminReferralManagement = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Referral | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchReferrals = async () => {
    const { data, error } = await supabase
      .from("referrals" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load referrals");
    } else {
      setReferrals((data as unknown as Referral[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReferrals(); }, []);

  const handleAction = async (item: Referral, action: "approved" | "rejected") => {
    setProcessing(item.id);
    try {
      const { error } = await supabase
        .from("referrals" as any)
        .update({ status: action } as any)
        .eq("id", item.id);
      if (error) throw error;
      toast.success(`Referral has been ${action}.`);
      fetchReferrals();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from("referrals" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Referral deleted.");
      fetchReferrals();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "approved": return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected": return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = referrals.filter((r) => r.status === "pending").length;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Referrals</CardTitle>
          <CardDescription>
            {pendingCount > 0 ? `${pendingCount} pending to review` : "No pending submissions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell className="font-medium">{item.company}</TableCell>
                      <TableCell>{item.role}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelected(item)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {item.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(item, "approved")} disabled={processing === item.id}>
                                {processing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(item, "rejected")} disabled={processing === item.id}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)} disabled={processing === item.id}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Referral Details</DialogTitle>
            <DialogDescription>Review submission</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Type</p><p className="font-medium capitalize">{selected.type}</p></div>
                <div><p className="text-sm text-muted-foreground">Company</p><p className="font-medium">{selected.company}</p></div>
                <div><p className="text-sm text-muted-foreground">Role</p><p className="font-medium">{selected.role}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p>{getStatusBadge(selected.status)}</div>
              </div>
              <div><p className="text-sm text-muted-foreground">Description</p><p className="text-sm whitespace-pre-line">{selected.description}</p></div>
              {selected.contact_info && <div><p className="text-sm text-muted-foreground">Contact Info</p><p className="text-sm">{selected.contact_info}</p></div>}
              {selected.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(selected, "approved")} disabled={processing === selected.id}>
                    {processing === selected.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleAction(selected, "rejected")} disabled={processing === selected.id}>
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminReferralManagement;
