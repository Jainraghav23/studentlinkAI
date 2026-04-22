import { useEffect, useState } from "react";
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
import type { Group } from "@/components/groups/GroupCard";

const AdminGroupManagement = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Group | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from("groups" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load groups");
    else setGroups((data as unknown as Group[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleAction = async (item: Group, action: "approved" | "rejected") => {
    setProcessing(item.id);
    try {
      const { error } = await supabase
        .from("groups" as any)
        .update({ status: action } as any)
        .eq("id", item.id);
      if (error) throw error;
      toast.success(`Group ${action}.`);
      fetchGroups();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setProcessing(null); }
  };

  const handleDelete = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase.from("groups" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Group deleted.");
      fetchGroups();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setProcessing(null); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "approved": return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected": return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = groups.filter((g) => g.status === "pending").length;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Groups</CardTitle>
          <CardDescription>
            {pendingCount > 0 ? `${pendingCount} pending to review` : "No pending submissions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No groups yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Privacy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell className="capitalize">{g.category.replace("_", " ")}</TableCell>
                      <TableCell className="capitalize">{g.privacy}</TableCell>
                      <TableCell>{getStatusBadge(g.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelected(g)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {g.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(g, "approved")} disabled={processing === g.id}>
                                {processing === g.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(g, "rejected")} disabled={processing === g.id}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(g.id)} disabled={processing === g.id}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Group Details</DialogTitle>
            <DialogDescription>Review group submission</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{selected.name}</p></div>
                <div><p className="text-sm text-muted-foreground">Slug</p><p className="font-medium">{selected.slug}</p></div>
                <div><p className="text-sm text-muted-foreground">Category</p><p className="font-medium capitalize">{selected.category.replace("_", " ")}</p></div>
                <div><p className="text-sm text-muted-foreground">Privacy</p><p className="font-medium capitalize">{selected.privacy}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p>{getStatusBadge(selected.status)}</div>
              </div>
              <div><p className="text-sm text-muted-foreground">Description</p><p className="text-sm whitespace-pre-line">{selected.description}</p></div>
              {selected.cover_image_url && (
                <div><p className="text-sm text-muted-foreground">Cover</p><img src={selected.cover_image_url} alt="" className="rounded max-h-40 mt-1" /></div>
              )}
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

export default AdminGroupManagement;